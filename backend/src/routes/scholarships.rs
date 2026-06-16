use crate::{
    models::scholarship::CreateScholarshipRequest,
    repositories::scholarship_repository::ScholarshipRepository,
    routes::AppState,
    utils::{errors::AppResult, response::MessageResponse},
};
use axum::{
    Json,
    extract::{Path, State},
};
use uuid::Uuid;

/// GET /api/scholarships  (public)
pub async fn get_all_scholarships(
    State(state): State<AppState>,
) -> AppResult<Json<serde_json::Value>> {
    let repo = ScholarshipRepository::new(state.db);
    let scholarships = repo.find_all().await?;
    Ok(Json(serde_json::json!({
        "success": true,
        "data": scholarships,
        "meta": { "total": scholarships.len() }
    })))
}

/// POST /api/scholarships  (admin only)
pub async fn create_scholarship(
    State(state): State<AppState>,
    Json(body): Json<CreateScholarshipRequest>,
) -> AppResult<Json<serde_json::Value>> {
    let scholarship = ScholarshipRepository::new(state.db).create(&body).await?;
    Ok(Json(serde_json::json!({ "success": true, "data": scholarship })))
}

/// PUT /api/scholarships/:id  (admin only)
pub async fn update_scholarship(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(body): Json<serde_json::Value>,
) -> AppResult<Json<serde_json::Value>> {
    let scholarship = ScholarshipRepository::new(state.db).update(id, &body).await?;
    Ok(Json(serde_json::json!({ "success": true, "data": scholarship })))
}

/// DELETE /api/scholarships/:id  (admin only)
pub async fn delete_scholarship(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<MessageResponse>> {
    ScholarshipRepository::new(state.db).delete(id).await?;
    Ok(Json(MessageResponse::new("Scholarship deleted successfully")))
}
