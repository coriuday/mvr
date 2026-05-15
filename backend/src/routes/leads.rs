use axum::{extract::{Path, Query, State}, Json};
use uuid::Uuid;
use crate::{
    models::lead::{CreateLeadRequest, LeadFilter, UpdateLeadRequest},
    routes::AppState,
    utils::errors::{AppError, AppResult},
    utils::response::MessageResponse,
};

pub async fn create_lead(
    State(_state): State<AppState>,
    Json(_body): Json<CreateLeadRequest>,
) -> AppResult<Json<serde_json::Value>> {
    Err(AppError::InternalServerError("Not yet implemented".to_string()))
}

pub async fn get_all_leads(
    State(_state): State<AppState>,
    Query(_filter): Query<LeadFilter>,
) -> AppResult<Json<serde_json::Value>> {
    Err(AppError::InternalServerError("Not yet implemented".to_string()))
}

pub async fn get_lead(
    State(_state): State<AppState>,
    Path(_id): Path<Uuid>,
) -> AppResult<Json<serde_json::Value>> {
    Err(AppError::InternalServerError("Not yet implemented".to_string()))
}

pub async fn update_lead(
    State(_state): State<AppState>,
    Path(_id): Path<Uuid>,
    Json(_body): Json<UpdateLeadRequest>,
) -> AppResult<Json<serde_json::Value>> {
    Err(AppError::InternalServerError("Not yet implemented".to_string()))
}

pub async fn delete_lead(
    State(_state): State<AppState>,
    Path(_id): Path<Uuid>,
) -> AppResult<Json<MessageResponse>> {
    Err(AppError::InternalServerError("Not yet implemented".to_string()))
}
