use sqlx::PgPool;
use uuid::Uuid;
use crate::{
    models::country::{Country, CountryCard, CountryFilter, CreateCountryRequest, UpdateCountryRequest},
    repositories::country_repository::CountryRepository,
    utils::errors::{AppError, AppResult},
};

pub struct CountryService {
    db: PgPool,
}

impl CountryService {
    pub fn new(db: PgPool) -> Self {
        Self { db }
    }

    /// Public listing — lightweight cards sorted by sort_order.
    pub async fn list_active(&self) -> AppResult<Vec<CountryCard>> {
        CountryRepository::new(self.db.clone()).list_active().await
    }

    /// Public detail — full country data for a given slug.
    pub async fn get_by_slug(&self, slug: &str) -> AppResult<Country> {
        CountryRepository::new(self.db.clone()).find_by_slug(slug).await
    }

    /// Admin: paginated list of all countries.
    pub async fn list_all(&self, filter: &CountryFilter) -> AppResult<(Vec<Country>, i64)> {
        CountryRepository::new(self.db.clone()).find_all(filter).await
    }

    /// Admin: create a new country with validation.
    pub async fn create(&self, req: &CreateCountryRequest) -> AppResult<Country> {
        if req.slug.trim().is_empty() {
            return Err(AppError::BadRequest("Slug is required".to_string()));
        }
        if req.name.trim().is_empty() {
            return Err(AppError::BadRequest("Country name is required".to_string()));
        }
        if req.flag.trim().is_empty() {
            return Err(AppError::BadRequest("Flag emoji is required".to_string()));
        }
        CountryRepository::new(self.db.clone()).create(req).await
    }

    /// Admin: update an existing country.
    pub async fn update(&self, id: Uuid, req: &UpdateCountryRequest) -> AppResult<Country> {
        CountryRepository::new(self.db.clone()).update(id, req).await
    }

    /// Admin: delete a country.
    pub async fn delete(&self, id: Uuid) -> AppResult<()> {
        CountryRepository::new(self.db.clone()).delete(id).await
    }
}
