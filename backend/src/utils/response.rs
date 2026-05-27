use axum::{Json, http::StatusCode, response::IntoResponse};
use serde::Serialize;

/// Standard JSON API response wrapper.
#[derive(Debug, Serialize)]
#[allow(dead_code)]
pub struct ApiResponse<T: Serialize> {
    pub success: bool,
    pub message: Option<String>,
    pub data: Option<T>,
}

impl<T: Serialize> ApiResponse<T> {
    #[allow(dead_code)]
    pub fn success(data: T) -> Self {
        ApiResponse {
            success: true,
            message: None,
            data: Some(data),
        }
    }

    #[allow(dead_code)]
    pub fn success_with_message(data: T, message: impl Into<String>) -> Self {
        ApiResponse {
            success: true,
            message: Some(message.into()),
            data: Some(data),
        }
    }
}

/// Response with no data payload (e.g., DELETE operations)
#[derive(Debug, Serialize)]
pub struct MessageResponse {
    pub success: bool,
    pub message: String,
}

impl MessageResponse {
    pub fn new(message: impl Into<String>) -> Self {
        MessageResponse {
            success: true,
            message: message.into(),
        }
    }
}

/// Paginated response wrapper
#[derive(Debug, Serialize)]
#[allow(dead_code)]
pub struct PaginatedResponse<T: Serialize> {
    pub success: bool,
    pub data: Vec<T>,
    pub total: i64,
    pub page: i64,
    pub per_page: i64,
    pub total_pages: i64,
}

impl<T: Serialize> PaginatedResponse<T> {
    #[allow(dead_code)]
    pub fn new(data: Vec<T>, total: i64, page: i64, per_page: i64) -> Self {
        let total_pages = (total + per_page - 1) / per_page;
        PaginatedResponse {
            success: true,
            data,
            total,
            page,
            per_page,
            total_pages,
        }
    }
}

/// Health check handler
pub async fn health_handler() -> impl IntoResponse {
    (
        StatusCode::OK,
        Json(serde_json::json!({
            "success": true,
            "status": "healthy",
            "service": "mvr-backend",
            "version": env!("CARGO_PKG_VERSION"),
        })),
    )
}
