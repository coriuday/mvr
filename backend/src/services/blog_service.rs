use sqlx::PgPool;
use uuid::Uuid;
use crate::{
    models::blog::{Blog, BlogFilter, CreateBlogRequest, UpdateBlogRequest},
    repositories::blog_repository::BlogRepository,
    utils::errors::AppResult,
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

    pub async fn get_blog_by_id(&self, id: Uuid) -> AppResult<Blog> {
        self.repo.find_by_id(id).await
    }

    pub async fn create_blog(&self, mut req: CreateBlogRequest, author_id: Option<Uuid>) -> AppResult<Blog> {
        if req.slug.trim().is_empty() {
            req.slug = generate_slug(&req.title);
        } else {
            req.slug = generate_slug(&req.slug);
        }

        self.repo.create(&req, author_id).await
    }

    pub async fn update_blog(&self, id: Uuid, mut req: UpdateBlogRequest) -> AppResult<Blog> {
        if let Some(slug) = &req.slug {
            if !slug.trim().is_empty() {
                req.slug = Some(generate_slug(slug));
            }
        }
        self.repo.update(id, &req).await
    }

    pub async fn delete_blog(&self, id: Uuid) -> AppResult<()> {
        self.repo.delete(id).await
    }
}

pub fn generate_slug(title: &str) -> String {
    title
        .to_lowercase()
        .chars()
        .map(|c| match c {
            'a'..='z' | '0'..='9' => c,
            _ => '-',
        })
        .collect::<String>()
        .split('-')
        .filter(|s| !s.is_empty())
        .collect::<Vec<_>>()
        .join("-")
}
