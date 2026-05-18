use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    models::blog::{Blog, BlogFilter, CreateBlogRequest, UpdateBlogRequest},
    repositories::blog_repository::BlogRepository,
    utils::errors::{AppError, AppResult},
};

pub struct BlogService {
    repo: BlogRepository,
}

impl BlogService {
    pub fn new(db: PgPool) -> Self {
        Self {
            repo: BlogRepository::new(db),
        }
    }

    pub async fn get_all_blogs(&self, filter: &BlogFilter) -> AppResult<(Vec<Blog>, i64)> {
        self.repo.find_all(filter).await
    }

    pub async fn get_blog_by_slug(&self, slug: &str) -> AppResult<Blog> {
        self.repo.find_by_slug(slug).await
    }

    pub async fn create_blog(&self, req: CreateBlogRequest, author_id: Option<Uuid>) -> AppResult<Blog> {
        if req.title.trim().is_empty() {
            return Err(AppError::BadRequest("Title is required".to_string()));
        }

        let mut final_req = req;

        if final_req.slug.trim().is_empty() {
            final_req.slug = Self::generate_slug(&final_req.title);
        }

        if final_req.slug.trim().is_empty() {
            return Err(AppError::BadRequest("Could not generate a valid slug from title".to_string()));
        }

        self.repo.create(&final_req, author_id).await
    }

    pub async fn update_blog(&self, id: Uuid, req: UpdateBlogRequest) -> AppResult<Blog> {
        self.repo.update(id, &req).await
    }

    pub async fn delete_blog(&self, id: Uuid) -> AppResult<()> {
        self.repo.delete(id).await
    }

    fn generate_slug(title: &str) -> String {
        title
            .to_lowercase()
            .chars()
            .filter(|c| c.is_alphanumeric() || c.is_whitespace() || *c == '-')
            .collect::<String>()
            .split_whitespace()
            .collect::<Vec<_>>()
            .join("-")
    }
}
