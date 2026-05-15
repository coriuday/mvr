use axum::{extract::State, Json};
use crate::{
    routes::AppState,
    utils::errors::{AppError, AppResult},
};

pub async fn get_stats(
    State(_state): State<AppState>,
) -> AppResult<Json<serde_json::Value>> {
    // TODO: Phase 2 — return: total_leads, new_leads_today, total_blogs, total_universities
    Err(AppError::InternalServerError("Not yet implemented".to_string()))
}

pub async fn get_recent_leads(
    State(_state): State<AppState>,
) -> AppResult<Json<serde_json::Value>> {
    // TODO: Phase 2 — return last 10 leads
    Err(AppError::InternalServerError("Not yet implemented".to_string()))
}
