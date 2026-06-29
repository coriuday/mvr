use anyhow::Result;
use sqlx::{PgPool, postgres::PgPoolOptions};
use std::time::Duration;

/// Creates a SQLx PostgreSQL connection pool connected to Supabase.
/// Uses PgBouncer-compatible settings (statement_cache_capacity = 0) to work
/// correctly with Supabase's connection pooler.
pub async fn create_pool(database_url: &str) -> Result<PgPool> {
    let is_production = std::env::var("ENVIRONMENT")
        .map(|e| e == "production")
        .unwrap_or(false);

    let max_connections = std::env::var("DATABASE_POOL_SIZE")
        .ok()
        .and_then(|s| s.trim().parse().ok())
        .unwrap_or(if is_production { 5 } else { 10 });

    let min_connections = if is_production { 0 } else { 1 };

    let pool = PgPoolOptions::new()
        .max_connections(max_connections)
        .min_connections(min_connections)
        .acquire_timeout(Duration::from_secs(30))
        .idle_timeout(Duration::from_secs(600))
        .max_lifetime(Duration::from_secs(1800))
        // IMPORTANT: Disable statement caching for PgBouncer compatibility
        .connect_with(
            database_url
                .parse::<sqlx::postgres::PgConnectOptions>()?
                .statement_cache_capacity(0),
        )
        .await?;

    Ok(pool)
}
