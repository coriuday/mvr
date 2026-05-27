use sqlx::PgPool;
use uuid::Uuid;
use crate::{
    models::blog::{Blog, BlogFilter, CreateBlogRequest, UpdateBlogRequest},
    repositories::blog_repository::BlogRepository,
    utils::errors::{AppError, AppResult},
};

pub struct BlogService {
    db: PgPool,
}

impl BlogService {
    pub fn new(db: PgPool) -> Self {
        Self { db }
    }

    /// List all blogs, filtering to published=true for the public endpoint.
    pub async fn list(&self, filter: &BlogFilter) -> AppResult<(Vec<Blog>, i64)> {
        BlogRepository::new(self.db.clone()).find_all(filter).await
    }

    /// Fetch a single published blog by slug (public).
    pub async fn get_by_slug(&self, slug: &str) -> AppResult<Blog> {
        BlogRepository::new(self.db.clone()).find_by_slug(slug).await
    }

    /// Validate and create a new blog post (admin).
    pub async fn create(&self, body: &CreateBlogRequest, author_id: Option<Uuid>) -> AppResult<Blog> {
        if body.title.trim().is_empty() {
            return Err(AppError::BadRequest("Title is required".to_string()));
        }
        if body.slug.trim().is_empty() {
            return Err(AppError::BadRequest("Slug is required".to_string()));
        }
        BlogRepository::new(self.db.clone()).create(body, author_id).await
    }

    /// Update an existing blog post (admin).
    pub async fn update(&self, id: Uuid, body: &UpdateBlogRequest) -> AppResult<Blog> {
        BlogRepository::new(self.db.clone()).update(id, body).await
    }

    /// Delete a blog post (admin).
    pub async fn delete(&self, id: Uuid) -> AppResult<()> {
        BlogRepository::new(self.db.clone()).delete(id).await
    }
}
