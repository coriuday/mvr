use axum::{
    middleware,
    routing::{delete, get, post, put},
    Router,
};
use sqlx::PgPool;
use tower_http::trace::TraceLayer;

use crate::{
    config::env::Config,
    middleware::{
        auth_middleware, cors_middleware,
        rate_limit_middleware::{
            self, contact_limiter, leads_limiter, login_limiter,
            newsletter_limiter, sop_limiter,
        },
    },
    utils::response::health_handler,
};

pub mod admin;
pub mod auth;
pub mod blogs;
pub mod contact;
pub mod countries;
pub mod leads;
pub mod newsletter;
pub mod scholarships;
pub mod sop;
pub mod testimonials;
pub mod universities;

/// Application state — shared across all handlers via Axum State extractor
#[derive(Debug, Clone)]
pub struct AppState {
    pub db: PgPool,
    pub config: Config,
}

/// Assembles the full Axum router with all route groups.
/// Returns a `IntoMakeServiceWithConnectInfo<Router>` so that TCP socket
/// addresses are available to the rate-limit middleware as an IP fallback.
pub fn create_router(db: PgPool, config: Config) -> Router {
    let state = AppState {
        db,
        config: config.clone(),
    };
    let cors = cors_middleware::build_cors_layer(&config.allowed_origins);

    // Build independent limiters and start the eviction background task
    let login_lim      = login_limiter();
    let contact_lim    = contact_limiter();
    let leads_lim      = leads_limiter();
    let newsletter_lim = newsletter_limiter();
    let sop_lim        = sop_limiter();
    rate_limit_middleware::spawn_eviction_task(login_lim.clone());
    rate_limit_middleware::spawn_eviction_task(contact_lim.clone());
    rate_limit_middleware::spawn_eviction_task(leads_lim.clone());
    rate_limit_middleware::spawn_eviction_task(newsletter_lim.clone());
    rate_limit_middleware::spawn_eviction_task(sop_lim.clone());

    Router::new()
        // Health check (public)
        .route("/health", get(health_handler))
        // Public API routes (no auth)
        .merge(public_routes(login_lim, contact_lim, leads_lim, newsletter_lim, sop_lim))
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
    login_lim:      rate_limit_middleware::RateLimiterState,
    contact_lim:    rate_limit_middleware::RateLimiterState,
    leads_lim:      rate_limit_middleware::RateLimiterState,
    newsletter_lim: rate_limit_middleware::RateLimiterState,
    sop_lim:        rate_limit_middleware::RateLimiterState,
) -> Router<AppState> {
    Router::new()
        // Auth — rate-limited (brute-force protection)
        .route(
            "/api/auth/login",
            post(auth::login).route_layer(
                middleware::from_fn_with_state(login_lim, rate_limit_middleware::rate_limit_login),
            ),
        )
        .route("/api/auth/refresh", post(auth::refresh_token))
        // Public blog routes
        .route("/api/blogs", get(blogs::get_all_blogs))
        .route("/api/blogs/:slug", get(blogs::get_blog_by_slug))
        // Public university routes
        .route("/api/universities", get(universities::get_all_universities))
        // Public scholarship routes
        .route("/api/scholarships", get(scholarships::get_all_scholarships))
        // Public testimonial routes
        .route("/api/testimonials", get(testimonials::get_all_testimonials))
        // Contact form — rate-limited (spam protection)
        .route(
            "/api/contact",
            post(contact::send_contact).route_layer(
                middleware::from_fn_with_state(
                    contact_lim,
                    rate_limit_middleware::rate_limit_contact,
                ),
            ),
        )
        // Public lead creation — rate-limited (bot protection)
        .route(
            "/api/leads",
            post(leads::create_lead).route_layer(
                middleware::from_fn_with_state(
                    leads_lim,
                    rate_limit_middleware::rate_limit_leads,
                ),
            ),
        )
        // Public countries listing and detail
        .route("/api/countries", get(countries::get_all_countries))
        .route("/api/countries/:slug", get(countries::get_country_by_slug))
        // Newsletter subscribe — rate-limited (spam protection)
        .route(
            "/api/newsletter/subscribe",
            post(newsletter::subscribe).route_layer(
                middleware::from_fn_with_state(
                    newsletter_lim,
                    rate_limit_middleware::rate_limit_newsletter,
                ),
            ),
        )
        // SOP AI review — rate-limited aggressively (AI calls cost money)
        .route(
            "/api/sop/review",
            post(sop::review_sop).route_layer(
                middleware::from_fn_with_state(
                    sop_lim,
                    rate_limit_middleware::rate_limit_sop,
                ),
            ),
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
        // Blog management
        .route("/api/blogs", post(blogs::create_blog))
        .route("/api/blogs/:slug", put(blogs::update_blog))
        .route("/api/blogs/:slug", delete(blogs::delete_blog))
        // University management
        .route("/api/universities", post(universities::create_university))
        .route("/api/universities/:id", put(universities::update_university))
        .route("/api/universities/:id", delete(universities::delete_university))
        // Scholarship management
        .route("/api/scholarships", post(scholarships::create_scholarship))
        .route("/api/scholarships/:id", put(scholarships::update_scholarship))
        // Testimonial management
        .route("/api/testimonials", post(testimonials::create_testimonial))
        .route("/api/testimonials/:id", put(testimonials::update_testimonial))
        // Country management (admin)
        .route("/api/admin/countries", get(countries::admin_list_countries))
        .route("/api/admin/countries", post(countries::create_country))
        .route("/api/admin/countries/:id", put(countries::update_country))
        .route("/api/admin/countries/:id", delete(countries::delete_country))
        // Newsletter subscriber management (admin)
        .route("/api/admin/newsletter", get(newsletter::list_subscribers))
        // User registration (admin creates accounts)
        .route("/api/auth/register", post(auth::register))
        .layer(middleware::from_fn_with_state(
            state,
            auth_middleware::require_admin,
        ))
}
