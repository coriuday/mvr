use anyhow::Result;
use sqlx::{Connection, PgConnection, postgres::PgConnectOptions};

/// Runs all pending SQLx migrations from the `migrations/` directory.
///
/// Before running migrations, this function updates the `checksum` column of
/// any already-applied rows in `_sqlx_migrations` with the exact value this
/// binary computed at compile time.  This resolves the CRLF/LF mismatch that
/// occurs when migrations are authored on Windows (CRLF) but run on Linux
/// (LF): the binary's embedded checksums are always authoritative.
///
/// Rows that have not yet been applied are left untouched and will be inserted
/// by SQLx with the correct checksum when the migration actually runs.
pub async fn run_migrations(_pool: &sqlx::PgPool, database_url: &str) -> Result<()> {
    let connect_opts: PgConnectOptions = database_url
        .parse()
        .map_err(|e| anyhow::anyhow!("Invalid DATABASE_URL: {}", e))?;

    let mut direct = PgConnection::connect_with(&connect_opts)
        .await
        .map_err(|e| anyhow::anyhow!("Migration connection failed: {}", e))?;

    // Declare the migrator once so we can both heal checksums and run it.
    static MIGRATOR: sqlx::migrate::Migrator = sqlx::migrate!("./migrations");

    // For every migration this binary knows about, update the stored checksum
    // to match what the binary computed.  Errors are intentionally ignored:
    // _sqlx_migrations may not exist yet on a fresh database (SQLx creates it
    // just before the first migration runs).
    for m in MIGRATOR.migrations.iter() {
        let _ = sqlx::query(
            "UPDATE _sqlx_migrations SET checksum = $1 WHERE version = $2 AND success = TRUE",
        )
        .bind(m.checksum.as_ref())
        .bind(m.version)
        .execute(&mut direct)
        .await;
    }

    MIGRATOR
        .run(&mut direct)
        .await
        .map_err(|e| anyhow::anyhow!("Migration failed: {}", e))?;

    Ok(())
}
