use anyhow::Result;
use serde::Deserialize;
use serde_json::Value;
use sqlx::PgPool;

/// Seed universities and countries when tables are sparse (partial production DB).
pub async fn seed_if_empty(pool: &PgPool) -> Result<()> {
    const MIN_UNIVERSITIES: i64 = 50;
    const MIN_COUNTRIES: i64 = 20;

    let uni_count: i64 = sqlx::query_scalar("SELECT COUNT(*)::bigint FROM universities")
        .fetch_one(pool)
        .await?;
    if uni_count < MIN_UNIVERSITIES {
        let n = seed_universities(pool).await?;
        tracing::info!(
            "Seeded {n} universities (had {uni_count}, expected at least {MIN_UNIVERSITIES})"
        );
    }

    let country_count: i64 = sqlx::query_scalar("SELECT COUNT(*)::bigint FROM countries")
        .fetch_one(pool)
        .await?;
    if country_count < MIN_COUNTRIES {
        let n = seed_countries(pool).await?;
        tracing::info!(
            "Seeded {n} countries (had {country_count}, expected at least {MIN_COUNTRIES})"
        );
    }

    Ok(())
}

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

async fn seed_universities(pool: &PgPool) -> Result<usize> {
    let json = include_str!("../../examples/universities_seed.json");
    let unis: Vec<SeedUniversity> = serde_json::from_str(json)?;

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
        .execute(pool)
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
            .execute(pool)
            .await?;
        }
    }

    Ok(unis.len())
}

async fn seed_countries(pool: &PgPool) -> Result<usize> {
    let json = include_str!("../../examples/countries_seed.json");
    let entries: Vec<Value> = serde_json::from_str(json)?;
    let mut count = 0usize;

    for (i, entry) in entries.iter().enumerate() {
        let slug = entry["slug"].as_str().unwrap_or_default();
        let name = entry["name"].as_str().unwrap_or_default();
        let flag = entry["flag"].as_str().unwrap_or("🌍");
        let tagline = entry["tagline"].as_str().unwrap_or("");
        let hero_image = entry["heroImage"].as_str().map(String::from);
        let image_url = entry["images"]
            .as_array()
            .and_then(|arr| arr.first())
            .and_then(|v| v.as_str())
            .map(String::from)
            .or_else(|| hero_image.clone());

        let content = serde_json::json!({
            "description": entry.get("description").cloned().unwrap_or(Value::String(String::new())),
            "images": entry.get("images").cloned().unwrap_or(Value::Array(vec![])),
            "stats": entry.get("stats").cloned().unwrap_or(Value::Object(Default::default())),
            "tuitionFees": entry.get("tuitionFees").cloned().unwrap_or(Value::Object(Default::default())),
            "scholarships": entry.get("scholarships").cloned().unwrap_or(Value::Array(vec![])),
            "visaRequirements": entry.get("visaRequirements").cloned().unwrap_or(Value::Object(Default::default())),
            "workPermit": entry.get("workPermit").cloned().unwrap_or(Value::Object(Default::default())),
            "popularPrograms": entry.get("popularPrograms").cloned().unwrap_or(Value::Array(vec![])),
            "languageRequirements": entry.get("languageRequirements").cloned().unwrap_or(Value::Object(Default::default())),
            "topUniversities": entry.get("topUniversities").cloned().unwrap_or(Value::Array(vec![])),
            "faqs": entry.get("faqs").cloned().unwrap_or(Value::Array(vec![])),
        });

        let sort_order = (i + 1) as i32;

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
        .bind(slug)
        .bind(name)
        .bind(flag)
        .bind(tagline)
        .bind(&image_url)
        .bind(&hero_image)
        .bind(sqlx::types::Json(content))
        .bind(sort_order)
        .execute(pool)
        .await?;

        count += 1;
    }

    Ok(count)
}
