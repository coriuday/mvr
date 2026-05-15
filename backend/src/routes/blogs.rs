use axum::{extract::{Path, Query, State}, Json};
use uuid::Uuid;
use crate::{
    models::blog::{BlogFilter, CreateBlogRequest, UpdateBlogRequest},
    routes::AppState,
    utils::errors::{AppError, AppResult},
    utils::response::MessageResponse,
};

pub async fn get_all_blogs(
    State(_state): State<AppState>,
    Query(_filter): Query<BlogFilter>,
) -> AppResult<Json<serde_json::Value>> {
    Err(AppError::InternalServerError("Not yet implemented".to_string()))
}

pub async fn get_blog_by_slug(
    State(_state): State<AppState>,
    Path(_slug): Path<String>,
) -> AppResult<Json<serde_json::Value>> {
    Err(AppError::InternalServerError("Not yet implemented".to_string()))
}

pub async fn create_blog(
    State(_state): State<AppState>,
    Json(_body): Json<CreateBlogRequest>,
) -> AppResult<Json<serde_json::Value>> {
    Err(AppError::InternalServerError("Not yet implemented".to_string()))
}

pub async fn update_blog(
    State(_state): State<AppState>,
    Path(_id): Path<Uuid>,
    Json(_body): Json<UpdateBlogRequest>,
) -> AppResult<Json<serde_json::Value>> {
    Err(AppError::InternalServerError("Not yet implemented".to_string()))
}

pub async fn delete_blog(
    State(_state): State<AppState>,
    Path(_id): Path<Uuid>,
) -> AppResult<Json<MessageResponse>> {
    Err(AppError::InternalServerError("Not yet implemented".to_string()))
}
