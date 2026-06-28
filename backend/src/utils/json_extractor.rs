use axum::{
    Json,
    extract::rejection::JsonRejection,
    response::{IntoResponse, Response},
};

use crate::utils::errors::AppError;

/// Maps Axum JSON deserialization failures to `AppError` JSON responses.
pub fn json_rejection_to_response(rejection: JsonRejection) -> Response {
    let message = match &rejection {
        JsonRejection::JsonDataError(err) => {
            format!("Invalid request body: {}", err)
        }
        JsonRejection::JsonSyntaxError(err) => {
            format!("Malformed JSON: {}", err)
        }
        JsonRejection::MissingJsonContentType(_) => {
            "Content-Type must be application/json".to_string()
        }
        _ => "Invalid JSON request body".to_string(),
    };

    AppError::BadRequest(message).into_response()
}

/// Unwraps a JSON extractor result or returns a JSON error response.
#[allow(clippy::result_large_err)]
pub fn parse_json_body<T>(result: Result<Json<T>, JsonRejection>) -> Result<T, Response> {
    result
        .map(|Json(value)| value)
        .map_err(json_rejection_to_response)
}
