use axum::{extract::{Path, Query, State}, Json};
use uuid::Uuid;
use crate::{
    models::university::{CreateUniversityRequest, UniversityFilter},
    services::university_service::UniversityService,
    routes::AppState,
    utils::{errors::AppResult, response::MessageResponse},
};

// ─── GET /api/universities  (public) ─────────────────────────────────────────
pub async fn get_all_universities(
    State(state): State<AppState>,
    Query(filter): Query<UniversityFilter>,
) -> AppResult<Json<serde_json::Value>> {
    let service = UniversityService::new(state.db.clone());
    let (unis, total) = service.get_all(&filter).await?;
    let page = filter.page.unwrap_or(1);
    let per_page = filter.per_page.unwrap_or(20);
    Ok(Json(serde_json::json!({
        "success": true,
        "data": unis,
        "meta": { "total": total, "page": page, "per_page": per_page,
                  "total_pages": (total as f64 / per_page as f64).ceil() as i64 }
    })))
}

// ─── POST /api/universities  (admin) ─────────────────────────────────────────
pub async fn create_university(
    State(state): State<AppState>,
    Json(body): Json<CreateUniversityRequest>,
) -> AppResult<Json<serde_json::Value>> {
    let service = UniversityService::new(state.db.clone());
    let uni = service.create(&body).await?;
    Ok(Json(serde_json::json!({ "success": true, "data": uni })))
}

// ─── PUT /api/universities/:id  (admin) ──────────────────────────────────────
pub async fn update_university(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(body): Json<serde_json::Value>,
) -> AppResult<Json<serde_json::Value>> {
    let service = UniversityService::new(state.db.clone());
    let featured = body.get("is_featured")
        .and_then(|v| v.as_bool())
        .unwrap_or(false);
    let uni = service.update_featured(id, featured).await?;
    Ok(Json(serde_json::json!({ "success": true, "data": uni })))
}

// ─── DELETE /api/universities/:id  (admin) ────────────────────────────────────
pub async fn delete_university(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<MessageResponse>> {
    let service = UniversityService::new(state.db.clone());
    service.delete(id).await?;
    Ok(Json(MessageResponse::new("University deleted successfully")))
}
