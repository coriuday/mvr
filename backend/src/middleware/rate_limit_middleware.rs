use std::{
    collections::HashMap,
    net::IpAddr,
    sync::{Arc, Mutex},
    time::{Duration, Instant},
};

use axum::{
    extract::{ConnectInfo, Request, State},
    http::StatusCode,
    middleware::Next,
    response::{IntoResponse, Response},
};
use serde_json::json;

// ── Token-bucket state per IP ────────────────────────────────────────────────

#[derive(Debug, Clone)]
struct Bucket {
    /// Tokens currently available (fractional accumulation is fine as f64).
    tokens: f64,
    /// Last time this bucket was refilled.
    last_refill: Instant,
}

impl Bucket {
    fn new(capacity: f64) -> Self {
        Self {
            tokens: capacity,
            last_refill: Instant::now(),
        }
    }

    /// Refill tokens proportionally to elapsed time and consume one token.
    /// Returns `true` if the request is allowed, `false` if rate-limited.
    fn consume(&mut self, capacity: f64, refill_per_sec: f64) -> bool {
        let now = Instant::now();
        let elapsed = now.duration_since(self.last_refill).as_secs_f64();
        self.tokens = (self.tokens + elapsed * refill_per_sec).min(capacity);
        self.last_refill = now;

        if self.tokens >= 1.0 {
            self.tokens -= 1.0;
            true
        } else {
            false
        }
    }
}

// ── Shared limiter state ─────────────────────────────────────────────────────

#[derive(Debug, Clone)]
pub struct RateLimiterState {
    buckets: Arc<Mutex<HashMap<IpAddr, Bucket>>>,
    /// Maximum tokens per IP (= burst capacity).
    capacity: f64,
    /// Tokens added per second (steady-state throughput).
    refill_per_sec: f64,
}

impl RateLimiterState {
    pub fn new(capacity: u32, refill_per_sec: f64) -> Self {
        Self {
            buckets: Arc::new(Mutex::new(HashMap::new())),
            capacity: capacity as f64,
            refill_per_sec,
        }
    }

    fn is_allowed(&self, ip: IpAddr) -> bool {
        let mut map = self.buckets.lock().unwrap();
        let bucket = map
            .entry(ip)
            .or_insert_with(|| Bucket::new(self.capacity));
        bucket.consume(self.capacity, self.refill_per_sec)
    }
}

// ── IP extraction helper ─────────────────────────────────────────────────────

/// Extracts the real client IP.
/// Prefers the first value in `X-Forwarded-For` (set by Nginx in production)
/// and falls back to the TCP socket address (useful in local dev).
fn extract_ip(request: &Request) -> IpAddr {
    if let Some(forwarded) = request
        .headers()
        .get("X-Forwarded-For")
        .and_then(|v| v.to_str().ok())
    {
        if let Some(first) = forwarded.split(',').next() {
            if let Ok(ip) = first.trim().parse::<IpAddr>() {
                return ip;
            }
        }
    }

    // Fall back to the TCP connect info (available in local dev / direct connections)
    request
        .extensions()
        .get::<ConnectInfo<std::net::SocketAddr>>()
        .map(|ci| ci.0.ip())
        .unwrap_or(IpAddr::from([127, 0, 0, 1]))
}

// ── 429 response ─────────────────────────────────────────────────────────────

fn too_many_requests(endpoint: &str) -> Response {
    let body = axum::Json(json!({
        "success": false,
        "error": {
            "code": "RATE_LIMITED",
            "message": format!(
                "Too many requests to {}. Please wait a moment and try again.",
                endpoint
            )
        }
    }));
    (StatusCode::TOO_MANY_REQUESTS, body).into_response()
}

// ── Middleware functions ─────────────────────────────────────────────────────

/// Rate limiter for POST /api/auth/login
/// Config: 5 attempts burst, then 1 attempt per 10 seconds.
/// Rationale: stops brute-force without blocking a user who fat-fingers once.
pub async fn rate_limit_login(
    State(limiter): State<RateLimiterState>,
    request: Request,
    next: Next,
) -> Response {
    let ip = extract_ip(&request);
    if !limiter.is_allowed(ip) {
        tracing::warn!("Rate limit hit on /api/auth/login from {ip}");
        return too_many_requests("/api/auth/login");
    }
    next.run(request).await
}

