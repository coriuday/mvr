use crate::{
    models::newsletter::{NewsletterSubscriber, SubscribeOutcome, SubscribeRequest},
    repositories::newsletter_repository::NewsletterRepository,
    utils::{errors::AppResult, validators::validate_email},
};
use sqlx::PgPool;

pub struct NewsletterService {
    db: PgPool,
}

impl NewsletterService {
    pub fn new(db: PgPool) -> Self {
        Self { db }
    }

    /// Validate and process a subscribe request.
    ///
    /// Validation:
    ///   1. email must be non-empty
    ///   2. email must pass RFC-5321 format check (validator crate)
    ///   3. email is normalised to lowercase before storage
    ///
    /// Duplicate handling is intentionally user-friendly:
    ///   - New subscriber  → 201 Created, "Subscribed!"
    ///   - Already active  → 200 OK, friendly "already subscribed" message
    ///   - Was unsubscribed → 200 OK, "welcome back" message
    ///
    /// We do NOT return 409 Conflict for duplicates because that would let
    /// bots enumerate which email addresses are in the list.
    pub async fn subscribe(&self, req: &SubscribeRequest) -> AppResult<SubscribeOutcome> {
        validate_email(&req.email)?;
        let normalised = SubscribeRequest {
            email: req.email.trim().to_lowercase(),
            source: req.source.clone(),
        };
        NewsletterRepository::new(self.db.clone())
            .subscribe(&normalised)
            .await
    }

    /// Admin: list all subscribers.
    pub async fn list_all(
        &self,
        status_filter: Option<&str>,
    ) -> AppResult<Vec<NewsletterSubscriber>> {
        NewsletterRepository::new(self.db.clone())
            .list_all(status_filter)
            .await
    }

    /// Mark a subscriber as unsubscribed (triggered by unsubscribe link etc.)
    #[allow(dead_code)]
    pub async fn unsubscribe(&self, email: &str) -> AppResult<()> {
        validate_email(email)?;
        NewsletterRepository::new(self.db.clone())
            .unsubscribe(email)
            .await
    }
}
