use axum::{extract::State, Json};
use crate::{
    models::lead::CreateLeadRequest,
    repositories::lead_repository::LeadRepository,
    routes::AppState,
    services::email_service::EmailService,
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

    // Save lead to database
    let lead_repo = LeadRepository::new(state.db.clone());
    let create_req = CreateLeadRequest {
        name: body.name.clone(),
        email: body.email.clone(),
        phone: body.phone.clone(),
        message: Some(body.message.clone()),
        country_interest: body.country_interest.clone(),
        source: None, // defaults to Website
    };

    // Persist the lead (soft-fail on DB error so email still sends)
    let lead_result = lead_repo.create(&create_req).await;
    if let Err(ref e) = lead_result {
        tracing::error!("Failed to save contact lead: {:?}", e);
    }

    // Send notification email to admin + confirmation to student
    if !state.config.resend_api_key.is_empty() {
        let email_service = EmailService::new(
            &state.config.resend_api_key,
            &state.config.email_from,
            &state.config.email_from_name,
            &state.config.admin_email,
            &state.config.admin_email_guntur,
        );

        // Admin notification to both offices (fire-and-forget)
        let _ = email_service
            .send_lead_notification(
                &body.name,
                &body.email,
                body.phone.as_deref(),
                Some(&body.message),
                body.country_interest.as_deref(),
            )
            .await;

        // Student confirmation (fire-and-forget)
        let _ = email_service
            .send_inquiry_confirmation(&body.email, &body.name)
            .await;
    }

    Ok(Json(MessageResponse::new(
        "Thank you! We've received your inquiry and will contact you within 24 hours.",
    )))
}
