use std::net::SocketAddr;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod config;
mod db;
mod handlers;
mod middleware;
mod models;
mod repositories;
mod routes;
mod services;
mod utils;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // ---------------------------------------------------------------------------
    // Load environment variables from .env file
    // ---------------------------------------------------------------------------
    // Load environment variables from .env file (local dev only).
    // In production, env vars are set by the hosting platform (Render/Docker).
    // We use `.ok()` so a missing .env never crashes production, but we emit
    // an eprintln so a misconfigured local dev environment is visible.
    if let Err(e) = dotenvy::dotenv() {
        eprintln!("⚠️  .env not loaded: {e} (OK in production, check file exists in dev)");
    }

    // ---------------------------------------------------------------------------
    // Initialize structured logging
    // ---------------------------------------------------------------------------
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                // M-9 security fix: default avoids axum=trace which logs full request
                // headers (including auth cookies/tokens) to stdout.
                // In production, RUST_LOG=mvr_backend=info is sufficient.
                .unwrap_or_else(|_| "mvr_backend=info,tower_http=warn".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    // ---------------------------------------------------------------------------
    // Load application configuration
    // ---------------------------------------------------------------------------
    let config = config::env::Config::from_env()?;
    tracing::info!("🚀 Starting MVR Consultants API");
    tracing::info!("📦 Environment: {}", config.environment);

    // ---------------------------------------------------------------------------
    // Initialize database connection pool (Supabase PostgreSQL via SQLx)
    // ---------------------------------------------------------------------------
    let db_pool = db::connection::create_pool(&config.database_url).await?;
    tracing::info!("✅ Database connected");

    // ---------------------------------------------------------------------------
    // Run migrations
    // ---------------------------------------------------------------------------
    db::migrations::run_migrations(&db_pool, &config.database_url).await?;
    tracing::info!("✅ Migrations applied");

    db::seed::seed_if_empty(&db_pool).await?;
    tracing::info!("✅ Seed check complete");

    if config.resend_api_key.is_empty() {
        tracing::warn!(
            "RESEND_API_KEY is not set — contact form will save leads but will not send emails. \
             Add the key on Render and verify mvrconsultants.org in Resend (see backend/.env.example)."
        );
    } else if config.is_production() {
        tracing::info!(
            from = %config.email_from,
            to = %config.admin_email,
            "Resend email configured for contact form notifications"
        );
    }
    if config.cloudinary_api_secret.is_none() {
        tracing::warn!(
            "Cloudinary is not configured — admin image uploads will return 503 until \
             CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set"
        );
    }

    // ---------------------------------------------------------------------------
    // Build the Axum application router (async — connects to Redis if configured)
    // ---------------------------------------------------------------------------
    let app = routes::create_router(db_pool, config.clone()).await;

    // ---------------------------------------------------------------------------
    // Start the server
    // ---------------------------------------------------------------------------
    let addr: SocketAddr = format!("{}:{}", config.host, config.port)
        .parse()
        .expect("Invalid host/port configuration");

    tracing::info!("🌐 Server listening on http://{}", addr);
    tracing::info!("📋 Health check: http://{}/health", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(
        listener,
        app.into_make_service_with_connect_info::<SocketAddr>(),
    )
    .await?;

    Ok(())
}
