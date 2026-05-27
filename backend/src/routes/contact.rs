use crate::{
    routes::AppState,
    services::contact_service::{ContactRequest, ContactService},
    utils::{errors::AppResult, response::MessageResponse},
};
use axum::{Json, extract::State};

// ─────────────────────────────────────────────
// POST /api/contact
// ─────────────────────────────────────────────
pub async fn send_contact(
    State(state): State<AppState>,
    Json(body): Json<ContactRequest>,
) -> AppResult<Json<MessageResponse>> {
    ContactService::new(state.db, state.config)
        .handle_inquiry(&body)
        .await?;
    Ok(Json(MessageResponse::new(
        "Thank you! We've received your inquiry and will contact you within 24 hours.",
    )))
}
