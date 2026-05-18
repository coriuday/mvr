use axum::{extract::State, Json};
use crate::{
    models::lead::CreateLeadRequest,
    routes::AppState,
    services::lead_service::LeadService,
    utils::{
        errors::{AppError, AppResult},
        response::MessageResponse,
    },
};

/// Contact form payload (public-facing, friendlier field names than CreateLeadRequest)
#[derive(Debug, serde::Deserialize)]
pub struct ContactRequest {
    pub name: String,
    pub email: String,
    pub phone: Option<String>,
    pub subject: Option<String>,
    pub message: String,
    pub country_interest: Option<String>,
}

// ─────────────────────────────────────────────
// POST /api/contact
// ─────────────────────────────────────────────
pub async fn send_contact(
    State(state): State<AppState>,
    Json(body): Json<ContactRequest>,
) -> AppResult<Json<MessageResponse>> {
    // Basic validation
    if body.name.trim().is_empty() {
        return Err(AppError::BadRequest("Name is required".to_string()));
    }
    if body.email.trim().is_empty() || !body.email.contains('@') {
        return Err(AppError::BadRequest("A valid email address is required".to_string()));
    }
    if body.message.trim().is_empty() {
        return Err(AppError::BadRequest("Message cannot be empty".to_string()));
    }

    // Save lead to database and send notification emails
    let create_req = CreateLeadRequest {
        name: body.name.clone(),
        email: body.email.clone(),
        phone: body.phone.clone(),
        message: Some(body.message.clone()),
        country_interest: body.country_interest.clone(),
        source: None, // defaults to Website
    };

    let lead_service = LeadService::new(state.db.clone(), state.config.clone());

    // We intentionally soft-fail on the db/service failure here because contact form
    // historically didn't return server error to users.
    if let Err(e) = lead_service.create_lead_with_notification(&create_req).await {
        tracing::error!("Failed to save contact lead or send notifications: {:?}", e);
    }

    Ok(Json(MessageResponse::new(
        "Thank you! We've received your inquiry and will contact you within 24 hours.",
    )))
}
