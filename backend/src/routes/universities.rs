use axum::{extract::{Path, Query, State}, Json};
use uuid::Uuid;
use crate::{
    models::university::{CreateUniversityRequest, UniversityFilter},
    routes::AppState,
    utils::errors::{AppError, AppResult},
    utils::response::MessageResponse,
};

pub async fn get_all_universities(
    State(_state): State<AppState>,
    Query(_filter): Query<UniversityFilter>,
) -> AppResult<Json<serde_json::Value>> {
    Err(AppError::InternalServerError("Not yet implemented".to_string()))
}

pub async fn create_university(
    State(_state): State<AppState>,
    Json(_body): Json<CreateUniversityRequest>,
) -> AppResult<Json<serde_json::Value>> {
    Err(AppError::InternalServerError("Not yet implemented".to_string()))
}

pub async fn update_university(
    State(_state): State<AppState>,
    Path(_id): Path<Uuid>,
    Json(_body): Json<serde_json::Value>,
) -> AppResult<Json<serde_json::Value>> {
    Err(AppError::InternalServerError("Not yet implemented".to_string()))
}

pub async fn delete_university(
    State(_state): State<AppState>,
    Path(_id): Path<Uuid>,
) -> AppResult<Json<MessageResponse>> {
    Err(AppError::InternalServerError("Not yet implemented".to_string()))
}
