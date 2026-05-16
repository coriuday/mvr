use sqlx::PgPool;
use uuid::Uuid;
use crate::{
    models::university::{CreateUniversityRequest, University, UniversityFilter},
    utils::errors::{AppError, AppResult},
};

pub struct UniversityRepository {
    pub db: PgPool,
}

impl UniversityRepository {
    pub fn new(db: PgPool) -> Self {
        Self { db }
    }

    pub async fn find_all(&self, filter: &UniversityFilter) -> AppResult<(Vec<University>, i64)> {
        let page = filter.page.unwrap_or(1).max(1);
        let per_page = filter.per_page.unwrap_or(20).min(100);
        let offset = (page - 1) * per_page;

        let total: i64 = sqlx::query_scalar(
            r#"
            SELECT COUNT(*)::bigint FROM universities
            WHERE ($1::text IS NULL OR country = $1)
              AND ($2::boolean IS NULL OR is_featured = $2)
            "#,
        )
        .bind(&filter.country)
        .bind(filter.is_featured)
        .fetch_one(&self.db)
        .await
        .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?;

        let unis = sqlx::query_as::<_, University>(
            r#"
            SELECT id, name, country, ranking, logo_url, description, website_url, is_featured, created_at, updated_at
            FROM universities
            WHERE ($1::text IS NULL OR country = $1)
              AND ($2::boolean IS NULL OR is_featured = $2)
            ORDER BY ranking ASC NULLS LAST, name ASC
            LIMIT $3 OFFSET $4
            "#,
        )
        .bind(&filter.country)
        .bind(filter.is_featured)
        .bind(per_page)
        .bind(offset)
        .fetch_all(&self.db)
        .await
        .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?;

        Ok((unis, total))
    }

    pub async fn find_by_id(&self, id: Uuid) -> AppResult<University> {
        sqlx::query_as::<_, University>(
            "SELECT id, name, country, ranking, logo_url, description, website_url, is_featured, created_at, updated_at FROM universities WHERE id = $1",
        )
        .bind(id)
        .fetch_optional(&self.db)
        .await
        .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?
        .ok_or_else(|| AppError::NotFound(format!("University {id} not found")))
    }

    pub async fn create(&self, req: &CreateUniversityRequest) -> AppResult<University> {
        sqlx::query_as::<_, University>(
            r#"
            INSERT INTO universities (name, country, ranking, logo_url, description, website_url, is_featured)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, name, country, ranking, logo_url, description, website_url, is_featured, created_at, updated_at
            "#,
        )
        .bind(&req.name)
        .bind(&req.country)
        .bind(req.ranking)
        .bind(&req.logo_url)
        .bind(&req.description)
        .bind(&req.website_url)
        .bind(req.is_featured.unwrap_or(false))
        .fetch_one(&self.db)
        .await
        .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))
    }

    pub async fn update_featured(&self, id: Uuid, featured: bool) -> AppResult<University> {
        sqlx::query_as::<_, University>(
            r#"
            UPDATE universities SET is_featured = $2, updated_at = NOW()
            WHERE id = $1
            RETURNING id, name, country, ranking, logo_url, description, website_url, is_featured, created_at, updated_at
            "#,
        )
        .bind(id)
        .bind(featured)
        .fetch_optional(&self.db)
        .await
        .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?
        .ok_or_else(|| AppError::NotFound(format!("University {id} not found")))
    }

    pub async fn delete(&self, id: Uuid) -> AppResult<()> {
        let result = sqlx::query("DELETE FROM universities WHERE id = $1")
            .bind(id)
            .execute(&self.db)
            .await
            .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?;
        if result.rows_affected() == 0 {
            return Err(AppError::NotFound(format!("University {id} not found")));
        }
        Ok(())
    }
}
