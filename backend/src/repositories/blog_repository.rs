use crate::{
    models::blog::{Blog, BlogFilter, CreateBlogRequest, UpdateBlogRequest},
    utils::errors::{AppError, AppResult},
};
use sqlx::PgPool;
use uuid::Uuid;

pub struct BlogRepository {
    pub db: PgPool,
}

impl BlogRepository {
    pub fn new(db: PgPool) -> Self {
        Self { db }
    }

    pub async fn find_all(&self, filter: &BlogFilter) -> AppResult<(Vec<Blog>, i64)> {
        let page = filter.page.unwrap_or(1).max(1);
        let per_page = filter.per_page.unwrap_or(12).min(50);
        let offset = (page - 1) * per_page;

        let total: i64 = sqlx::query_scalar(
            "SELECT COUNT(*)::bigint FROM blogs WHERE ($1::boolean IS NULL OR published = $1)",
        )
        .bind(filter.published)
        .fetch_one(&self.db)
        .await
        .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?;

        let blogs = sqlx::query_as::<_, Blog>(
            r#"
            SELECT id, title, slug, content, excerpt, image_url, published,
                   author_id, meta_title, meta_description, tags, created_at, updated_at
            FROM blogs
            WHERE ($1::boolean IS NULL OR published = $1)
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
            "#,
        )
        .bind(filter.published)
        .bind(per_page)
        .bind(offset)
        .fetch_all(&self.db)
        .await
        .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?;

        Ok((blogs, total))
    }

    pub async fn find_by_slug(&self, slug: &str) -> AppResult<Blog> {
        sqlx::query_as::<_, Blog>(
            r#"
            SELECT id, title, slug, content, excerpt, image_url, published,
                   author_id, meta_title, meta_description, tags, created_at, updated_at
            FROM blogs WHERE slug = $1 AND published = true
            "#,
        )
        .bind(slug)
        .fetch_optional(&self.db)
        .await
        .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?
        .ok_or_else(|| AppError::NotFound(format!("Blog post '{}' not found", slug)))
    }

    #[allow(dead_code)]
    pub async fn find_by_id(&self, id: Uuid) -> AppResult<Blog> {
        sqlx::query_as::<_, Blog>(
            r#"
            SELECT id, title, slug, content, excerpt, image_url, published,
                   author_id, meta_title, meta_description, tags, created_at, updated_at
            FROM blogs WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(&self.db)
        .await
        .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?
        .ok_or_else(|| AppError::NotFound(format!("Blog {id} not found")))
    }

    pub async fn create(
        &self,
        req: &CreateBlogRequest,
        author_id: Option<Uuid>,
    ) -> AppResult<Blog> {
        let tags: Vec<String> = req.tags.clone().unwrap_or_default();
        sqlx::query_as::<_, Blog>(
            r#"
            INSERT INTO blogs (title, slug, content, excerpt, image_url, published,
                               author_id, meta_title, meta_description, tags)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id, title, slug, content, excerpt, image_url, published,
                      author_id, meta_title, meta_description, tags, created_at, updated_at
            "#,
        )
        .bind(&req.title)
        .bind(&req.slug)
        .bind(&req.content)
        .bind(&req.excerpt)
        .bind(&req.image_url)
        .bind(req.published.unwrap_or(false))
        .bind(author_id)
        .bind(&req.meta_title)
        .bind(&req.meta_description)
        .bind(&tags)
        .fetch_one(&self.db)
        .await
        .map_err(|e| {
            let msg = e.to_string();
            if msg.contains("unique") || msg.contains("duplicate key") {
                AppError::Conflict(format!("Slug '{}' is already taken", req.slug))
            } else {
                AppError::InternalServerError(format!("DB error: {e}"))
            }
        })
    }

    pub async fn update(&self, id: Uuid, req: &UpdateBlogRequest) -> AppResult<Blog> {
        sqlx::query_as::<_, Blog>(
            r#"
            UPDATE blogs SET
                title            = COALESCE($2, title),
                slug             = COALESCE($3, slug),
                content          = COALESCE($4, content),
                excerpt          = COALESCE($5, excerpt),
                image_url        = COALESCE($6, image_url),
                published        = COALESCE($7, published),
                meta_title       = COALESCE($8, meta_title),
                meta_description = COALESCE($9, meta_description),
                tags             = COALESCE($10, tags),
                updated_at       = NOW()
            WHERE id = $1
            RETURNING id, title, slug, content, excerpt, image_url, published,
                      author_id, meta_title, meta_description, tags, created_at, updated_at
            "#,
        )
        .bind(id)
        .bind(&req.title)
        .bind(&req.slug)
        .bind(&req.content)
        .bind(&req.excerpt)
        .bind(&req.image_url)
        .bind(req.published)
        .bind(&req.meta_title)
        .bind(&req.meta_description)
        .bind(&req.tags)
        .fetch_optional(&self.db)
        .await
        .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?
        .ok_or_else(|| AppError::NotFound(format!("Blog {id} not found")))
    }

    pub async fn delete(&self, id: Uuid) -> AppResult<()> {
        let result = sqlx::query("DELETE FROM blogs WHERE id = $1")
            .bind(id)
            .execute(&self.db)
            .await
            .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?;
        if result.rows_affected() == 0 {
            return Err(AppError::NotFound(format!("Blog {id} not found")));
        }
        Ok(())
    }
}
