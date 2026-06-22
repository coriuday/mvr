use axum::{
    Router, middleware,
    routing::{delete, get, patch, post, put},
};
use sqlx::PgPool;
use tower_http::trace::TraceLayer;

use crate::{
    config::env::Config,
    middleware::{
        auth_middleware, cors_middleware,
        rate_limit_middleware::{
            self, contact_limiter, leads_limiter, login_limiter, newsletter_limiter, sop_limiter,
        },
    },
    utils::{response::health_handler, token_blocklist::TokenBlocklist},
};

pub mod admin;
pub mod auth;
pub mod blogs;
pub mod cloudinary;
pub mod contact;
pub mod countries;
pub mod leads;
pub mod newsletter;
pub mod scholarships;
pub mod sop;
pub mod testimonials;
pub mod universities;
pub mod users;

/// Application state — shared across all handlers via Axum State extractor
#[derive(Debug, Clone)]
pub struct AppState {
    pub db: PgPool,
    pub config: Config,
    /// JTI blocklist for logout-based token revocation (C-1 fix: Redis-backed)
    pub blocklist: TokenBlocklist,
}

/// Assembles the full Axum router with all route groups.
///
/// Async because the Redis connection manager requires an async handshake.
pub async fn create_router(db: PgPool, config: Config) -> Router {
    // C-1 fix: Redis blocklist in production; in-memory fallback only in dev
    let blocklist = match TokenBlocklist::new(config.redis_url.as_deref()).await {
        Ok(bl) => bl,
        Err(e) if config.is_production() => {
            panic!(
                "REDIS_URL is set but connection failed in production: {e}. \
                 Fix Redis or update REDIS_URL in Render dashboard."
            );
        }
        Err(e) => {
            tracing::error!(
                error = %e,
                "Failed to connect to Redis — falling back to in-memory blocklist (dev only). \
                 Revoked tokens will not survive a restart."
            );
            TokenBlocklist::new(None)
                .await
                .expect("in-memory blocklist init is infallible")
        }
    };
    blocklist.spawn_eviction_task();

    let state = AppState {
        db,
        config: config.clone(),
        blocklist,
    };
    let cors = cors_middleware::build_cors_layer(&config.allowed_origins);

    // Build independent limiters and start the eviction background task
    let trust_proxy = config.trust_proxy_headers;
    let login_lim = login_limiter(trust_proxy);
    let contact_lim = contact_limiter(trust_proxy);
    let leads_lim = leads_limiter(trust_proxy);
    let newsletter_lim = newsletter_limiter(trust_proxy);
    let sop_lim = sop_limiter(trust_proxy);
    rate_limit_middleware::spawn_eviction_task(login_lim.clone());
    rate_limit_middleware::spawn_eviction_task(contact_lim.clone());
    rate_limit_middleware::spawn_eviction_task(leads_lim.clone());
    rate_limit_middleware::spawn_eviction_task(newsletter_lim.clone());
    rate_limit_middleware::spawn_eviction_task(sop_lim.clone());

    Router::new()
        // Health check (public)
        .route("/health", get(health_handler))
        // Public API routes (no auth)
        .merge(public_routes(
            login_lim,
            contact_lim,
            leads_lim,
            newsletter_lim,
            sop_lim,
        ))
        // Protected routes (JWT required)
        .merge(protected_routes(state.clone()))
        // Admin routes (ADMIN role required)
        .merge(admin_routes(state.clone()))
        // Global middleware
        .layer(TraceLayer::new_for_http())
        .layer(cors)
        .with_state(state)
}

