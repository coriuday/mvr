use axum::{extract::State, Json};

use crate::{
    models::user::{LoginRequest, RegisterRequest},
    routes::AppState,
    services::auth_service::AuthService,
    utils::errors::AppResult,
};

/// Request body for token refresh
#[derive(Debug, serde::Deserialize)]
pub struct RefreshRequest {
    pub refresh_token: String,
}

// ─────────────────────────────────────────────
// POST /api/auth/register  (admin only)
// ─────────────────────────────────────────────
pub async fn register(
    State(state): State<AppState>,
    Json(body): Json<RegisterRequest>,
) -> AppResult<Json<serde_json::Value>> {
    let auth_service = AuthService::new(state.db.clone(), state.config.clone());
    let user = auth_service.register(body).await?;

    Ok(Json(serde_json::json!({
        "success": true,
        "message": "Account created successfully",
        "data": user,
    })))
}

// ─────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────
pub async fn login(
    State(state): State<AppState>,
    Json(body): Json<LoginRequest>,
) -> AppResult<Json<serde_json::Value>> {
    let auth_service = AuthService::new(state.db.clone(), state.config.clone());
    let response = auth_service.login(body).await?;

    Ok(Json(serde_json::json!({
        "success": true,
        "message": "Login successful",
        "data": response,
    })))
}

// ─────────────────────────────────────────────
// POST /api/auth/refresh
// ─────────────────────────────────────────────
pub async fn refresh_token(
    State(state): State<AppState>,
    Json(body): Json<RefreshRequest>,
) -> AppResult<Json<serde_json::Value>> {
    let auth_service = AuthService::new(state.db.clone(), state.config.clone());
    let response = auth_service.refresh_token(&body.refresh_token).await?;

    Ok(Json(serde_json::json!({
        "success": true,
        "data": response,
    })))
}
