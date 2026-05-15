use axum::{
    extract::{Request, State},
    middleware::Next,
    response::Response,
};

use crate::{
    config::env::Config,
    utils::{errors::AppError, jwt::verify_access_token},
};

/// Extracts and validates JWT access token from the Authorization: Bearer header.
/// Injects verified `Claims` into request extensions for downstream handlers.
pub async fn require_auth(
    State(config): State<crate::routes::AppState>,
    mut request: Request,
    next: Next,
) -> Result<Response, AppError> {
    let token = extract_bearer_token(&request)?;
    let claims = verify_access_token(&token, &config.config)?;
    request.extensions_mut().insert(claims);
    Ok(next.run(request).await)
}

/// Requires the user to have the ADMIN role
pub async fn require_admin(
    State(state): State<crate::routes::AppState>,
    mut request: Request,
    next: Next,
) -> Result<Response, AppError> {
    let token = extract_bearer_token(&request)?;
    let claims = verify_access_token(&token, &state.config)?;

    if claims.role != "ADMIN" {
        return Err(AppError::Forbidden(
            "Administrator access required".to_string(),
        ));
    }

    request.extensions_mut().insert(claims);
    Ok(next.run(request).await)
}

/// Requires the user to be ADMIN or COUNSELOR
pub async fn require_counselor_or_admin(
    State(state): State<crate::routes::AppState>,
    mut request: Request,
    next: Next,
) -> Result<Response, AppError> {
    let token = extract_bearer_token(&request)?;
    let claims = verify_access_token(&token, &state.config)?;

    if claims.role != "ADMIN" && claims.role != "COUNSELOR" {
        return Err(AppError::Forbidden(
            "Counselor or Administrator access required".to_string(),
        ));
    }

    request.extensions_mut().insert(claims);
    Ok(next.run(request).await)
}

/// Helper: extracts Bearer token from Authorization header
fn extract_bearer_token(request: &Request) -> Result<String, AppError> {
    let auth_header = request
        .headers()
        .get("Authorization")
        .and_then(|v| v.to_str().ok())
        .ok_or_else(|| AppError::Unauthorized("Authorization header missing".to_string()))?;

    if !auth_header.starts_with("Bearer ") {
        return Err(AppError::Unauthorized(
            "Authorization header must be Bearer token".to_string(),
        ));
    }

    Ok(auth_header.trim_start_matches("Bearer ").to_string())
}
