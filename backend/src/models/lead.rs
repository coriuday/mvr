use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type, PartialEq)]
#[sqlx(type_name = "lead_status", rename_all = "SCREAMING_SNAKE_CASE")]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum LeadStatus {
    New,
    Contacted,
    InProgress,
    Converted,
    Rejected,
}

/// Lead source (how the inquiry came in)
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type, PartialEq)]
#[sqlx(type_name = "lead_source", rename_all = "SCREAMING_SNAKE_CASE")]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum LeadSource {
    Website,
    Referral,
    SocialMedia,
    PhoneCall,
    WalkIn,
    Other,
}

#[derive(Debug, Clone, Serialize, FromRow)]
pub struct Lead {
    pub id: Uuid,
    pub name: String,
    pub email: String,
    pub phone: Option<String>,
    pub message: Option<String>,
    pub status: LeadStatus,
    pub source: LeadSource,
    pub country_interest: Option<String>,
    pub assigned_to: Option<Uuid>, // Counselor user ID
    pub notes: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateLeadRequest {
    pub name: String,
    pub email: String,
    pub phone: Option<String>,
    pub message: Option<String>,
    pub country_interest: Option<String>,
    pub source: Option<LeadSource>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateLeadRequest {
    pub status: Option<LeadStatus>,
    pub assigned_to: Option<Uuid>,
    pub notes: Option<String>,
    pub phone: Option<String>,
}

#[derive(Debug, Deserialize, Default)]
pub struct LeadFilter {
    pub status: Option<LeadStatus>,
    pub page: Option<i64>,
    pub per_page: Option<i64>,
}
