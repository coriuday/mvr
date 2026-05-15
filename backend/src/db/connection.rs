use anyhow::Result;
use sqlx::{postgres::PgPoolOptions, PgPool};
use std::time::Duration;

/// Creates a SQLx PostgreSQL connection pool connected to Supabase.
/// Uses PgBouncer-compatible settings (statement_cache_capacity = 0) to work
/// correctly with Supabase's connection pooler.
pub async fn create_pool(database_url: &str) -> Result<PgPool> {
    let pool = PgPoolOptions::new()
        .max_connections(20)
        .min_connections(2)
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
