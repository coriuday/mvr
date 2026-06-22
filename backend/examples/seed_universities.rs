//! Seed universities from `universities_seed.json` (generated from frontend data).
//! Usage: cargo run --example seed_universities
//!
//! Regenerate JSON after editing frontend/src/data/universities.ts:
//!   cd frontend && node scripts/export-universities-seed.mjs

use serde::Deserialize;
use sqlx::postgres::PgPoolOptions;

#[derive(Debug, Deserialize)]
struct SeedUniversity {
    id: String,
    name: String,
    country: String,
    flag: String,
    ranking: String,
    fees: String,
    intake: String,
    duration: String,
    scholarship: String,
    ielts: String,
    #[serde(rename = "ieltsMin")]
    ielts_min: f64,
    #[serde(rename = "gpaMin")]
    gpa_min: f64,
    #[serde(rename = "annualTuitionUsd")]
    annual_tuition_usd: i32,
    programs: Vec<String>,
    description: String,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();

    let json = include_str!("universities_seed.json");
    let unis: Vec<SeedUniversity> = serde_json::from_str(json)?;

    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let pool = PgPoolOptions::new()
        .max_connections(2)
        .connect(&database_url)
        .await?;

    let mut count = 0usize;
    for (i, u) in unis.iter().enumerate() {
        let updated = sqlx::query(
            r#"
            UPDATE universities SET
                name = $2, country = $3, flag = $4, ranking = $5, fees = $6,
                intake = $7, duration = $8, scholarship = $9, ielts = $10,
                ielts_min = $11, gpa_min = $12, annual_tuition_usd = $13,
                programs = $14, description = $15, is_featured = $16,
                is_active = TRUE, updated_at = NOW()
            WHERE slug = $1
            "#,
        )
        .bind(&u.id)
        .bind(&u.name)
        .bind(&u.country)
        .bind(&u.flag)
        .bind(&u.ranking)
        .bind(&u.fees)
        .bind(&u.intake)
        .bind(&u.duration)
        .bind(&u.scholarship)
        .bind(&u.ielts)
        .bind(u.ielts_min)
        .bind(u.gpa_min)
        .bind(u.annual_tuition_usd)
        .bind(&u.programs)
        .bind(&u.description)
        .bind(i < 8)
        .execute(&pool)
        .await?;

        if updated.rows_affected() == 0 {
            sqlx::query(
                r#"
                INSERT INTO universities (
                    slug, name, country, flag, ranking, fees, intake, duration, scholarship,
                    ielts, ielts_min, gpa_min, annual_tuition_usd, programs,
                    description, is_featured, is_active
                )
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,TRUE)
                "#,
            )
            .bind(&u.id)
            .bind(&u.name)
            .bind(&u.country)
            .bind(&u.flag)
            .bind(&u.ranking)
            .bind(&u.fees)
            .bind(&u.intake)
            .bind(&u.duration)
            .bind(&u.scholarship)
            .bind(&u.ielts)
            .bind(u.ielts_min)
            .bind(u.gpa_min)
            .bind(u.annual_tuition_usd)
            .bind(&u.programs)
            .bind(&u.description)
            .bind(i < 8)
            .execute(&pool)
            .await?;
        }

        println!("✅ {} — {}", u.id, u.name);
        count += 1;
    }

    println!("\nSeeded {count} universities.");
    Ok(())
}
