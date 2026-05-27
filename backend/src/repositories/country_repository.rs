use sqlx::PgPool;
use uuid::Uuid;
use crate::{
    models::country::{Country, CountryCard, CountryFilter, CreateCountryRequest, UpdateCountryRequest},
    utils::errors::{AppError, AppResult},
};

pub struct CountryRepository {
    pub db: PgPool,
}

impl CountryRepository {
    pub fn new(db: PgPool) -> Self {
        Self { db }
    }

    // ── Public listing ─────────────────────────────────────────────────────

    /// Lightweight listing for the /countries grid — returns CountryCard rows
    /// (no JSONB content) ordered by sort_order.
    pub async fn list_active(&self) -> AppResult<Vec<CountryCard>> {
        let rows = sqlx::query_as::<_, Country>(
            r#"
            SELECT id, slug, name, flag, tagline, image_url, hero_image_url,
                   content, sort_order, is_active, created_at, updated_at
            FROM countries
            WHERE is_active = TRUE
            ORDER BY sort_order ASC, name ASC
            "#,
        )
        .fetch_all(&self.db)
        .await
        .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?;

        Ok(rows.into_iter().map(CountryCard::from).collect())
    }

    /// Full row for a single country (includes JSONB content for the detail page).
    pub async fn find_by_slug(&self, slug: &str) -> AppResult<Country> {
        sqlx::query_as::<_, Country>(
            r#"
            SELECT id, slug, name, flag, tagline, image_url, hero_image_url,
                   content, sort_order, is_active, created_at, updated_at
            FROM countries
            WHERE slug = $1 AND is_active = TRUE
            "#,
        )
        .bind(slug)
        .fetch_optional(&self.db)
        .await
        .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?
        .ok_or_else(|| AppError::NotFound(format!("Country '{}' not found", slug)))
    }

    // ── Admin CRUD ─────────────────────────────────────────────────────────

    /// Admin: paginated list of all countries (active + inactive).
    pub async fn find_all(&self, filter: &CountryFilter) -> AppResult<(Vec<Country>, i64)> {
        let page     = filter.page.unwrap_or(1).max(1);
        let per_page = filter.per_page.unwrap_or(50).min(100);
        let offset   = (page - 1) * per_page;

        let total: i64 = sqlx::query_scalar(
            "SELECT COUNT(*)::bigint FROM countries WHERE ($1::boolean IS NULL OR is_active = $1)",
        )
        .bind(filter.is_active)
        .fetch_one(&self.db)
        .await
        .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?;

        let rows = sqlx::query_as::<_, Country>(
            r#"
            SELECT id, slug, name, flag, tagline, image_url, hero_image_url,
                   content, sort_order, is_active, created_at, updated_at
            FROM countries
            WHERE ($1::boolean IS NULL OR is_active = $1)
            ORDER BY sort_order ASC, name ASC
            LIMIT $2 OFFSET $3
            "#,
        )
        .bind(filter.is_active)
        .bind(per_page)
        .bind(offset)
        .fetch_all(&self.db)
        .await
        .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?;

        Ok((rows, total))
    }

    /// Admin: create a new country record.
    pub async fn create(&self, req: &CreateCountryRequest) -> AppResult<Country> {
        let content = req.content.clone().unwrap_or(serde_json::Value::Object(Default::default()));
        let content_json = serde_json::to_value(&content)
            .map_err(|e| AppError::BadRequest(format!("Invalid content JSON: {e}")))?;

        sqlx::query_as::<_, Country>(
            r#"
            INSERT INTO countries
                (slug, name, flag, tagline, image_url, hero_image_url, content, sort_order)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, slug, name, flag, tagline, image_url, hero_image_url,
                      content, sort_order, is_active, created_at, updated_at
            "#,
        )
        .bind(&req.slug)
        .bind(&req.name)
        .bind(&req.flag)
        .bind(req.tagline.as_deref().unwrap_or(""))
        .bind(&req.image_url)
        .bind(&req.hero_image_url)
        .bind(sqlx::types::Json(content_json))
        .bind(req.sort_order.unwrap_or(999))
        .fetch_one(&self.db)
        .await
        .map_err(|e| {
            let msg = e.to_string();
            if msg.contains("unique") || msg.contains("duplicate key") {
                AppError::Conflict(format!("Country slug '{}' already exists", req.slug))
            } else {
                AppError::InternalServerError(format!("DB error: {e}"))
            }
        })
    }

    /// Admin: update an existing country.
    pub async fn update(&self, id: Uuid, req: &UpdateCountryRequest) -> AppResult<Country> {
        let content_json = req.content.as_ref().map(|v| {
            serde_json::to_value(v).ok()
        }).flatten();

        sqlx::query_as::<_, Country>(
            r#"
            UPDATE countries SET
                name           = COALESCE($2, name),
                flag           = COALESCE($3, flag),
                tagline        = COALESCE($4, tagline),
                image_url      = COALESCE($5, image_url),
                hero_image_url = COALESCE($6, hero_image_url),
                content        = COALESCE($7, content),
                sort_order     = COALESCE($8, sort_order),
                is_active      = COALESCE($9, is_active),
                updated_at     = NOW()
            WHERE id = $1
            RETURNING id, slug, name, flag, tagline, image_url, hero_image_url,
                      content, sort_order, is_active, created_at, updated_at
            "#,
        )
        .bind(id)
        .bind(&req.name)
        .bind(&req.flag)
        .bind(&req.tagline)
        .bind(&req.image_url)
        .bind(&req.hero_image_url)
        .bind(content_json.map(sqlx::types::Json))
        .bind(req.sort_order)
        .bind(req.is_active)
        .fetch_optional(&self.db)
        .await
        .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?
        .ok_or_else(|| AppError::NotFound(format!("Country {id} not found")))
    }

    /// Admin: delete a country permanently.
    pub async fn delete(&self, id: Uuid) -> AppResult<()> {
        let result = sqlx::query("DELETE FROM countries WHERE id = $1")
            .bind(id)
            .execute(&self.db)
            .await
            .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?;
        if result.rows_affected() == 0 {
            return Err(AppError::NotFound(format!("Country {id} not found")));
        }
        Ok(())
    }
}
