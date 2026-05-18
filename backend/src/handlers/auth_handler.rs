use axum::{extract::State, Json};
use uuid::Uuid;

use crate::{
    models::user::{LoginRequest, RegisterRequest},
    routes::AppState,
    services::auth_service::AuthService,
    utils::{
        errors::{AppError, AppResult},
        response::MessageResponse,
    },
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
    let service = AuthService::new(state.db.clone(), state.config.clone());
    let user = service.register(&body).await?;

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
    let service = AuthService::new(state.db.clone(), state.config.clone());
    let response = service.login(&body).await?;

    Ok(Json(serde_json::json!({
        "success": true,
        "message": "Login successful",
        "data": response,
    })))
}

// ─────────────────────────────────────────────
// POST /api/auth/logout  (requires auth)
// ─────────────────────────────────────────────
pub async fn logout(
    State(_state): State<AppState>,
) -> AppResult<Json<MessageResponse>> {
    // Stateless JWT — client just discards tokens.
    // Future: add token to a Redis denylist here.
    Ok(Json(MessageResponse::new("Logged out successfully")))
}

// ─────────────────────────────────────────────
// POST /api/auth/refresh
// ─────────────────────────────────────────────
pub async fn refresh_token(
    State(state): State<AppState>,
    Json(body): Json<RefreshRequest>,
) -> AppResult<Json<serde_json::Value>> {
    let service = AuthService::new(state.db.clone(), state.config.clone());
    let (access_token, new_refresh_token, user) = service.refresh_token(&body.refresh_token).await?;

    Ok(Json(serde_json::json!({
        "success": true,
        "data": {
            "access_token": access_token,
            "refresh_token": new_refresh_token,
            "token_type": "Bearer",
            "expires_in": state.config.jwt_expiry_hours * 3600,
            "user": user,
        }
    })))
}

// ─────────────────────────────────────────────
// GET /api/auth/me  (requires auth)
// ─────────────────────────────────────────────
pub async fn get_me(
    State(state): State<AppState>,
    axum::Extension(claims): axum::Extension<crate::utils::jwt::Claims>,
) -> AppResult<Json<serde_json::Value>> {
    let user_id = Uuid::parse_str(&claims.sub)
        .map_err(|_| AppError::Unauthorized("Invalid token".to_string()))?;

    let service = AuthService::new(state.db.clone(), state.config.clone());
    let user = service.get_me(user_id).await?;

    Ok(Json(serde_json::json!({
        "success": true,
        "data": user,
    })))
}
