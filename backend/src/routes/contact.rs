use axum::{extract::State, Json};
use serde::Deserialize;
use crate::{
    routes::AppState,
    utils::errors::AppResult,
    utils::response::MessageResponse,
};

#[derive(Debug, Deserialize)]
pub struct ContactRequest {
    pub name: String,
    pub email: String,
    pub phone: Option<String>,
    pub subject: Option<String>,
    pub message: String,
    pub country_interest: Option<String>,
}

pub async fn send_contact(
    State(_state): State<AppState>,
    Json(_body): Json<ContactRequest>,
) -> AppResult<Json<MessageResponse>> {
    Ok(Json(MessageResponse::new(
        "Thank you for your inquiry! We will contact you within 24 hours.",
    )))
}
