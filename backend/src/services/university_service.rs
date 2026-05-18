use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    models::university::{CreateUniversityRequest, University, UniversityFilter},
    repositories::university_repository::UniversityRepository,
    utils::errors::{AppError, AppResult},
};

pub struct UniversityService {
    repo: UniversityRepository,
}

impl UniversityService {
    pub fn new(db: PgPool) -> Self {
        Self {
            repo: UniversityRepository::new(db),
        }
    }

    pub async fn get_all(&self, filter: &UniversityFilter) -> AppResult<(Vec<University>, i64)> {
        self.repo.find_all(filter).await
    }

    pub async fn get_by_id(&self, id: Uuid) -> AppResult<University> {
        self.repo.find_by_id(id).await
    }

    pub async fn create(&self, req: &CreateUniversityRequest) -> AppResult<University> {
        if req.name.trim().is_empty() {
            return Err(AppError::BadRequest(
                "University name is required".to_string(),
            ));
        }
        self.repo.create(req).await
    }

    pub async fn update_featured(&self, id: Uuid, featured: bool) -> AppResult<University> {
        self.repo.update_featured(id, featured).await
    }

    pub async fn delete(&self, id: Uuid) -> AppResult<()> {
        self.repo.delete(id).await
    }
}
