use crate::{
    models::university::{CreateUniversityRequest, UniversityFilter},
    routes::AppState,
    services::university_service::{UniversityService, UpdateUniversityRequest},
    utils::{errors::AppResult, response::MessageResponse},
};
use axum::{
    Json,
    extract::{Path, Query, State},
};
use uuid::Uuid;

// ─── GET /api/universities  (public) ─────────────────────────────────────────
pub async fn get_all_universities(
    State(state): State<AppState>,
    Query(filter): Query<UniversityFilter>,
) -> AppResult<Json<serde_json::Value>> {
    let (unis, total) = UniversityService::new(state.db).list(&filter).await?;
    let page = filter.page.unwrap_or(1);
    let per_page = filter.per_page.unwrap_or(20);
    Ok(Json(serde_json::json!({
        "success": true,
        "data": unis,
        "meta": {
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": (total as f64 / per_page as f64).ceil() as i64,
        }
    })))
}

// ─── POST /api/universities  (admin) ─────────────────────────────────────────
pub async fn create_university(
    State(state): State<AppState>,
    Json(body): Json<CreateUniversityRequest>,
) -> AppResult<Json<serde_json::Value>> {
    let uni = UniversityService::new(state.db).create(&body).await?;
    Ok(Json(serde_json::json!({ "success": true, "data": uni })))
}

// ─── PUT /api/universities/:id  (admin) ──────────────────────────────────────
// Uses a typed UpdateUniversityRequest instead of raw serde_json::Value.
pub async fn update_university(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(body): Json<UpdateUniversityRequest>,
) -> AppResult<Json<serde_json::Value>> {
    let uni = UniversityService::new(state.db)
        .update_featured(id, &body)
        .await?;
    Ok(Json(serde_json::json!({ "success": true, "data": uni })))
}

// ─── DELETE /api/universities/:id  (admin) ────────────────────────────────────
pub async fn delete_university(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<MessageResponse>> {
    UniversityService::new(state.db).delete(id).await?;
    Ok(Json(MessageResponse::new(
        "University deleted successfully",
    )))
}
