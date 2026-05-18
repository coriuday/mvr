use anyhow::Result;
use sqlx::{postgres::PgConnectOptions, Connection, PgConnection};

/// Runs all pending SQLx migrations from the `migrations/` directory.
///
/// Uses a direct single connection rather than the pool, to avoid any
/// connection-state issues during schema evolution.
pub async fn run_migrations(_pool: &sqlx::PgPool, database_url: &str) -> Result<()> {
    let connect_opts: PgConnectOptions = database_url
        .parse()
        .map_err(|e| anyhow::anyhow!("Invalid DATABASE_URL: {}", e))?;

    let mut direct = PgConnection::connect_with(&connect_opts).await
        .map_err(|e| anyhow::anyhow!("Migration connection failed: {}", e))?;

    sqlx::migrate!("./migrations")
        .run(&mut direct)
        .await
        .map_err(|e| anyhow::anyhow!("Migration failed: {}", e))?;

    Ok(())
}

