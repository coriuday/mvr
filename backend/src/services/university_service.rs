use crate::{
    models::university::{CreateUniversityRequest, University, UniversityFilter, UpdateUniversityRequest},
    repositories::university_repository::UniversityRepository,
    utils::errors::{AppError, AppResult},
};
use sqlx::PgPool;
use uuid::Uuid;

pub struct UniversityService {
    db: PgPool,
}

impl UniversityService {
    pub fn new(db: PgPool) -> Self {
        Self { db }
    }

    pub async fn list(&self, filter: &UniversityFilter) -> AppResult<(Vec<University>, i64)> {
        UniversityRepository::new(self.db.clone())
            .find_all(filter, true)
            .await
    }

    pub async fn list_admin(&self, filter: &UniversityFilter) -> AppResult<(Vec<University>, i64)> {
        UniversityRepository::new(self.db.clone())
            .find_all(filter, false)
            .await
    }

    pub async fn get_by_slug(&self, slug: &str) -> AppResult<University> {
        UniversityRepository::new(self.db.clone())
            .find_by_slug(slug, true)
            .await
    }

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

    pub async fn update(&self, id: Uuid, body: &UpdateUniversityRequest) -> AppResult<University> {
        UniversityRepository::new(self.db.clone())
            .update(id, body)
            .await
    }

    pub async fn delete(&self, id: Uuid) -> AppResult<()> {
        UniversityRepository::new(self.db.clone()).delete(id).await
    }
}
