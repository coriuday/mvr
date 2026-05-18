use axum::{
    middleware,
    routing::{delete, get, post, put},
    Router,
};
use sqlx::PgPool;
use tower_http::trace::TraceLayer;

use crate::{
    config::env::Config,
    middleware::{auth_middleware, cors_middleware},
    utils::response::health_handler,
};

pub mod admin;
pub mod auth;
pub mod blogs;
pub mod contact;
pub use crate::handlers::lead_handler as leads;
pub mod scholarships;
pub mod testimonials;
pub mod universities;

/// Application state — shared across all handlers via Axum State extractor
#[derive(Debug, Clone)]
pub struct AppState {
    pub db: PgPool,
    pub config: Config,
}

/// Assembles the full Axum router with all route groups
pub fn create_router(db: PgPool, config: Config) -> Router {
    let state = AppState {
        db,
        config: config.clone(),
    };
    let cors = cors_middleware::build_cors_layer(&config.allowed_origins);

    Router::new()
        // Health check (public)
        .route("/health", get(health_handler))
        // Public API routes (no auth)
        .merge(public_routes())
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
fn public_routes() -> Router<AppState> {
    Router::new()
        // Auth
        .route("/api/auth/login", post(auth::login))
        .route("/api/auth/refresh", post(auth::refresh_token))
        // Public blog routes
        .route("/api/blogs", get(blogs::get_all_blogs))
        .route("/api/blogs/{slug}", get(blogs::get_blog_by_slug))
        // Public university routes
        .route("/api/universities", get(universities::get_all_universities))
        // Public scholarship routes
        .route("/api/scholarships", get(scholarships::get_all_scholarships))
        // Public testimonial routes
        .route("/api/testimonials", get(testimonials::get_all_testimonials))
        // Contact form
        .route("/api/contact", post(contact::send_contact))
        // Public lead creation (inquiry form)
        .route("/api/leads", post(leads::create_lead))
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
        .route("/api/leads/{id}", get(leads::get_lead))
        .route("/api/leads/{id}", put(leads::update_lead))
        .route("/api/leads/{id}", delete(leads::delete_lead))
        // Blog management
        .route("/api/blogs", post(blogs::create_blog))
        .route("/api/blogs/{id}", put(blogs::update_blog))
        .route("/api/blogs/{id}", delete(blogs::delete_blog))
        // University management
        .route("/api/universities", post(universities::create_university))
        .route("/api/universities/{id}", put(universities::update_university))
        .route("/api/universities/{id}", delete(universities::delete_university))
        // Scholarship management
        .route("/api/scholarships", post(scholarships::create_scholarship))
        .route("/api/scholarships/{id}", put(scholarships::update_scholarship))
        // Testimonial management
        .route("/api/testimonials", post(testimonials::create_testimonial))
        .route("/api/testimonials/{id}", put(testimonials::update_testimonial))
        // User registration (admin creates accounts)
        .route("/api/auth/register", post(auth::register))
        .layer(middleware::from_fn_with_state(
            state,
            auth_middleware::require_admin,
        ))
}
