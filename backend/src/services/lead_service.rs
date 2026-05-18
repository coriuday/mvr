use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    config::env::Config,
    models::lead::{CreateLeadRequest, Lead, LeadFilter, UpdateLeadRequest},
    repositories::lead_repository::LeadRepository,
    services::email_service::EmailService,
    utils::errors::AppResult,
};

pub struct LeadService {
    repo: LeadRepository,
    email_service: EmailService,
}

impl LeadService {
    pub fn new(db: PgPool, config: &Config) -> Self {
        Self {
            repo: LeadRepository::new(db),
            email_service: EmailService::new(
                &config.resend_api_key,
                &config.email_from,
                &config.email_from_name,
                &config.admin_email,
                &config.admin_email_guntur,
            ),
        }
    }

    /// Create a new lead and send email notifications asynchronously
    pub async fn create_lead(&self, req: &CreateLeadRequest) -> AppResult<Lead> {
        let lead = self.repo.create(req).await?;

        // Extract data needed for emails before passing to tasks, or clone what's needed
        let lead_name = req.name.clone();
        let lead_email = req.email.clone();
        let lead_phone = req.phone.clone();
        let lead_message = req.message.clone();
        let country_interest = req.country_interest.clone();

        // Send admin notification
        if !self.email_service.api_key.is_empty() {
            let email_service = self.email_service.clone();
            tokio::spawn(async move {
                let _ = email_service
                    .send_lead_notification(
                        &lead_name,
                        &lead_email,
                        lead_phone.as_deref(),
                        lead_message.as_deref(),
                        country_interest.as_deref(),
                    )
                    .await;
            });
        }

        // Send inquiry confirmation to student
        if !self.email_service.api_key.is_empty() {
            let email_service_conf = self.email_service.clone();
            let lead_name_conf = req.name.clone();
            let lead_email_conf = req.email.clone();
            tokio::spawn(async move {
                let _ = email_service_conf
                    .send_inquiry_confirmation(&lead_email_conf, &lead_name_conf)
                    .await;
            });
        }

        Ok(lead)
    }

    pub async fn get_all_leads(&self, filter: &LeadFilter) -> AppResult<(Vec<Lead>, i64)> {
        self.repo.find_all(filter).await
    }

    pub async fn get_lead(&self, id: Uuid) -> AppResult<Lead> {
        self.repo.find_by_id(id).await
    }

    pub async fn update_lead(&self, id: Uuid, req: &UpdateLeadRequest) -> AppResult<Lead> {
        self.repo.update(id, req).await
    }

    pub async fn delete_lead(&self, id: Uuid) -> AppResult<()> {
        self.repo.delete(id).await
    }
}
