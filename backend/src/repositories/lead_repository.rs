use crate::{
    models::lead::{
        CreateLeadRequest, Lead, LeadFilter, LeadSource, LeadStatus, UpdateLeadRequest,
    },
    utils::errors::{AppError, AppResult},
};
use sqlx::PgPool;
use uuid::Uuid;

pub struct LeadRepository {
    pub db: PgPool,
}

impl LeadRepository {
    pub fn new(db: PgPool) -> Self {
        Self { db }
    }

    /// Insert a new lead inquiry into the database
    pub async fn create(&self, req: &CreateLeadRequest) -> AppResult<Lead> {
        let source = req.source.clone().unwrap_or(LeadSource::Website);
        let lead = sqlx::query_as::<_, Lead>(
            r#"
            INSERT INTO leads (name, email, phone, message, country_interest, source, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, name, email, phone, message, status, source,
                      country_interest, assigned_to, notes, created_at, updated_at
            "#,
        )
        .bind(&req.name)
        .bind(&req.email)
        .bind(&req.phone)
        .bind(&req.message)
        .bind(&req.country_interest)
        .bind(source)
        .bind(LeadStatus::New)
        .fetch_one(&self.db)
        .await
        .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?;

        Ok(lead)
    }

    /// List all leads with pagination and optional status filter
    pub async fn find_all(&self, filter: &LeadFilter) -> AppResult<(Vec<Lead>, i64)> {
        let page = filter.page.unwrap_or(1).max(1);
        let per_page = filter.per_page.unwrap_or(20).min(500); // 500 max: Kanban board needs all leads
        let offset = (page - 1) * per_page;

        // Apply status filter to both count and data queries
        let total: i64 = match &filter.status {
            Some(status) => {
                sqlx::query_scalar("SELECT COUNT(*)::bigint FROM leads WHERE status = $1")
                    .bind(status)
                    .fetch_one(&self.db)
                    .await
                    .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?
            }
            None => sqlx::query_scalar("SELECT COUNT(*)::bigint FROM leads")
                .fetch_one(&self.db)
                .await
                .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?,
        };

        let leads = match &filter.status {
            Some(status) => sqlx::query_as::<_, Lead>(
                r#"
                SELECT id, name, email, phone, message, status, source,
                       country_interest, assigned_to, notes, created_at, updated_at
                FROM leads
                WHERE status = $1
                ORDER BY created_at DESC
                LIMIT $2 OFFSET $3
                "#,
            )
            .bind(status)
            .bind(per_page)
            .bind(offset)
            .fetch_all(&self.db)
            .await
            .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?,
            None => sqlx::query_as::<_, Lead>(
                r#"
                SELECT id, name, email, phone, message, status, source,
                       country_interest, assigned_to, notes, created_at, updated_at
                FROM leads
                ORDER BY created_at DESC
                LIMIT $1 OFFSET $2
                "#,
            )
            .bind(per_page)
            .bind(offset)
            .fetch_all(&self.db)
            .await
            .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?,
        };

        Ok((leads, total))
    }

    /// Find a single lead by ID
    pub async fn find_by_id(&self, id: Uuid) -> AppResult<Lead> {
        sqlx::query_as::<_, Lead>(
            r#"
            SELECT id, name, email, phone, message, status, source,
                   country_interest, assigned_to, notes, created_at, updated_at
            FROM leads WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(&self.db)
        .await
        .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?
        .ok_or_else(|| AppError::NotFound(format!("Lead {id} not found")))
    }

    /// Update lead status / notes / assignment
    pub async fn update(&self, id: Uuid, req: &UpdateLeadRequest) -> AppResult<Lead> {
        sqlx::query_as::<_, Lead>(
            r#"
            UPDATE leads
            SET
                status      = COALESCE($2, status),
                assigned_to = COALESCE($3, assigned_to),
                notes       = COALESCE($4, notes),
                phone       = COALESCE($5, phone),
                updated_at  = NOW()
            WHERE id = $1
            RETURNING id, name, email, phone, message, status, source,
                      country_interest, assigned_to, notes, created_at, updated_at
            "#,
        )
        .bind(id)
        .bind(&req.status)
        .bind(req.assigned_to)
        .bind(&req.notes)
        .bind(&req.phone)
        .fetch_optional(&self.db)
        .await
        .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?
        .ok_or_else(|| AppError::NotFound(format!("Lead {id} not found")))
    }

    /// Delete a lead
    pub async fn delete(&self, id: Uuid) -> AppResult<()> {
        let result = sqlx::query("DELETE FROM leads WHERE id = $1")
            .bind(id)
            .execute(&self.db)
            .await
            .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound(format!("Lead {id} not found")));
        }
        Ok(())
    }

    /// Count leads created in the last 24 hours
    pub async fn count_today(&self) -> AppResult<i64> {
        sqlx::query_scalar(
            "SELECT COUNT(*)::bigint FROM leads WHERE created_at >= NOW() - INTERVAL '24 hours'",
        )
        .fetch_one(&self.db)
        .await
        .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))
    }

    /// Aggregate lead counts by status — used for dashboard stats (no full-table scan).
    pub async fn count_status_totals(&self) -> AppResult<(i64, i64, i64)> {
        let row: (i64, i64, i64) = sqlx::query_as(
            r#"
            SELECT
                COUNT(*) FILTER (WHERE status = 'NEW')::bigint,
                COUNT(*) FILTER (WHERE status = 'CONVERTED')::bigint,
                COUNT(*)::bigint
            FROM leads
            "#,
        )
        .fetch_one(&self.db)
        .await
        .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?;

        Ok(row)
    }
}
