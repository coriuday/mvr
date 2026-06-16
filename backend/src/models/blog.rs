use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, FromRow)]
pub struct Blog {
    pub id: Uuid,
    pub title: String,
    pub slug: String,
    pub content: String,
    pub excerpt: Option<String>,
    pub image_url: Option<String>,
    pub published: bool,
    pub author_id: Option<Uuid>,
    /// Joined from users table — NULL when author_id is NULL or user deleted
    pub author_name: Option<String>,
    pub meta_title: Option<String>,
    pub meta_description: Option<String>,
    pub tags: Vec<String>,
    /// e.g. "Visa Guide", "Scholarships", "Country Guide" — NULL = frontend default
    pub category: Option<String>,
    /// e.g. "5 min read" — computed from word count at insert/update time
    pub read_time: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateBlogRequest {
    pub title: String,
    pub slug: String,
    pub content: String,
    pub excerpt: Option<String>,
    pub image_url: Option<String>,
    pub published: Option<bool>,
    pub meta_title: Option<String>,
    pub meta_description: Option<String>,
    pub tags: Option<Vec<String>>,
    pub category: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateBlogRequest {
    pub title: Option<String>,
    pub slug: Option<String>,
    pub content: Option<String>,
    pub excerpt: Option<String>,
    pub image_url: Option<String>,
    pub published: Option<bool>,
    pub meta_title: Option<String>,
    pub meta_description: Option<String>,
    pub tags: Option<Vec<String>>,
    pub category: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct BlogFilter {
    pub published: Option<bool>,
    pub page: Option<i64>,
    pub per_page: Option<i64>,
}
