//! Seed countries from frontend JSON files into Postgres.
//! Usage: cargo run --example seed_countries
//!
//! Reads `../frontend/src/data/countries/*.json` relative to the backend crate.

use std::path::PathBuf;

use serde_json::Value;
use sqlx::postgres::PgPoolOptions;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();

    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let pool = PgPoolOptions::new()
        .max_connections(2)
        .connect(&database_url)
        .await?;

    let data_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../frontend/src/data/countries");

    if !data_dir.exists() {
        anyhow::bail!("Country data directory not found: {}", data_dir.display());
    }

    let mut count = 0usize;
    let mut order = 0i32;

    let mut entries: Vec<_> = std::fs::read_dir(&data_dir)?
        .filter_map(|e| e.ok())
        .collect();
    entries.sort_by_key(|e| e.file_name());

    for entry in entries {
        let path = entry.path();
        if path.extension().and_then(|s| s.to_str()) != Some("json") {
            continue;
        }

        let raw = std::fs::read_to_string(&path)?;
        let json: Value = serde_json::from_str(&raw)?;

        let slug = json["slug"].as_str().unwrap_or_default().to_string();
        let name = json["name"].as_str().unwrap_or_default().to_string();
        let flag = json["flag"].as_str().unwrap_or("🌍").to_string();
        let tagline = json["tagline"].as_str().unwrap_or("").to_string();
        let hero_image = json["heroImage"].as_str().map(String::from);

        let image_url = json["images"]
            .as_array()
            .and_then(|arr| arr.first())
            .and_then(|v| v.as_str())
            .map(String::from)
            .or_else(|| hero_image.clone());

        // Content blob — everything except top-level scalar columns
        let content = serde_json::json!({
            "description": json.get("description").cloned().unwrap_or(Value::String(String::new())),
            "images": json.get("images").cloned().unwrap_or(Value::Array(vec![])),
            "stats": json.get("stats").cloned().unwrap_or(Value::Object(Default::default())),
            "tuitionFees": json.get("tuitionFees").cloned().unwrap_or(Value::Object(Default::default())),
            "scholarships": json.get("scholarships").cloned().unwrap_or(Value::Array(vec![])),
            "visaRequirements": json.get("visaRequirements").cloned().unwrap_or(Value::Object(Default::default())),
            "workPermit": json.get("workPermit").cloned().unwrap_or(Value::Object(Default::default())),
            "popularPrograms": json.get("popularPrograms").cloned().unwrap_or(Value::Array(vec![])),
            "languageRequirements": json.get("languageRequirements").cloned().unwrap_or(Value::Object(Default::default())),
            "topUniversities": json.get("topUniversities").cloned().unwrap_or(Value::Array(vec![])),
            "faqs": json.get("faqs").cloned().unwrap_or(Value::Array(vec![])),
        });

        order += 1;

        sqlx::query(
            r#"
            INSERT INTO countries
              (slug, name, flag, tagline, image_url, hero_image_url, content, sort_order, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE)
            ON CONFLICT (slug) DO UPDATE SET
              name           = EXCLUDED.name,
              flag           = EXCLUDED.flag,
              tagline        = EXCLUDED.tagline,
              image_url      = EXCLUDED.image_url,
              hero_image_url = EXCLUDED.hero_image_url,
              content        = EXCLUDED.content,
              sort_order     = EXCLUDED.sort_order,
              is_active      = TRUE,
              updated_at     = NOW()
            "#,
        )
        .bind(&slug)
        .bind(&name)
        .bind(&flag)
        .bind(&tagline)
        .bind(&image_url)
        .bind(&hero_image)
        .bind(sqlx::types::Json(content))
        .bind(order)
        .execute(&pool)
        .await?;

        println!("✅ {slug} — {name}");
        count += 1;
    }

    println!("\nSeeded {count} countries.");
    Ok(())
}
