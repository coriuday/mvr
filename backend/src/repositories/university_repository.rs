use crate::{
    models::university::{CreateUniversityRequest, University, UniversityFilter, UpdateUniversityRequest},
    utils::errors::{AppError, AppResult},
};
use sqlx::PgPool;
use uuid::Uuid;

const UNI_SELECT: &str = r#"
    SELECT id, slug, name, country, flag, ranking, fees, intake, duration, scholarship,
           ielts, ielts_min, gpa_min, annual_tuition_usd, programs,
           logo_url, description, website_url, is_featured, is_active, created_at, updated_at
    FROM universities
"#;

pub struct UniversityRepository {
    pub db: PgPool,
}

impl UniversityRepository {
    pub fn new(db: PgPool) -> Self {
        Self { db }
    }

    pub async fn find_all(&self, filter: &UniversityFilter, active_only: bool) -> AppResult<(Vec<University>, i64)> {
        let page = filter.page.unwrap_or(1).max(1);
        let per_page = filter.per_page.unwrap_or(20).min(500);
        let offset = (page - 1) * per_page;

        let total: i64 = sqlx::query_scalar(
            r#"
            SELECT COUNT(*)::bigint FROM universities
            WHERE ($1::text IS NULL OR country = $1)
              AND ($2::boolean IS NULL OR is_featured = $2)
              AND ($3::boolean = FALSE OR is_active = TRUE)
            "#,
        )
        .bind(&filter.country)
        .bind(filter.is_featured)
        .bind(active_only)
        .fetch_one(&self.db)
        .await
        .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?;

        let query = format!(
            r#"{UNI_SELECT}
            WHERE ($1::text IS NULL OR country = $1)
              AND ($2::boolean IS NULL OR is_featured = $2)
              AND ($3::boolean = FALSE OR is_active = TRUE)
            ORDER BY name ASC
            LIMIT $4 OFFSET $5"#
        );

        let unis = sqlx::query_as::<_, University>(&query)
            .bind(&filter.country)
            .bind(filter.is_featured)
            .bind(active_only)
            .bind(per_page)
            .bind(offset)
            .fetch_all(&self.db)
            .await
            .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?;

        Ok((unis, total))
    }

    pub async fn find_by_id(&self, id: Uuid) -> AppResult<University> {
        let query = format!("{UNI_SELECT} WHERE id = $1");
        sqlx::query_as::<_, University>(&query)
            .bind(id)
            .fetch_optional(&self.db)
            .await
            .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?
            .ok_or_else(|| AppError::NotFound(format!("University {id} not found")))
    }

    pub async fn find_by_slug(&self, slug: &str, active_only: bool) -> AppResult<University> {
        let query = format!(
            r#"{UNI_SELECT}
            WHERE slug = $1 AND ($2::boolean = FALSE OR is_active = TRUE)"#
        );
        sqlx::query_as::<_, University>(&query)
            .bind(slug)
            .bind(active_only)
            .fetch_optional(&self.db)
            .await
            .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?
            .ok_or_else(|| AppError::NotFound(format!("University '{slug}' not found")))
    }

    pub async fn create(&self, req: &CreateUniversityRequest) -> AppResult<University> {
        let programs = req.programs.clone().unwrap_or_default();
        sqlx::query_as::<_, University>(
            r#"
            INSERT INTO universities (
                slug, name, country, flag, ranking, fees, intake, duration, scholarship,
                ielts, ielts_min, gpa_min, annual_tuition_usd, programs,
                logo_url, description, website_url, is_featured, is_active
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
            RETURNING id, slug, name, country, flag, ranking, fees, intake, duration, scholarship,
                      ielts, ielts_min, gpa_min, annual_tuition_usd, programs,
                      logo_url, description, website_url, is_featured, is_active, created_at, updated_at
            "#,
        )
        .bind(&req.slug)
        .bind(&req.name)
        .bind(&req.country)
        .bind(&req.flag)
        .bind(&req.ranking)
        .bind(&req.fees)
        .bind(&req.intake)
        .bind(&req.duration)
        .bind(&req.scholarship)
        .bind(&req.ielts)
        .bind(req.ielts_min)
        .bind(req.gpa_min)
        .bind(req.annual_tuition_usd)
        .bind(&programs)
        .bind(&req.logo_url)
        .bind(&req.description)
        .bind(&req.website_url)
        .bind(req.is_featured.unwrap_or(false))
        .bind(req.is_active.unwrap_or(true))
        .fetch_one(&self.db)
        .await
        .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))
    }

    pub async fn update(&self, id: Uuid, req: &UpdateUniversityRequest) -> AppResult<University> {
        let existing = self.find_by_id(id).await?;
        let programs = req.programs.clone().unwrap_or(existing.programs);

        sqlx::query_as::<_, University>(
            r#"
            UPDATE universities SET
                slug = COALESCE($2, slug),
                name = COALESCE($3, name),
                country = COALESCE($4, country),
                flag = COALESCE($5, flag),
                ranking = COALESCE($6, ranking),
                fees = COALESCE($7, fees),
                intake = COALESCE($8, intake),
                duration = COALESCE($9, duration),
                scholarship = COALESCE($10, scholarship),
                ielts = COALESCE($11, ielts),
                ielts_min = COALESCE($12, ielts_min),
                gpa_min = COALESCE($13, gpa_min),
                annual_tuition_usd = COALESCE($14, annual_tuition_usd),
                programs = $15,
                logo_url = COALESCE($16, logo_url),
                description = COALESCE($17, description),
                website_url = COALESCE($18, website_url),
                is_featured = COALESCE($19, is_featured),
                is_active = COALESCE($20, is_active),
                updated_at = NOW()
            WHERE id = $1
            RETURNING id, slug, name, country, flag, ranking, fees, intake, duration, scholarship,
                      ielts, ielts_min, gpa_min, annual_tuition_usd, programs,
                      logo_url, description, website_url, is_featured, is_active, created_at, updated_at
            "#,
        )
        .bind(id)
        .bind(&req.slug)
        .bind(&req.name)
        .bind(&req.country)
        .bind(&req.flag)
        .bind(&req.ranking)
        .bind(&req.fees)
        .bind(&req.intake)
        .bind(&req.duration)
        .bind(&req.scholarship)
        .bind(&req.ielts)
        .bind(req.ielts_min)
        .bind(req.gpa_min)
        .bind(req.annual_tuition_usd)
        .bind(&programs)
        .bind(&req.logo_url)
        .bind(&req.description)
        .bind(&req.website_url)
        .bind(req.is_featured)
        .bind(req.is_active)
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
