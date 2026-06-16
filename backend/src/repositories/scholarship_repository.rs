use crate::{
    models::scholarship::{CreateScholarshipRequest, Scholarship},
    utils::errors::{AppError, AppResult},
};
use sqlx::PgPool;
use uuid::Uuid;

pub struct ScholarshipRepository {
    pub db: PgPool,
}

impl ScholarshipRepository {
    pub fn new(db: PgPool) -> Self {
        Self { db }
    }

    pub async fn find_all(&self) -> AppResult<Vec<Scholarship>> {
        sqlx::query_as::<_, Scholarship>(
            r#"
            SELECT id, name, scholarship_type, country, amount, deadline,
                   description, eligibility, apply_url, is_featured, created_at, updated_at
            FROM scholarships
            ORDER BY is_featured DESC, created_at DESC
            "#,
        )
        .fetch_all(&self.db)
        .await
        .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))
    }

    pub async fn create(&self, req: &CreateScholarshipRequest) -> AppResult<Scholarship> {
        sqlx::query_as::<_, Scholarship>(
            r#"
            INSERT INTO scholarships
              (name, scholarship_type, country, amount, deadline, description, eligibility, apply_url, is_featured)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id, name, scholarship_type, country, amount, deadline,
                      description, eligibility, apply_url, is_featured, created_at, updated_at
            "#,
        )
        .bind(&req.name)
        .bind(&req.scholarship_type)
        .bind(&req.country)
        .bind(&req.amount)
        .bind(req.deadline)
        .bind(&req.description)
        .bind(&req.eligibility)
        .bind(&req.apply_url)
        .bind(req.is_featured.unwrap_or(false))
        .fetch_one(&self.db)
        .await
        .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))
    }

    pub async fn update(&self, id: Uuid, body: &serde_json::Value) -> AppResult<Scholarship> {
        // Partial update — only patch fields present in the JSON body
        let row = sqlx::query_as::<_, Scholarship>(
            r#"
            UPDATE scholarships SET
              name            = COALESCE($2, name),
              country         = COALESCE($3, country),
              amount          = COALESCE($4, amount),
              deadline        = COALESCE($5::date, deadline),
              description     = COALESCE($6, description),
              eligibility     = COALESCE($7, eligibility),
              apply_url       = COALESCE($8, apply_url),
              is_featured     = COALESCE($9, is_featured),
              updated_at      = NOW()
            WHERE id = $1
            RETURNING id, name, scholarship_type, country, amount, deadline,
                      description, eligibility, apply_url, is_featured, created_at, updated_at
            "#,
        )
        .bind(id)
        .bind(body.get("name").and_then(|v| v.as_str()))
        .bind(body.get("country").and_then(|v| v.as_str()))
        .bind(body.get("amount").and_then(|v| v.as_str()))
        .bind(body.get("deadline").and_then(|v| v.as_str()))
        .bind(body.get("description").and_then(|v| v.as_str()))
        .bind(body.get("eligibility").and_then(|v| v.as_str()))
        .bind(body.get("apply_url").and_then(|v| v.as_str()))
        .bind(body.get("is_featured").and_then(|v| v.as_bool()))
        .fetch_optional(&self.db)
        .await
        .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?
        .ok_or_else(|| AppError::NotFound(format!("Scholarship {id} not found")))?;
        Ok(row)
    }

    pub async fn delete(&self, id: Uuid) -> AppResult<()> {
        let result = sqlx::query("DELETE FROM scholarships WHERE id = $1")
            .bind(id)
            .execute(&self.db)
            .await
            .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?;
        if result.rows_affected() == 0 {
            return Err(AppError::NotFound(format!("Scholarship {id} not found")));
        }
        Ok(())
    }
}
