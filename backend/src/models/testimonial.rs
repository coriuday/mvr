use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, FromRow)]
#[allow(dead_code)]
pub struct Testimonial {
    pub id: Uuid,
    pub student_name: String,
    pub review: String,
    pub image_url: Option<String>,
    pub rating: i32, // 1–5
    pub country: Option<String>,
    pub university: Option<String>,
    pub course: Option<String>,
    pub is_featured: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct TestimonialFilter {
    pub featured: Option<bool>,
}

#[derive(Debug, Deserialize)]
#[allow(dead_code)]
pub struct CreateTestimonialRequest {
    pub student_name: String,
    pub review: String,
    pub image_url: Option<String>,
    pub rating: i32,
    pub country: Option<String>,
    pub university: Option<String>,
    pub course: Option<String>,
    pub is_featured: Option<bool>,
}
