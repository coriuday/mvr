use crate::{
    models::newsletter::{SubscribeOutcome, SubscribeRequest},
    routes::AppState,
    services::newsletter_service::NewsletterService,
    utils::errors::AppResult,
};
use axum::{Json, extract::State, http::StatusCode};

// ─── POST /api/newsletter/subscribe  (public, rate-limited) ──────────────────
pub async fn subscribe(
    State(state): State<AppState>,
    Json(body): Json<SubscribeRequest>,
) -> AppResult<(StatusCode, Json<serde_json::Value>)> {
    match NewsletterService::new(state.db).subscribe(&body).await? {
        SubscribeOutcome::Created(_) => Ok((
            StatusCode::CREATED,
            Json(serde_json::json!({
                "success": true,
                "message": "Subscribed! Welcome to MVR Consultants."
            })),
        )),
        SubscribeOutcome::AlreadySubscribed => Ok((
            StatusCode::OK,
            Json(serde_json::json!({
                "success": true,
                "message": "You're already subscribed! We'll keep sending updates."
            })),
        )),
        SubscribeOutcome::Resubscribed(_) => Ok((
            StatusCode::OK,
            Json(serde_json::json!({
                "success": true,
                "message": "Welcome back! You've been re-subscribed successfully."
            })),
        )),
    }
}

// ─── GET /api/admin/newsletter  (admin — subscriber list) ────────────────────
pub async fn list_subscribers(
    State(state): State<AppState>,
    axum::extract::Query(params): axum::extract::Query<std::collections::HashMap<String, String>>,
) -> AppResult<Json<serde_json::Value>> {
    let status_filter = params.get("status").map(|s| s.as_str());
    let subscribers = NewsletterService::new(state.db)
        .list_all(status_filter)
        .await?;
    Ok(Json(serde_json::json!({
        "success": true,
        "data": subscribers,
        "meta": { "total": subscribers.len() }
    })))
}
