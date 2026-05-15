use anyhow::Result;
use sqlx::PgPool;

/// Runs all pending SQLx migrations from the `migrations/` directory.
/// Migrations are embedded at compile time via the `sqlx::migrate!()` macro.
pub async fn run_migrations(pool: &PgPool) -> Result<()> {
    sqlx::migrate!("./migrations")
        .run(pool)
        .await
        .map_err(|e| anyhow::anyhow!("Migration failed: {}", e))?;

    Ok(())
}
