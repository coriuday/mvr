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
    axum::serve(listener, app).await?;

    Ok(())
}
