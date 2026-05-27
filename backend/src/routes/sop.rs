use axum::{extract::State, http::StatusCode, Json};
use crate::{
    routes::AppState,
    services::sop_service::{SopReviewRequest, SopService},
    utils::errors::AppResult,
};

/// POST /api/sop/review
///
/// Public endpoint — no auth required (tool is a lead magnet).
/// Rate-limited by IP in the router (3-burst, 1/120s — AI calls cost money).
pub async fn review_sop(
    State(state): State<AppState>,
    Json(body): Json<SopReviewRequest>,
) -> AppResult<(StatusCode, Json<serde_json::Value>)> {
    let service = SopService::new(&state.config.gemini_api_key);

    // Fail fast with a clear message if API key not set
    if !service.is_configured() {
        return Ok((
            StatusCode::SERVICE_UNAVAILABLE,
            Json(serde_json::json!({
                "success": false,
                "error": {
                    "code": "AI_NOT_CONFIGURED",
                    "message": "The AI review service is not yet available. Please contact us directly."
                }
            })),
        ));
    }

    let result = service.review_sop(&body).await?;

    Ok((
        StatusCode::OK,
        Json(serde_json::json!({
            "success": true,
            "data": result
        })),
    ))
}
