use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, FromRow)]
pub struct University {
    pub id: Uuid,
    pub name: String,
    pub country: String,
    pub ranking: Option<i32>,
    pub logo_url: Option<String>,
    pub description: Option<String>,
    pub website_url: Option<String>,
    pub is_featured: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateUniversityRequest {
    pub name: String,
    pub country: String,
    pub ranking: Option<i32>,
    pub logo_url: Option<String>,
    pub description: Option<String>,
    pub website_url: Option<String>,
    pub is_featured: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct UniversityFilter {
    pub country: Option<String>,
    pub is_featured: Option<bool>,
    pub page: Option<i64>,
    pub per_page: Option<i64>,
}
