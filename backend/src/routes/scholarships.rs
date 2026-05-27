use crate::{
    models::scholarship::CreateScholarshipRequest,
    routes::AppState,
    utils::errors::{AppError, AppResult},
};
use axum::{
    Json,
    extract::{Path, State},
};
use uuid::Uuid;

pub async fn get_all_scholarships(
    State(_state): State<AppState>,
) -> AppResult<Json<serde_json::Value>> {
    Err(AppError::InternalServerError(
        "Not yet implemented".to_string(),
    ))
}

pub async fn create_scholarship(
    State(_state): State<AppState>,
    Json(_body): Json<CreateScholarshipRequest>,
) -> AppResult<Json<serde_json::Value>> {
    Err(AppError::InternalServerError(
        "Not yet implemented".to_string(),
    ))
}

pub async fn update_scholarship(
    State(_state): State<AppState>,
    Path(_id): Path<Uuid>,
    Json(_body): Json<serde_json::Value>,
) -> AppResult<Json<serde_json::Value>> {
    Err(AppError::InternalServerError(
        "Not yet implemented".to_string(),
    ))
}
