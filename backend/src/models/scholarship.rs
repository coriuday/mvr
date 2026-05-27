use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type, PartialEq)]
#[sqlx(type_name = "scholarship_type", rename_all = "SCREAMING_SNAKE_CASE")]
pub enum ScholarshipType {
    MeritBased,
    NeedBased,
    Government,
    University,
    Private,
}

#[derive(Debug, Clone, Serialize, FromRow)]
#[allow(dead_code)]
pub struct Scholarship {
    pub id: Uuid,
    pub name: String,
    pub scholarship_type: ScholarshipType,
    pub country: String,
    pub amount: Option<String>, // String to support "Full Tuition", "$5,000", etc.
    pub deadline: Option<NaiveDate>,
    pub description: Option<String>,
    pub eligibility: Option<String>,
    pub apply_url: Option<String>,
    pub is_featured: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
#[allow(dead_code)]
pub struct CreateScholarshipRequest {
    pub name: String,
    pub scholarship_type: ScholarshipType,
    pub country: String,
    pub amount: Option<String>,
    pub deadline: Option<NaiveDate>,
    pub description: Option<String>,
    pub eligibility: Option<String>,
    pub apply_url: Option<String>,
    pub is_featured: Option<bool>,
}
