use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

// ── Status enum ───────────────────────────────────────────────────────────────

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "subscriber_status", rename_all = "lowercase")]
pub enum SubscriberStatus {
    Active,
    Unsubscribed,
}

// ── DB Row ────────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, FromRow)]
pub struct NewsletterSubscriber {
    pub id:              Uuid,
    pub email:           String,
    pub status:          SubscriberStatus,
    pub source:          String,
    pub confirmed_at:    Option<DateTime<Utc>>,
    pub subscribed_at:   DateTime<Utc>,
    pub unsubscribed_at: Option<DateTime<Utc>>,
    pub created_at:      DateTime<Utc>,
    pub updated_at:      DateTime<Utc>,
}

// ── Request types ─────────────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct SubscribeRequest {
    pub email:  String,
    /// Optional: homepage | blog | contact — defaults to "website"
    pub source: Option<String>,
}

/// The outcome of a subscribe attempt — used by the service to decide
/// which response message to return.
pub enum SubscribeOutcome {
    /// New subscriber created
    Created(NewsletterSubscriber),
    /// Email already exists with status = 'active'
    AlreadySubscribed,
    /// Email existed with status = 'unsubscribed' — we reactivated it
    Resubscribed(NewsletterSubscriber),
}