/// Public routes — no authentication required
fn public_routes(
    login_lim: rate_limit_middleware::RateLimiterState,
    contact_lim: rate_limit_middleware::RateLimiterState,
    leads_lim: rate_limit_middleware::RateLimiterState,
    newsletter_lim: rate_limit_middleware::RateLimiterState,
    sop_lim: rate_limit_middleware::RateLimiterState,
) -> Router<AppState> {
    Router::new()
        .route(
            "/api/auth/refresh",
            post(auth::refresh_token).route_layer(middleware::from_fn_with_state(
                login_lim.clone(),
                rate_limit_middleware::rate_limit_refresh,
            )),
        )
        // Auth — rate-limited (brute-force protection)
        .route(
            "/api/auth/login",
            post(auth::login).route_layer(middleware::from_fn_with_state(
                login_lim,
                rate_limit_middleware::rate_limit_login,
            )),
        )
        .route("/api/auth/clear", post(auth::clear_session))
        // Public blog routes
        .route("/api/blogs", get(blogs::get_all_blogs))
        .route("/api/blogs/:id", get(blogs::get_blog_by_slug))
        // Public university routes
        .route("/api/universities", get(universities::get_all_universities))
        .route(
            "/api/universities/:id",
            get(universities::get_university_by_slug),
        )
        // Public scholarship routes
        .route("/api/scholarships", get(scholarships::get_all_scholarships))
        // Public testimonial routes
        .route("/api/testimonials", get(testimonials::get_all_testimonials))
        // Contact form — rate-limited (spam protection)
        .route(
            "/api/contact",
            post(contact::send_contact).route_layer(middleware::from_fn_with_state(
                contact_lim,
                rate_limit_middleware::rate_limit_contact,
            )),
        )
        // Public lead creation — rate-limited (bot protection)
        .route(
            "/api/leads",
            post(leads::create_lead).route_layer(middleware::from_fn_with_state(
                leads_lim,
                rate_limit_middleware::rate_limit_leads,
            )),
        )
        // Public countries listing and detail
        .route("/api/countries", get(countries::get_all_countries))
        .route("/api/countries/:slug", get(countries::get_country_by_slug))
        // Newsletter subscribe — rate-limited (spam protection)
        .route(
            "/api/newsletter/subscribe",
            post(newsletter::subscribe).route_layer(middleware::from_fn_with_state(
                newsletter_lim,
                rate_limit_middleware::rate_limit_newsletter,
            )),
        )
        // SOP AI review — rate-limited aggressively (AI calls cost money)
        .route(
            "/api/sop/review",
            post(sop::review_sop).route_layer(middleware::from_fn_with_state(
                sop_lim,
                rate_limit_middleware::rate_limit_sop,
            )),
        )
}

/// Protected routes — require valid JWT (any role)
fn protected_routes(state: AppState) -> Router<AppState> {
    Router::new()
        .route("/api/auth/logout", post(auth::logout))
        .route("/api/auth/me", get(auth::get_me))
        .layer(middleware::from_fn_with_state(
            state,
            auth_middleware::require_auth,
        ))
}

/// Admin routes — require ADMIN role
fn admin_routes(state: AppState) -> Router<AppState> {
    Router::new()
        // Admin stats
        .route("/api/admin/stats", get(admin::get_stats))
        .route("/api/admin/recent-leads", get(admin::get_recent_leads))
        // Lead management
        .route("/api/leads", get(leads::get_all_leads))
        .route("/api/leads/:id", get(leads::get_lead))
        .route("/api/leads/:id", put(leads::update_lead))
        .route("/api/leads/:id", delete(leads::delete_lead))
        // Blog management (admin uses UUID; public GET uses slug — separate routes)
        .route("/api/admin/blogs", get(blogs::admin_get_all_blogs))
        .route("/api/blogs", post(blogs::create_blog))
        .route("/api/blogs/:id", put(blogs::update_blog))
        .route("/api/blogs/:id", delete(blogs::delete_blog))
        // University management
        .route(
            "/api/admin/universities",
            get(universities::admin_list_universities),
        )
        .route("/api/universities", post(universities::create_university))
        .route(
            "/api/universities/:id",
            put(universities::update_university),
        )
        .route(
            "/api/universities/:id",
            delete(universities::delete_university),
        )
        // Scholarship management
        .route("/api/scholarships", post(scholarships::create_scholarship))
        .route(
            "/api/scholarships/:id",
            put(scholarships::update_scholarship),
        )
        .route(
            "/api/scholarships/:id",
            delete(scholarships::delete_scholarship),
        )
        // Testimonial management
        .route("/api/testimonials", post(testimonials::create_testimonial))
        .route(
            "/api/testimonials/:id",
            put(testimonials::update_testimonial),
        )
        .route(
            "/api/testimonials/:id",
            delete(testimonials::delete_testimonial),
        )
        // Country management (admin)
        .route("/api/admin/countries", get(countries::admin_list_countries))
        .route("/api/admin/countries", post(countries::create_country))
        .route("/api/admin/countries/:id", put(countries::update_country))
        .route(
            "/api/admin/countries/:id",
            delete(countries::delete_country),
        )
        // Newsletter subscriber management (admin)
        .route("/api/admin/newsletter", get(newsletter::list_subscribers))
        // User registration (admin creates accounts) + role management (C-2 fix)
        .route("/api/auth/register", post(auth::register))
        .route("/api/admin/users", get(users::list_users))
        .route("/api/admin/users/:id/role", put(users::update_role))
        .route("/api/admin/users/:id/active", patch(users::update_active))
        // Cloudinary signed upload (H-2 fix: no more unsigned preset abuse)
        .route("/api/admin/cloudinary/sign", post(cloudinary::sign_upload))
        .layer(middleware::from_fn_with_state(
            state,
            auth_middleware::require_admin,
        ))
}
