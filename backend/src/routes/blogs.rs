use axum::{extract::{Path, Query, State}, Json};
use uuid::Uuid;
use crate::{
    models::blog::{BlogFilter, CreateBlogRequest, UpdateBlogRequest},
    services::blog_service::BlogService,
    routes::AppState,
    utils::{errors::AppResult, response::MessageResponse},
};

// ─── GET /api/blogs  (public) ────────────────────────────────────────────────
pub async fn get_all_blogs(
    State(state): State<AppState>,
    Query(mut filter): Query<BlogFilter>,
) -> AppResult<Json<serde_json::Value>> {
    // Public endpoint always shows only published posts
    filter.published = Some(true);
    let service = BlogService::new(state.db.clone());
    let (blogs, total) = service.get_all_blogs(&filter).await?;
    let page = filter.page.unwrap_or(1);
    let per_page = filter.per_page.unwrap_or(12);
    Ok(Json(serde_json::json!({
        "success": true,
        "data": blogs,
        "meta": { "total": total, "page": page, "per_page": per_page,
                  "total_pages": (total as f64 / per_page as f64).ceil() as i64 }
    })))
}

// ─── GET /api/blogs/:slug  (public) ──────────────────────────────────────────
pub async fn get_blog_by_slug(
    State(state): State<AppState>,
    Path(slug): Path<String>,
) -> AppResult<Json<serde_json::Value>> {
    let service = BlogService::new(state.db.clone());
    let blog = service.get_blog_by_slug(&slug).await?;
    Ok(Json(serde_json::json!({ "success": true, "data": blog })))
}

// ─── POST /api/blogs  (admin) ────────────────────────────────────────────────
pub async fn create_blog(
    State(state): State<AppState>,
    axum::Extension(claims): axum::Extension<crate::utils::jwt::Claims>,
    Json(body): Json<CreateBlogRequest>,
) -> AppResult<Json<serde_json::Value>> {
    if body.title.trim().is_empty() {
        return Err(crate::utils::errors::AppError::BadRequest("Title is required".to_string()));
    }
    let author_id = Uuid::parse_str(&claims.sub).ok();
    let service = BlogService::new(state.db.clone());
    let blog = service.create_blog(body, author_id).await?;
    Ok(Json(serde_json::json!({ "success": true, "data": blog })))
}

// ─── PUT /api/blogs/:id  (admin) ─────────────────────────────────────────────
pub async fn update_blog(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(body): Json<UpdateBlogRequest>,
) -> AppResult<Json<serde_json::Value>> {
    let service = BlogService::new(state.db.clone());
    let blog = service.update_blog(id, body).await?;
    Ok(Json(serde_json::json!({ "success": true, "data": blog })))
}

// ─── DELETE /api/blogs/:id  (admin) ──────────────────────────────────────────
pub async fn delete_blog(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<MessageResponse>> {
    let service = BlogService::new(state.db.clone());
    service.delete_blog(id).await?;
    Ok(Json(MessageResponse::new("Blog post deleted successfully")))
}
