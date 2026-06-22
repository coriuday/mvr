use crate::{
    models::testimonial::{CreateTestimonialRequest, TestimonialFilter},
    repositories::testimonial_repository::TestimonialRepository,
    routes::AppState,
    utils::{errors::AppResult, response::MessageResponse},
};
use axum::{
    Json,
    extract::{Path, Query, State},
};
use uuid::Uuid;

/// GET /api/testimonials  (public)
pub async fn get_all_testimonials(
    State(state): State<AppState>,
    Query(filter): Query<TestimonialFilter>,
) -> AppResult<Json<serde_json::Value>> {
    let repo = TestimonialRepository::new(state.db);
    let testimonials = repo.find_all(&filter).await?;
    Ok(Json(serde_json::json!({
        "success": true,
        "data": testimonials,
        "meta": { "total": testimonials.len() }
    })))
}

/// POST /api/testimonials  (admin only)
pub async fn create_testimonial(
    State(state): State<AppState>,
    Json(body): Json<CreateTestimonialRequest>,
) -> AppResult<Json<serde_json::Value>> {
    let testimonial = TestimonialRepository::new(state.db).create(&body).await?;
    Ok(Json(
        serde_json::json!({ "success": true, "data": testimonial }),
    ))
}

/// PUT /api/testimonials/:id  (admin only)
pub async fn update_testimonial(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(body): Json<serde_json::Value>,
) -> AppResult<Json<serde_json::Value>> {
    let testimonial = TestimonialRepository::new(state.db)
        .update(id, &body)
        .await?;
    Ok(Json(
        serde_json::json!({ "success": true, "data": testimonial }),
    ))
}

/// DELETE /api/testimonials/:id  (admin only)
pub async fn delete_testimonial(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<MessageResponse>> {
    TestimonialRepository::new(state.db).delete(id).await?;
    Ok(Json(MessageResponse::new(
        "Testimonial deleted successfully",
    )))
}
