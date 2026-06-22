use crate::{
    models::user::{UpdateUserActiveRequest, UpdateUserRoleRequest},
    repositories::auth_repository::AuthRepository,
    routes::AppState,
    utils::errors::AppResult,
};
use axum::{
    Json,
    extract::{Path, State},
};
use uuid::Uuid;

// ─── GET /api/admin/users ─────────────────────────────────────────────────────
/// List all staff users (admin only).
pub async fn list_users(State(state): State<AppState>) -> AppResult<Json<serde_json::Value>> {
    let repo = AuthRepository::new(state.db);
    let users = repo.list_all().await?;
    let total = users.len();
    Ok(Json(serde_json::json!({
        "success": true,
        "data": users,
        "meta": { "total": total }
    })))
}

// ─── PUT /api/admin/users/:id/role ───────────────────────────────────────────
/// Assign or change a staff user's role.
///
/// C-2 security fix: role assignment is a distinct admin-only action,
/// decoupled from user registration to prevent mass-assignment attacks.
///
/// Only ADMIN accounts may call this endpoint (enforced by require_admin middleware).
/// An admin cannot inadvertently grant ADMIN via the registration form.
pub async fn update_role(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(body): Json<UpdateUserRoleRequest>,
) -> AppResult<Json<serde_json::Value>> {
    let repo = AuthRepository::new(state.db);
    let user = repo.update_role(id, &body).await?;
    Ok(Json(serde_json::json!({
        "success": true,
        "message": "User role updated successfully",
        "data": user,
    })))
}

// ─── PATCH /api/admin/users/:id/active ───────────────────────────────────────
pub async fn update_active(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(body): Json<UpdateUserActiveRequest>,
) -> AppResult<Json<serde_json::Value>> {
    let repo = AuthRepository::new(state.db);
    let user = repo.set_active(id, body.is_active).await?;
    Ok(Json(serde_json::json!({
        "success": true,
        "message": if body.is_active { "User activated" } else { "User deactivated" },
        "data": user,
    })))
}
