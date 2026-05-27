use sqlx::PgPool;
use uuid::Uuid;
use crate::{
    models::lead::{CreateLeadRequest, Lead, LeadFilter, UpdateLeadRequest},
    repositories::lead_repository::LeadRepository,
    utils::{
        errors::AppResult,
        validators::{validate_email, validate_length, validate_required},
    },
};

pub struct LeadService {
    db: PgPool,
}

impl LeadService {
    pub fn new(db: PgPool) -> Self {
        Self { db }
    }

    /// Validate and persist a new public-facing lead inquiry.
    pub async fn create_inquiry(&self, body: &CreateLeadRequest) -> AppResult<Lead> {
        validate_required(&body.name, "Name")?;
        validate_length(&body.name, "Name", 2, 100)?;
        validate_email(&body.email)?;
        LeadRepository::new(self.db.clone()).create(body).await
    }

    /// List all leads with pagination (admin).
    pub async fn list(&self, filter: &LeadFilter) -> AppResult<(Vec<Lead>, i64)> {
        LeadRepository::new(self.db.clone()).find_all(filter).await
    }

    /// Fetch a single lead by ID (admin).
    pub async fn get_by_id(&self, id: Uuid) -> AppResult<Lead> {
        LeadRepository::new(self.db.clone()).find_by_id(id).await
    }

    /// Update lead status/notes/assignment (admin).
    pub async fn update(&self, id: Uuid, body: &UpdateLeadRequest) -> AppResult<Lead> {
        LeadRepository::new(self.db.clone()).update(id, body).await
    }

    /// Delete a lead (admin).
    pub async fn delete(&self, id: Uuid) -> AppResult<()> {
        LeadRepository::new(self.db.clone()).delete(id).await
    }
}
