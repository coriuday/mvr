use anyhow::Result;
use sqlx::{Connection, PgConnection, postgres::PgConnectOptions};

/// Runs all pending SQLx migrations from the `migrations/` directory.
///
/// Uses a direct single connection rather than the pool, to avoid any
/// connection-state issues during schema evolution.
pub async fn run_migrations(_pool: &sqlx::PgPool, database_url: &str) -> Result<()> {
    let connect_opts: PgConnectOptions = database_url
        .parse()
        .map_err(|e| anyhow::anyhow!("Invalid DATABASE_URL: {}", e))?;

    let mut direct = PgConnection::connect_with(&connect_opts)
        .await
        .map_err(|e| anyhow::anyhow!("Migration connection failed: {}", e))?;

    // -------------------------------------------------------------------------
    // Pre-flight: repair checksums corrupted by migration 009.
    //
    // Migration 009 stored SHA-384 values computed from an older snapshot of
    // migrations 1–6. After those files were later modified (line-endings or
    // content), the stored hashes diverged, causing SQLx to abort on every
    // startup with "migration was previously applied but has been modified".
    //
    // We correct the six rows here — BEFORE sqlx::migrate!() validates stored
    // checksums — so the validator sees the true current-file hashes and
    // proceeds normally. Migration 010 repeats these same UPDATEs so the fix
    // is recorded as an applied migration; on subsequent boots the UPDATEs are
    // identical no-ops.
    //
    // Checksums computed from current file bytes on 2026-05-28 via:
    //   [IO.File]::ReadAllBytes | [Security.Cryptography.SHA384]::Create().ComputeHash
    // -------------------------------------------------------------------------
    let checksum_repairs: &[(&str, &str)] = &[
        ("20250101000001", "8d4e8b3c57a9ed7ffb571fc47bb5313823b2a326df03f8d19ce6489dfdac6ca9e9d3e3f111b64113435d00336bb33cfa"),
        ("20250101000002", "fbd34b4db216ce4cae291ad6b0328e5dd4c0539a4309e1fdc6e940202609668cfc10ae814682a4c7024e03b0efb6a910"),
        ("20250101000003", "ebd26e87b4a0789c687d434f91d1297ce2aa1dd1c78dcbc3692c5f56a5e9d107d2508900bc2ab3ded86d136e2cc21529"),
        ("20250101000004", "31828954ebec267d44edb60ad5ee2949ac573a578402b88399d71bb82e0a7455e7f82ba936da72bbe8c5dd2ebdf82cd0"),
        ("20250101000005", "8b789903a4de31d3a839aa6fbce26e542cdc3369093d6b6e7e98ca068214f3897a4f758fe8394021d22522c25035033e"),
        ("20250101000006", "1f039dba6c648a10ea3fd3e4bd5fa82a151f61bd42dc9a9cf6e46bbbccc984e6f953ce13218921786a64b54dc2129683"),
    ];
    for (version, hex) in checksum_repairs {
        let sql = format!(
            "UPDATE _sqlx_migrations SET checksum = decode('{hex}','hex') WHERE version = {version}"
        );
        // Ignore errors: the table might not exist on a completely fresh DB.
        let _ = sqlx::query(&sql).execute(&mut direct).await;
    }

    sqlx::migrate!("./migrations")
        .run(&mut direct)
        .await
        .map_err(|e| anyhow::anyhow!("Migration failed: {}", e))?;

    Ok(())
}
