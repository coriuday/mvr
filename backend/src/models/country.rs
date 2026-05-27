use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

// ─── DB Row ──────────────────────────────────────────────────────────────────

/// Full database row for a country.  `content` is a JSONB blob that mirrors
/// the `CountryData` TypeScript interface in the frontend.
#[derive(Debug, Clone, Serialize, FromRow)]
pub struct Country {
    pub id: Uuid,
    pub slug: String,
    pub name: String,
    pub flag: String,
    pub tagline: String,
    pub image_url: Option<String>,
    pub hero_image_url: Option<String>,
    pub content: sqlx::types::Json<serde_json::Value>,
    pub sort_order: i32,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Lightweight card representation returned by the listing endpoint.
/// Does NOT include `content` JSONB — avoids sending megabytes of data
/// for the /countries grid which only needs card-level fields.
#[derive(Debug, Clone, Serialize)]
pub struct CountryCard {
    pub slug: String,
    pub name: String,
    pub flag: String,
    pub tagline: String,
    pub image_url: Option<String>,
}

impl From<Country> for CountryCard {
    fn from(c: Country) -> Self {
        Self {
            slug: c.slug,
            name: c.name,
            flag: c.flag,
            tagline: c.tagline,
            image_url: c.image_url,
        }
    }
}

// ─── Request types ────────────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct CreateCountryRequest {
    pub slug: String,
    pub name: String,
    pub flag: String,
    pub tagline: Option<String>,
    pub image_url: Option<String>,
    pub hero_image_url: Option<String>,
    /// The full CountryData JSON as a free-form value
    pub content: Option<serde_json::Value>,
    pub sort_order: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateCountryRequest {
    pub name: Option<String>,
    pub flag: Option<String>,
    pub tagline: Option<String>,
    pub image_url: Option<String>,
    pub hero_image_url: Option<String>,
    pub content: Option<serde_json::Value>,
    pub sort_order: Option<i32>,
    pub is_active: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct CountryFilter {
    pub is_active: Option<bool>,
    pub page: Option<i64>,
    pub per_page: Option<i64>,
}
