//! Seed blogs, scholarships, and testimonials from JSON into Postgres.
//! Usage: cargo run --example seed_content
//!
//! Reads `../frontend/src/data/seed/content.json` relative to the backend crate.

use std::path::PathBuf;

use serde::Deserialize;
use sqlx::postgres::PgPoolOptions;

#[derive(Debug, Deserialize)]
struct SeedFile {
    blogs: Vec<SeedBlog>,
    scholarships: Vec<SeedScholarship>,
    testimonials: Vec<SeedTestimonial>,
}

#[derive(Debug, Deserialize)]
struct SeedBlog {
    slug: String,
    title: String,
    category: String,
    excerpt: String,
    content: String,
    tags: Vec<String>,
    read_time: String,
}

#[derive(Debug, Deserialize)]
struct SeedScholarship {
    name: String,
    scholarship_type: String,
    country: String,
    amount: Option<String>,
    deadline: Option<String>,
    description: Option<String>,
    eligibility: Option<String>,
    apply_url: Option<String>,
    is_featured: bool,
}

#[derive(Debug, Deserialize)]
struct SeedTestimonial {
    student_name: String,
    review: String,
    rating: i16,
    country: Option<String>,
    university: Option<String>,
    course: Option<String>,
    is_featured: bool,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();

    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let pool = PgPoolOptions::new()
        .max_connections(2)
        .connect(&database_url)
        .await?;

    let seed_path =
        PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../frontend/src/data/seed/content.json");

    if !seed_path.exists() {
        anyhow::bail!("Seed file not found: {}", seed_path.display());
    }

    let raw = std::fs::read_to_string(&seed_path)?;
    let seed: SeedFile = serde_json::from_str(&raw)?;

    let mut blogs = 0usize;
    for blog in &seed.blogs {
        sqlx::query(
            r#"
            INSERT INTO blogs
              (title, slug, content, excerpt, published, tags, category, read_time)
            VALUES ($1, $2, $3, $4, TRUE, $5, $6, $7)
            ON CONFLICT (slug) DO UPDATE SET
              title     = EXCLUDED.title,
              content   = EXCLUDED.content,
              excerpt   = EXCLUDED.excerpt,
              published = TRUE,
              tags      = EXCLUDED.tags,
              category  = EXCLUDED.category,
              read_time = EXCLUDED.read_time,
              updated_at = NOW()
            "#,
        )
        .bind(&blog.title)
        .bind(&blog.slug)
        .bind(&blog.content)
        .bind(&blog.excerpt)
        .bind(&blog.tags)
        .bind(&blog.category)
        .bind(&blog.read_time)
        .execute(&pool)
        .await?;
        blogs += 1;
    }

    let mut scholarships = 0usize;
    for s in &seed.scholarships {
        let exists: bool = sqlx::query_scalar(
            "SELECT EXISTS(SELECT 1 FROM scholarships WHERE name = $1 AND country = $2)",
        )
        .bind(&s.name)
        .bind(&s.country)
        .fetch_one(&pool)
        .await?;

        if exists {
            continue;
        }

        sqlx::query(
            r#"
            INSERT INTO scholarships
              (name, scholarship_type, country, amount, deadline, description, eligibility, apply_url, is_featured)
            VALUES ($1, $2::scholarship_type, $3, $4, $5::date, $6, $7, $8, $9)
            "#,
        )
        .bind(&s.name)
        .bind(&s.scholarship_type)
        .bind(&s.country)
        .bind(&s.amount)
        .bind(s.deadline.as_deref())
        .bind(&s.description)
        .bind(&s.eligibility)
        .bind(&s.apply_url)
        .bind(s.is_featured)
        .execute(&pool)
        .await?;
        scholarships += 1;
    }

    let mut testimonials = 0usize;
    for t in &seed.testimonials {
        let exists: bool = sqlx::query_scalar(
            "SELECT EXISTS(SELECT 1 FROM testimonials WHERE student_name = $1 AND review = $2)",
        )
        .bind(&t.student_name)
        .bind(&t.review)
        .fetch_one(&pool)
        .await?;

        if exists {
            continue;
        }

        sqlx::query(
            r#"
            INSERT INTO testimonials
              (student_name, review, rating, country, university, course, is_featured)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            "#,
        )
        .bind(&t.student_name)
        .bind(&t.review)
        .bind(t.rating)
        .bind(&t.country)
        .bind(&t.university)
        .bind(&t.course)
        .bind(t.is_featured)
        .execute(&pool)
        .await?;
        testimonials += 1;
    }

    println!(
        "Seeded content: {blogs} blogs upserted, {scholarships} scholarships inserted, {testimonials} testimonials inserted."
    );
    println!("Source: {}", seed_path.display());

    Ok(())
}
