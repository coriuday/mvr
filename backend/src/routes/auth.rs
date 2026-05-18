use axum::{extract::State, Json};
use uuid::Uuid;

use crate::{
    repositories::auth_repository::AuthRepository,
    routes::AppState,
    utils::{
        errors::{AppError, AppResult},
        response::MessageResponse,
    },
};

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
// GET /api/auth/me  (requires auth)
// ─────────────────────────────────────────────
pub async fn get_me(
    State(state): State<AppState>,
    axum::Extension(claims): axum::Extension<crate::utils::jwt::Claims>,
) -> AppResult<Json<serde_json::Value>> {
    let user_id = Uuid::parse_str(&claims.sub)
        .map_err(|_| AppError::Unauthorized("Invalid token".to_string()))?;

    let repo = AuthRepository::new(state.db.clone());
    let user = repo.find_by_id(user_id).await?;

    Ok(Json(serde_json::json!({
        "success": true,
        "data": user,
    })))
}
