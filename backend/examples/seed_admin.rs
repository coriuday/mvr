//! Seed or reset the admin user with a freshly-generated Argon2 hash.
//! Usage: cargo run --example seed_admin -- "YourPassword"

use argon2::{
    Argon2,
    password_hash::{PasswordHasher, SaltString, rand_core::OsRng},
};
use sqlx::postgres::PgPoolOptions;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();

    let password = std::env::args().nth(1).unwrap_or_else(|| {
        eprintln!("Usage: cargo run --example seed_admin -- \"YourPassword\"");
        std::process::exit(1);
    });

    // Hash with the same Argon2id config the backend uses
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let hash = argon2
        .hash_password(password.as_bytes(), &salt)
        .map_err(|e| anyhow::anyhow!("Hashing failed: {e}"))?
        .to_string();

    println!("Generated hash: {hash}");

    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set in .env");

    let pool = PgPoolOptions::new()
        .max_connections(1)
        .connect(&database_url)
        .await?;

    // Upsert: insert if not exists, update password if already exists
    let rows = sqlx::query(
        r#"
        INSERT INTO users (name, email, password_hash, role)
        VALUES ('Admin', 'admin@mvrconsultants.com', $1, 'ADMIN')
        ON CONFLICT (email) DO UPDATE
            SET password_hash = EXCLUDED.password_hash,
                role           = 'ADMIN'
        "#,
    )
    .bind(&hash)
    .execute(&pool)
    .await?
    .rows_affected();

    println!("✅ Admin user upserted ({rows} row affected)");
    println!("   Email:    admin@mvrconsultants.com");
    println!("   Password: {password}");
    println!("\nYou can now login at http://localhost:3000/admin/login");
    Ok(())
}
