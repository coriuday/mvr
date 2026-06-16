use std::{
    collections::HashMap,
    sync::{Arc, RwLock},
    time::{Duration, Instant},
};

// ─── Trait ───────────────────────────────────────────────────────────────────

/// Abstracts over the two blocklist backends (Redis and in-memory).
/// Each backend must be cheaply clonable so it can be stored in `AppState`.
#[derive(Debug, Clone)]
pub enum TokenBlocklist {
    /// C-1 security fix: Redis-backed blocklist that survives process restarts
    /// and works across multiple backend instances (e.g., horizontal scaling).
    Redis(RedisBlocklist),
    /// Fallback: in-process HashMap. Works for single-instance deployments where
    /// the restart-window risk is acceptable (e.g., short JWT TTLs, dev mode).
    /// A startup warning is printed when this mode is chosen.
    InMemory(InMemoryBlocklist),
}

impl TokenBlocklist {
    /// Creates the best available blocklist given an optional Redis URL.
    ///
    /// # Errors
    /// Returns `Err` only if a Redis URL is provided but the connection fails.
    /// If `redis_url` is `None`, always returns `Ok(InMemory(...))`.
    pub async fn new(redis_url: Option<&str>) -> Result<Self, redis::RedisError> {
        match redis_url {
            Some(url) => {
                let client = redis::Client::open(url)?;
                let manager = redis::aio::ConnectionManager::new(client).await?;
                tracing::info!("✅ Token blocklist: Redis backend active (C-1 fix)");
                Ok(TokenBlocklist::Redis(RedisBlocklist {
                    manager: Arc::new(tokio::sync::Mutex::new(manager)),
                }))
            }
            None => {
                tracing::warn!(
                    "⚠️  REDIS_URL not set — using in-memory token blocklist. \
                     Revoked tokens will become valid again after a process restart. \
                     Set REDIS_URL in production for C-1 compliance."
                );
                Ok(TokenBlocklist::InMemory(InMemoryBlocklist::new()))
            }
        }
    }

    /// Revoke a token identified by its JTI.
    /// `exp_unix` is the token's `exp` claim (Unix timestamp).
    pub async fn block(&self, jti: String, exp_unix: i64) {
        match self {
            TokenBlocklist::Redis(r) => r.block(jti, exp_unix).await,
            TokenBlocklist::InMemory(m) => m.block(jti, exp_unix),
        }
    }

    /// Returns `true` if the JTI has been revoked.
    pub async fn is_blocked(&self, jti: &str) -> bool {
        match self {
            TokenBlocklist::Redis(r) => r.is_blocked(jti).await,
            TokenBlocklist::InMemory(m) => m.is_blocked(jti),
        }
    }

    /// Spawns the background eviction task (only needed for in-memory backend).
    pub fn spawn_eviction_task(&self) {
        if let TokenBlocklist::InMemory(m) = self {
            m.spawn_eviction_task();
        }
        // Redis uses TTL-based expiry natively — no eviction task needed.
    }
}

// ─── Redis backend ───────────────────────────────────────────────────────────

/// Redis-backed JTI blocklist.
///
/// Each blocked JTI is stored as a Redis key with an automatic TTL equal to
/// the token's remaining lifetime. Redis evicts the key when the TTL expires,
/// so no periodic cleanup is needed.
///
/// Key format: `mvr:blocked_jti:<jti>`
/// Value: `"1"` (presence is the signal; value is irrelevant)
#[derive(Clone)]
pub struct RedisBlocklist {
    manager: Arc<tokio::sync::Mutex<redis::aio::ConnectionManager>>,
}

impl std::fmt::Debug for RedisBlocklist {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("RedisBlocklist").finish_non_exhaustive()
    }
}

impl RedisBlocklist {
    async fn block(&self, jti: String, exp_unix: i64) {
        let now_unix = chrono::Utc::now().timestamp();
        let secs_remaining = (exp_unix - now_unix).max(1) as u64;
        let key = format!("mvr:blocked_jti:{jti}");

        let mut conn = self.manager.lock().await;
        // SET key value EX ttl — key disappears automatically when token expires
        let result: redis::RedisResult<()> = redis::cmd("SET")
            .arg(&key)
            .arg("1")
            .arg("EX")
            .arg(secs_remaining)
            .query_async(&mut *conn)
            .await;

        if let Err(e) = result {
            tracing::error!(jti = %jti, error = %e, "Redis SET failed for blocked JTI");
        }
    }

    async fn is_blocked(&self, jti: &str) -> bool {
        let key = format!("mvr:blocked_jti:{jti}");
        let mut conn = self.manager.lock().await;
        let result: redis::RedisResult<bool> =
            redis::cmd("EXISTS").arg(&key).query_async(&mut *conn).await;

        match result {
            Ok(exists) => exists,
            Err(e) => {
                // Fail open on Redis errors: a single blocked token slipping through
                // is safer than taking the auth system down.
                tracing::error!(jti = %jti, error = %e, "Redis EXISTS failed for JTI check — failing open");
                false
            }
        }
    }
}

// ─── In-memory backend (fallback) ────────────────────────────────────────────

/// In-memory JTI blocklist.
///
/// This is the original single-process implementation, retained as a fallback
/// when Redis is unavailable (e.g., local development without Docker).
///
/// ⚠️  Revoked tokens survive only for the lifetime of the process.
/// A restart clears the blocklist. Acceptable when:
///   - JWT TTL is short (≤ 1 hour), or
///   - Running in a dev environment
#[derive(Debug, Clone)]
pub struct InMemoryBlocklist {
    // jti → Instant at which this entry can be evicted
    inner: Arc<RwLock<HashMap<String, Instant>>>,
}

impl InMemoryBlocklist {
    pub fn new() -> Self {
        Self {
            inner: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    fn block(&self, jti: String, exp_unix: i64) {
        let now_unix = chrono::Utc::now().timestamp();
        let secs_remaining = (exp_unix - now_unix).max(0) as u64;
        let evict_at = Instant::now() + Duration::from_secs(secs_remaining);

        if let Ok(mut map) = self.inner.write() {
            map.insert(jti, evict_at);
        }
    }

    fn is_blocked(&self, jti: &str) -> bool {
        if let Ok(map) = self.inner.read() {
            match map.get(jti) {
                Some(&evict_at) => Instant::now() < evict_at,
                None => false,
            }
        } else {
            // Poisoned lock — fail open (same as Redis error policy)
            false
        }
    }

    fn spawn_eviction_task(&self) {
        let inner = self.inner.clone();
        tokio::spawn(async move {
            let interval = Duration::from_secs(300); // every 5 minutes
            loop {
                tokio::time::sleep(interval).await;
                if let Ok(mut map) = inner.write() {
                    let now = Instant::now();
                    let before = map.len();
                    map.retain(|_, evict_at| *evict_at > now);
                    let removed = before - map.len();
                    if removed > 0 {
                        tracing::debug!(
                            blocklist.removed = removed,
                            blocklist.remaining = map.len(),
                            "In-memory token blocklist eviction completed"
                        );
                    }
                }
            }
        });
    }
}

impl Default for InMemoryBlocklist {
    fn default() -> Self {
        Self::new()
    }
}
