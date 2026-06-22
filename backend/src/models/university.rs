use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct University {
    pub id: Uuid,
    pub slug: Option<String>,
    pub name: String,
    pub country: String,
    pub flag: Option<String>,
    pub ranking: Option<String>,
    pub fees: Option<String>,
    pub intake: Option<String>,
    pub duration: Option<String>,
    pub scholarship: Option<String>,
    pub ielts: Option<String>,
    pub ielts_min: Option<f64>,
    pub gpa_min: Option<f64>,
    pub annual_tuition_usd: Option<i32>,
    #[sqlx(default)]
    pub programs: Vec<String>,
    pub logo_url: Option<String>,
    pub description: Option<String>,
    pub website_url: Option<String>,
    pub is_featured: bool,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateUniversityRequest {
    pub slug: Option<String>,
    pub name: String,
    pub country: String,
    pub flag: Option<String>,
    pub ranking: Option<String>,
    pub fees: Option<String>,
    pub intake: Option<String>,
    pub duration: Option<String>,
    pub scholarship: Option<String>,
    pub ielts: Option<String>,
    pub ielts_min: Option<f64>,
    pub gpa_min: Option<f64>,
    pub annual_tuition_usd: Option<i32>,
    pub programs: Option<Vec<String>>,
    pub logo_url: Option<String>,
    pub description: Option<String>,
    pub website_url: Option<String>,
    pub is_featured: Option<bool>,
    pub is_active: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct UniversityFilter {
    pub country: Option<String>,
    pub is_featured: Option<bool>,
    pub page: Option<i64>,
    pub per_page: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateUniversityRequest {
    pub slug: Option<String>,
    pub name: Option<String>,
    pub country: Option<String>,
    pub flag: Option<String>,
    pub ranking: Option<String>,
    pub fees: Option<String>,
    pub intake: Option<String>,
    pub duration: Option<String>,
    pub scholarship: Option<String>,
    pub ielts: Option<String>,
    pub ielts_min: Option<f64>,
    pub gpa_min: Option<f64>,
    pub annual_tuition_usd: Option<i32>,
    pub programs: Option<Vec<String>>,
    pub logo_url: Option<String>,
    pub description: Option<String>,
    pub website_url: Option<String>,
    pub is_featured: Option<bool>,
    pub is_active: Option<bool>,
}
