use crate::{
    models::newsletter::{
        NewsletterSubscriber, SubscribeOutcome, SubscribeRequest, SubscriberStatus,
    },
    utils::errors::{AppError, AppResult},
};
use sqlx::PgPool;

pub struct NewsletterRepository {
    pub db: PgPool,
}

impl NewsletterRepository {
    pub fn new(db: PgPool) -> Self {
        Self { db }
    }

    /// Attempt to subscribe an email address.
    ///
    /// Three outcomes:
    /// 1. Row doesn't exist → INSERT → returns Created
    /// 2. Row exists, status = 'active' → no-op → returns AlreadySubscribed
    /// 3. Row exists, status = 'unsubscribed' → UPDATE to active → Resubscribed
    ///
    /// The UNIQUE constraint on email is the canonical deduplication guard.
    /// We handle the conflict in Rust rather than relying on ON CONFLICT DO NOTHING
    /// so we can differentiate between case 2 and 3.
    pub async fn subscribe(&self, req: &SubscribeRequest) -> AppResult<SubscribeOutcome> {
        let email = req.email.trim().to_lowercase();
        let source = req.source.as_deref().unwrap_or("website");

        // Check for an existing row first (one cheap point-lookup by UNIQUE index)
        let existing: Option<NewsletterSubscriber> = sqlx::query_as(
            "SELECT id, email, status, source, confirmed_at, subscribed_at, unsubscribed_at, created_at, updated_at
             FROM newsletter_subscribers WHERE email = $1",
        )
        .bind(&email)
        .fetch_optional(&self.db)
        .await
        .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?;

        match existing {
            // Already actively subscribed — return the sentinel, no DB write
            Some(row) if row.status == SubscriberStatus::Active => {
                Ok(SubscribeOutcome::AlreadySubscribed)
            }

            // Previously unsubscribed — reactivate
            Some(_row) => {
                let updated = sqlx::query_as(
                    r#"
                    UPDATE newsletter_subscribers
                    SET status          = 'active',
                        subscribed_at   = NOW(),
                        unsubscribed_at = NULL,
                        updated_at      = NOW()
                    WHERE email = $1
                    RETURNING id, email, status, source, confirmed_at,
                              subscribed_at, unsubscribed_at, created_at, updated_at
                    "#,
                )
                .bind(&email)
                .fetch_one(&self.db)
                .await
                .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?;
                Ok(SubscribeOutcome::Resubscribed(updated))
            }

            // New subscriber
            None => {
                let created = sqlx::query_as(
                    r#"
                    INSERT INTO newsletter_subscribers (email, source)
                    VALUES ($1, $2)
                    RETURNING id, email, status, source, confirmed_at,
                              subscribed_at, unsubscribed_at, created_at, updated_at
                    "#,
                )
                .bind(&email)
                .bind(source)
                .fetch_one(&self.db)
                .await
                .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?;
                Ok(SubscribeOutcome::Created(created))
            }
        }
    }

    /// Admin: list all subscribers with optional status filter.
    pub async fn list_all(
        &self,
        status_filter: Option<&str>,
    ) -> AppResult<Vec<NewsletterSubscriber>> {
        sqlx::query_as(
            r#"
            SELECT id, email, status, source, confirmed_at,
                   subscribed_at, unsubscribed_at, created_at, updated_at
            FROM newsletter_subscribers
            WHERE ($1::text IS NULL OR status::text = $1)
            ORDER BY subscribed_at DESC
            "#,
        )
        .bind(status_filter)
        .fetch_all(&self.db)
        .await
        .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))
    }

    /// Mark a subscriber as unsubscribed (soft delete).
    #[allow(dead_code)]
    pub async fn unsubscribe(&self, email: &str) -> AppResult<()> {
        sqlx::query(
            r#"
            UPDATE newsletter_subscribers
            SET status          = 'unsubscribed',
                unsubscribed_at = NOW(),
                updated_at      = NOW()
            WHERE email = $1
            "#,
        )
        .bind(email.trim().to_lowercase())
        .execute(&self.db)
        .await
        .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?;
        Ok(())
    }
}
