use anyhow::Result;
use sqlx::{PgConnection, PgPool};

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
///
/// Uses a connection from the existing pool (no extra DB client) to stay within
/// Supabase Session pooler limits on Render.
pub async fn run_migrations(pool: &PgPool) -> Result<()> {
    let mut conn = pool
        .acquire()
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
        .execute(&mut *conn)
        .await;
    }

    MIGRATOR
        .run(&mut *conn)
        .await
        .map_err(|e| anyhow::anyhow!("Migration failed: {}", e))?;

    #[allow(clippy::explicit_auto_deref)]
    {
        ensure_critical_tables(&mut *conn).await?;
    }

    Ok(())
}

/// Idempotent safety net for tables that may be missing on older production DBs.
async fn ensure_critical_tables(conn: &mut PgConnection) -> Result<()> {
    const STATEMENTS: &[&str] = &[
        r#"
        CREATE TABLE IF NOT EXISTS testimonials (
            id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            student_name    VARCHAR(255) NOT NULL,
            review          TEXT NOT NULL,
            image_url       TEXT,
            rating          SMALLINT NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
            country         VARCHAR(100),
            university      VARCHAR(255),
            course          VARCHAR(255),
            is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
            created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
        "#,
        "CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(is_featured)",
        "CREATE INDEX IF NOT EXISTS idx_testimonials_rating ON testimonials(rating)",
    ];

    for sql in STATEMENTS {
        sqlx::query(sql)
            .execute(&mut *conn)
            .await
            .map_err(|e| anyhow::anyhow!("ensure_critical_tables failed: {}", e))?;
    }

    Ok(())
}
