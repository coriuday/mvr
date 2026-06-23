use crate::{
    config::env::Config,
    models::lead::CreateLeadRequest,
    repositories::lead_repository::LeadRepository,
    services::email_service::EmailService,
    utils::{
        errors::AppResult,
        validators::{validate_email, validate_length, validate_required},
    },
};
use sqlx::PgPool;

/// The parsed contact form fields.
/// Defined here so the route handler does not need to contain any validation logic.
#[derive(Debug, serde::Deserialize)]
pub struct ContactRequest {
    pub name: String,
    pub email: String,
    pub phone: Option<String>,
    pub subject: Option<String>,
    pub message: String,
    pub country_interest: Option<String>,
}

pub struct ContactService {
    db: PgPool,
    config: Config,
}

impl ContactService {
    pub fn new(db: PgPool, config: Config) -> Self {
        Self { db, config }
    }

    /// Process a contact form submission:
    /// 1. Validate all inputs.
    /// 2. Persist the lead (fail if DB insert fails).
    /// 3. Fire admin notification + student confirmation emails (fire-and-forget).
    pub async fn handle_inquiry(&self, body: &ContactRequest) -> AppResult<()> {
        // H-1 security fix: all user-controlled fields are bounded.
        validate_required(&body.name, "Name")?;
        validate_length(&body.name, "Name", 2, 100)?;
        validate_email(&body.email)?;
        validate_required(&body.message, "Message")?;
        validate_length(&body.message, "Message", 5, 2000)?;
        if let Some(phone) = &body.phone {
            validate_length(phone, "Phone", 0, 25)?;
        }
        if let Some(country) = &body.country_interest {
            validate_length(country, "Country of interest", 0, 100)?;
        }
        if let Some(subject) = &body.subject {
            validate_length(subject, "Subject", 0, 200)?;
        }

        let message = match &body.subject {
            Some(s) if !s.trim().is_empty() => format!("Subject: {}\n\n{}", s.trim(), body.message),
            _ => body.message.clone(),
        };

        let lead_repo = LeadRepository::new(self.db.clone());
        let create_req = CreateLeadRequest {
            name: body.name.clone(),
            email: body.email.clone(),
            phone: body.phone.clone(),
            message: Some(message.clone()),
            country_interest: body.country_interest.clone(),
            source: None,
        };
        lead_repo.create(&create_req).await?;

        // Send emails if the Resend API key is configured
        if !self.config.resend_api_key.is_empty() {
            let email_svc = EmailService::new(
                &self.config.resend_api_key,
                &self.config.email_from,
                &self.config.email_from_name,
                &self.config.admin_email,
                &self.config.admin_email_guntur,
            );

            let _ = email_svc
                .send_lead_notification(
                    &body.name,
                    &body.email,
                    body.phone.as_deref(),
                    Some(&message),
                    body.country_interest.as_deref(),
                )
                .await;

            let _ = email_svc
                .send_inquiry_confirmation(&body.email, &body.name)
                .await;
        }

        Ok(())
    }
}
