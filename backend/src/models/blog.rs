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
    pub meta_title: Option<String>,
    pub meta_description: Option<String>,
    pub tags: Vec<String>,
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
}

#[derive(Debug, Deserialize)]
pub struct BlogFilter {
    pub published: Option<bool>,
    pub page: Option<i64>,
    pub per_page: Option<i64>,
}
