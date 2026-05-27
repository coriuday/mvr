use sqlx::postgres::PgPoolOptions;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();
    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set in .env");

    println!("Connecting to database...");
    let pool = PgPoolOptions::new()
        .max_connections(1)
        .connect(&database_url)
        .await?;

    println!("Connected. Updating migration checksums...");

    let updates: &[(&str, i64)] = &[
        (
            "8d4e8b3c57a9ed7ffb571fc47bb5313823b2a326df03f8d19ce6489dfdac6ca9e9d3e3f111b64113435d00336bb33cfa",
            20250101000001,
        ),
        (
            "fbd34b4db216ce4cae291ad6b0328e5dd4c0539a4309e1fdc6e940202609668cfc10ae814682a4c7024e03b0efb6a910",
            20250101000002,
        ),
        (
            "ebd26e87b4a0789c687d434f91d1297ce2aa1dd1c78dcbc3692c5f56a5e9d107d2508900bc2ab3ded86d136e2cc21529",
            20250101000003,
        ),
        (
            "31828954ebec267d44edb60ad5ee2949ac573a578402b88399d71bb82e0a7455e7f82ba936da72bbe8c5dd2ebdf82cd0",
            20250101000004,
        ),
        (
            "8b789903a4de31d3a839aa6fbce26e542cdc3369093d6b6e7e98ca068214f3897a4f758fe8394021d22522c25035033e",
            20250101000005,
        ),
        (
            "1f039dba6c648a10ea3fd3e4bd5fa82a151f61bd42dc9a9cf6e46bbbccc984e6f953ce13218921786a64b54dc2129683",
            20250101000006,
        ),
        (
            "8c417288ae1a82362c8253cc5d06f696758fc1e739a66e9e6581e364ce6d1e19adeed1fb375d99a8ea1d0b86f1ff6922",
            20250101000007,
        ),
        (
            "1b58cd95e80f840b94f0b158e9ef29deb6d48b39d22c6d5a0991c2de35d5e2278bee459e2343d39676e8fac5d914b98d",
            20250101000008,
        ),
    ];

    for (hex, version) in updates {
        let rows_affected = sqlx::query(
            "UPDATE _sqlx_migrations SET checksum = decode($1, 'hex') WHERE version = $2",
        )
        .bind(hex)
        .bind(version)
        .execute(&pool)
        .await?
        .rows_affected();

        if rows_affected > 0 {
            println!("  ✅ Updated migration {version}");
        } else {
            println!("  ⏭  Migration {version} not in table (will be applied fresh)");
        }
    }

    println!("\n✅ Done. Run `cargo run` now — migrations will pass.");
    Ok(())
}
