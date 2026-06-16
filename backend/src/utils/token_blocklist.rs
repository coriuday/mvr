use std::{
    collections::HashMap,
    sync::{Arc, RwLock},
    time::{Duration, Instant},
};

/// In-memory store for revoked JWT IDs (JTIs).
///
/// When a user logs out, the access token's `jti` is inserted here with its
/// remaining TTL. Every authenticated request checks the blocklist after
/// verifying the token signature — this prevents a stolen token from being
/// used after the legitimate user has logged out.
///
/// Design notes:
///   - Uses `RwLock` so the hot-path (reads) are non-contending.
///   - Entry TTL = token's original `exp` timestamp, so entries are never
///     kept longer than the token would have been valid anyway.
///   - A background eviction task (spawned once at startup) prunes stale
///     entries every 5 minutes, preventing unbounded memory growth.
///   - Single-process only — acceptable for the current Render free tier
///     (single instance). Upgrade path: replace the inner HashMap with a
///     Redis call when horizontal scaling is required.
#[derive(Debug, Clone)]
pub struct TokenBlocklist {
    // jti → eviction Instant (when the original token expires)
    inner: Arc<RwLock<HashMap<String, Instant>>>,
}

impl TokenBlocklist {
    pub fn new() -> Self {
        Self {
            inner: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    /// Revoke a token identified by its `jti`.
    ///
    /// `exp_unix` is the Unix timestamp from the token's `exp` claim.
    /// We convert it to an `Instant` so the eviction task can compare
    /// cheaply without touching a clock abstraction.
    pub fn block(&self, jti: String, exp_unix: i64) {
        let now_unix = chrono::Utc::now().timestamp();
        let secs_remaining = (exp_unix - now_unix).max(0) as u64;
        let evict_at = Instant::now() + Duration::from_secs(secs_remaining);

        if let Ok(mut map) = self.inner.write() {
            map.insert(jti, evict_at);
        }
    }

    /// Returns `true` if the JTI has been revoked (token is blocked).
    pub fn is_blocked(&self, jti: &str) -> bool {
        if let Ok(map) = self.inner.read() {
            match map.get(jti) {
                Some(&evict_at) => {
                    // Entry present — it is blocked (eviction task hasn't cleaned it yet)
                    Instant::now() < evict_at
                }
                None => false,
            }
        } else {
            // If the lock is poisoned, fail open (allow the request) rather
            // than taking the whole service down. This is the safer tradeoff
            // here — a blocked token slipping through once is better than DoS.
            false
        }
    }

    /// Spawns a Tokio background task that prunes expired JTIs every 5 minutes.
    pub fn spawn_eviction_task(&self) {
        let inner = self.inner.clone();
        tokio::spawn(async move {
            let interval = Duration::from_secs(300); // 5 minutes
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
                            "Token blocklist eviction completed"
                        );
                    }
                }
            }
        });
    }
}

impl Default for TokenBlocklist {
    fn default() -> Self {
        Self::new()
    }
}
