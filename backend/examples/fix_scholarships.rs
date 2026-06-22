//! Inspect and fix the scholarships table schema.
//! Usage: cargo run --example fix_scholarships

use sqlx::Row;
use sqlx::postgres::PgPoolOptions;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();
    let url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");

    let pool = PgPoolOptions::new()
        .max_connections(1)
        .connect(&url)
        .await?;

    println!("=== Scholarships table columns ===");
    let cols = sqlx::query(
        "SELECT column_name, data_type, is_nullable
         FROM information_schema.columns
         WHERE table_name = 'scholarships'
         ORDER BY ordinal_position",
    )
    .fetch_all(&pool)
    .await?;

    if cols.is_empty() {
        println!("❌ Table 'scholarships' does not exist!");
    } else {
        for row in &cols {
            let name: String = row.get(0);
            let dtype: String = row.get(1);
            let nullable: String = row.get(2);
            println!("  {name}  ({dtype}, nullable={nullable})");
        }
    }

    // Check if country column is missing and add it
    let has_country = cols.iter().any(|r| {
        let name: String = r.get(0);
        name == "country"
    });

    if !has_country {
        println!("\n⚠️  'country' column missing — adding it now...");
        sqlx::query(
            "ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS country VARCHAR(100) NOT NULL DEFAULT ''"
        )
        .execute(&pool)
        .await?;
        println!("✅ country column added");
    } else {
        println!("\n✅ 'country' column already exists");
    }

    // Also check/add scholarship_type column
    let has_type = cols.iter().any(|r| {
        let name: String = r.get(0);
        name == "scholarship_type"
    });
    if !has_type {
        println!(
            "⚠️  'scholarship_type' column missing — scholarships table may be completely wrong"
        );
    }

    Ok(())
}