/// Rate limiter for POST /api/contact
/// Config: 3 submissions burst, then 1 per 30 seconds.
/// Rationale: prevents spam/bot submissions while allowing a human to retry.
pub async fn rate_limit_contact(
    State(limiter): State<RateLimiterState>,
    request: Request,
    next: Next,
) -> Response {
    let ip = extract_ip(&request);
    if !limiter.is_allowed(ip) {
        tracing::warn!("Rate limit hit on /api/contact from {ip}");
        return too_many_requests("/api/contact");
    }
    next.run(request).await
}

/// Rate limiter for POST /api/leads
/// Config: 5 submissions burst, then 1 per 20 seconds.
/// Rationale: a legitimate user might submit for multiple family members;
///            still blocks automated scrapers.
pub async fn rate_limit_leads(
    State(limiter): State<RateLimiterState>,
    request: Request,
    next: Next,
) -> Response {
    let ip = extract_ip(&request);
    if !limiter.is_allowed(ip) {
        tracing::warn!("Rate limit hit on /api/leads from {ip}");
        return too_many_requests("/api/leads");
    }
    next.run(request).await
}

/// Rate limiter for POST /api/newsletter/subscribe
/// Config: 2 attempts burst, then 1 per 60 seconds.
pub async fn rate_limit_newsletter(
    State(limiter): State<RateLimiterState>,
    request: Request,
    next: Next,
) -> Response {
    let ip = extract_ip(&request);
    if !limiter.is_allowed(ip) {
        tracing::warn!("Rate limit hit on /api/newsletter/subscribe from {ip}");
        return too_many_requests("/api/newsletter/subscribe");
    }
    next.run(request).await
}

/// Rate limiter for POST /api/sop/review
/// Config: 3 attempts burst, then 1 per 120 seconds.
/// Rationale: each AI call costs ~$0.0003; 1 per 2 min prevents cost-based abuse.
pub async fn rate_limit_sop(
    State(limiter): State<RateLimiterState>,
    request: Request,
    next: Next,
) -> Response {
    let ip = extract_ip(&request);
    if !limiter.is_allowed(ip) {
        tracing::warn!("Rate limit hit on /api/sop/review from {ip}");
        return too_many_requests("/api/sop/review");
    }
    next.run(request).await
}


/// Returns a limiter sized for login: 5-burst, 1 req / 10 s per IP.
pub fn login_limiter() -> RateLimiterState {
    RateLimiterState::new(5, 0.1) // 0.1 token/sec = 1 per 10 s
}

/// Returns a limiter sized for contact form: 3-burst, 1 req / 30 s per IP.
pub fn contact_limiter() -> RateLimiterState {
    RateLimiterState::new(3, 1.0 / 30.0)
}

/// Returns a limiter sized for lead submission: 5-burst, 1 req / 20 s per IP.
pub fn leads_limiter() -> RateLimiterState {
    RateLimiterState::new(5, 1.0 / 20.0)
}

/// Returns a limiter sized for newsletter subscribe: 2-burst, 1 req / 60 s per IP.
/// Newsletter is a once-per-session action — stricter than contact.
pub fn newsletter_limiter() -> RateLimiterState {
    RateLimiterState::new(2, 1.0 / 60.0)
}

/// Returns a limiter sized for SOP AI review: 3-burst, 1 req / 120 s per IP.
/// AI calls cost money — aggressive throttling prevents cost abuse while
/// allowing a student to re-submit after editing their SOP.
pub fn sop_limiter() -> RateLimiterState {
    RateLimiterState::new(3, 1.0 / 120.0)
}

// ── Periodic eviction task ────────────────────────────────────────────────────

/// Spawns a Tokio background task that prunes IPs whose buckets have not been
/// touched in more than 10 minutes.  This prevents unbounded memory growth on
/// long-running servers without needing an external cache.
pub fn spawn_eviction_task(state: RateLimiterState) {
    tokio::spawn(async move {
        let interval = Duration::from_secs(600); // run every 10 minutes
        let max_idle = Duration::from_secs(600);
        loop {
            tokio::time::sleep(interval).await;
            let mut map = state.buckets.lock().unwrap();
            let before = map.len();
            map.retain(|_, bucket| bucket.last_refill.elapsed() < max_idle);
            let removed = before - map.len();
            if removed > 0 {
                tracing::debug!("Rate limiter eviction: removed {removed} idle IP buckets");
            }
        }
    });
}
