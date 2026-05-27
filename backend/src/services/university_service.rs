use crate::{
    models::university::{CreateUniversityRequest, University, UniversityFilter},
    repositories::university_repository::UniversityRepository,
    utils::errors::{AppError, AppResult},
};
use sqlx::PgPool;
use uuid::Uuid;

/// Typed body for updating a university's featured flag.
/// Previously this was parsed from raw `serde_json::Value` in the route handler.
#[derive(Debug, serde::Deserialize)]
pub struct UpdateUniversityRequest {
    pub is_featured: Option<bool>,
}

pub struct UniversityService {
    db: PgPool,
}

impl UniversityService {
    pub fn new(db: PgPool) -> Self {
        Self { db }
    }

    /// List universities with optional country / featured filtering (public).
    pub async fn list(&self, filter: &UniversityFilter) -> AppResult<(Vec<University>, i64)> {
        UniversityRepository::new(self.db.clone())
            .find_all(filter)
            .await
    }

    /// Validate and create a new university record (admin).
    pub async fn create(&self, body: &CreateUniversityRequest) -> AppResult<University> {
        if body.name.trim().is_empty() {
            return Err(AppError::BadRequest(
                "University name is required".to_string(),
            ));
        }
        UniversityRepository::new(self.db.clone())
            .create(body)
            .await
    }

    /// Update the featured flag of a university (admin).
    pub async fn update_featured(
        &self,
        id: Uuid,
        body: &UpdateUniversityRequest,
    ) -> AppResult<University> {
        let featured = body.is_featured.unwrap_or(false);
        UniversityRepository::new(self.db.clone())
            .update_featured(id, featured)
            .await
    }

    /// Delete a university record (admin).
    pub async fn delete(&self, id: Uuid) -> AppResult<()> {
        UniversityRepository::new(self.db.clone()).delete(id).await
    }
}
