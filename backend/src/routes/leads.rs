use axum::{extract::{Path, Query, State}, Json};
use uuid::Uuid;
use crate::{
    models::lead::{CreateLeadRequest, LeadFilter, UpdateLeadRequest},
    repositories::lead_repository::LeadRepository,
    routes::AppState,
    services::lead_service::LeadService,
    utils::{
        errors::AppResult,
        response::{MessageResponse, PaginatedResponse},
    },
};

// ─── POST /api/leads  (public — inquiry form) ────────────────────────────────
pub async fn create_lead(
    State(state): State<AppState>,
    Json(body): Json<CreateLeadRequest>,
) -> AppResult<Json<serde_json::Value>> {
    let lead_service = LeadService::new(state.db.clone(), state.config.clone());
    let lead = lead_service.create_lead_with_notification(&body).await?;
    Ok(Json(serde_json::json!({ "success": true, "data": lead })))
}

// ─── GET /api/leads  (admin) ─────────────────────────────────────────────────
pub async fn get_all_leads(
    State(state): State<AppState>,
    Query(filter): Query<LeadFilter>,
) -> AppResult<Json<serde_json::Value>> {
    let repo = LeadRepository::new(state.db.clone());
    let (leads, total) = repo.find_all(&filter).await?;
    let page = filter.page.unwrap_or(1);
    let per_page = filter.per_page.unwrap_or(20);
    Ok(Json(serde_json::json!({
        "success": true,
        "data": leads,
        "meta": { "total": total, "page": page, "per_page": per_page,
                  "total_pages": (total as f64 / per_page as f64).ceil() as i64 }
    })))
}

// ─── GET /api/leads/:id  (admin) ─────────────────────────────────────────────
pub async fn get_lead(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<serde_json::Value>> {
    let repo = LeadRepository::new(state.db.clone());
    let lead = repo.find_by_id(id).await?;
    Ok(Json(serde_json::json!({ "success": true, "data": lead })))
}

// ─── PUT /api/leads/:id  (admin) ─────────────────────────────────────────────
pub async fn update_lead(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(body): Json<UpdateLeadRequest>,
) -> AppResult<Json<serde_json::Value>> {
    let repo = LeadRepository::new(state.db.clone());
    let lead = repo.update(id, &body).await?;
    Ok(Json(serde_json::json!({ "success": true, "data": lead })))
}

// ─── DELETE /api/leads/:id  (admin) ──────────────────────────────────────────
pub async fn delete_lead(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<MessageResponse>> {
    let repo = LeadRepository::new(state.db.clone());
    repo.delete(id).await?;
    Ok(Json(MessageResponse::new("Lead deleted successfully")))
}
