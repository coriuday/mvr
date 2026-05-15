use axum::{extract::State, Json};
use crate::{
    models::user::{LoginRequest, RegisterRequest, AuthTokenResponse},
    routes::AppState,
    utils::errors::{AppError, AppResult},
    utils::response::MessageResponse,
};

pub async fn register(
    State(_state): State<AppState>,
    Json(_body): Json<RegisterRequest>,
) -> AppResult<Json<serde_json::Value>> {
    // TODO: Phase 2
    Err(AppError::InternalServerError("Not yet implemented".to_string()))
}

pub async fn login(
    State(_state): State<AppState>,
    Json(_body): Json<LoginRequest>,
) -> AppResult<Json<serde_json::Value>> {
    // TODO: Phase 2
    Err(AppError::InternalServerError("Not yet implemented".to_string()))
}

pub async fn logout(
    State(_state): State<AppState>,
) -> AppResult<Json<MessageResponse>> {
    Ok(Json(MessageResponse::new("Logged out successfully")))
}

pub async fn refresh_token(
    State(_state): State<AppState>,
) -> AppResult<Json<serde_json::Value>> {
    // TODO: Phase 2
    Err(AppError::InternalServerError("Not yet implemented".to_string()))
}

pub async fn get_me(
    State(_state): State<AppState>,
) -> AppResult<Json<serde_json::Value>> {
    // TODO: Phase 2
    Err(AppError::InternalServerError("Not yet implemented".to_string()))
}
