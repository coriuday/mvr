use sqlx::PgPool;

use crate::{
    config::env::Config,
    models::lead::{CreateLeadRequest, Lead},
    repositories::lead_repository::LeadRepository,
    services::email_service::EmailService,
    utils::errors::AppResult,
};

pub struct LeadService {
    db: PgPool,
    config: Config,
}

impl LeadService {
    pub fn new(db: PgPool, config: Config) -> Self {
        Self { db, config }
    }

    /// Create a new lead and send email notifications (admin + student)
    pub async fn create_lead_with_notification(
        &self,
        req: &CreateLeadRequest,
    ) -> AppResult<Lead> {
        let repo = LeadRepository::new(self.db.clone());

        // Persist the lead (soft-fail on DB error so email still sends)
        let lead_result = repo.create(req).await;
        if let Err(ref e) = lead_result {
            tracing::error!("Failed to save contact lead: {:?}", e);
        }

        if !self.config.resend_api_key.is_empty() {
            let email_service = EmailService::new(
                &self.config.resend_api_key,
                &self.config.email_from,
                &self.config.email_from_name,
                &self.config.admin_email,
                &self.config.admin_email_guntur,
            );

            // Admin notification (fire-and-forget)
            let _ = email_service
                .send_lead_notification(
                    &req.name,
                    &req.email,
                    req.phone.as_deref(),
                    req.message.as_deref(),
                    req.country_interest.as_deref(),
                )
                .await;

            // Student confirmation (fire-and-forget)
            let _ = email_service
                .send_inquiry_confirmation(&req.email, &req.name)
                .await;
        }

        lead_result
    }
}
