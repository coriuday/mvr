use axum::{
    extract::{Request, State},
    http::header,
    middleware::Next,
    response::Response,
};

use crate::utils::{errors::AppError, jwt::verify_access_token};

/// Extracts and validates JWT access token from either:
/// 1. `Authorization: Bearer <token>` header  (legacy / API clients)
/// 2. `mvr_access` httpOnly cookie             (browser cookie auth)
///
/// After signature verification, checks the JTI blocklist to reject
/// tokens that were revoked by a prior logout call.
///
/// The blocklist check is async because the Redis backend is async (C-1 fix).
///
/// Bearer header takes priority so that existing tooling and the current
/// localStorage-based frontend continue to work during the migration.
pub async fn require_auth(
    State(state): State<crate::routes::AppState>,
    mut request: Request,
    next: Next,
) -> Result<Response, AppError> {
    let token = extract_token(request.headers())?;
    let claims = verify_access_token(&token, &state.config)?;

    // C-1: reject revoked tokens — blocklist may be Redis or in-memory
    if state.blocklist.is_blocked(&claims.jti).await {
        return Err(AppError::Unauthorized(
            "Session has been invalidated. Please log in again.".to_string(),
        ));
    }

    request.extensions_mut().insert(claims);
    Ok(next.run(request).await)
}

/// Requires the user to have the ADMIN role
pub async fn require_admin(
    State(state): State<crate::routes::AppState>,
    mut request: Request,
    next: Next,
) -> Result<Response, AppError> {
    let token = extract_token(request.headers())?;
    let claims = verify_access_token(&token, &state.config)?;

    // C-1: reject revoked tokens
    if state.blocklist.is_blocked(&claims.jti).await {
        return Err(AppError::Unauthorized(
            "Session has been invalidated. Please log in again.".to_string(),
        ));
    }

    if claims.role != "ADMIN" {
        return Err(AppError::Forbidden(
            "Administrator access required".to_string(),
        ));
    }

    request.extensions_mut().insert(claims);
    Ok(next.run(request).await)
}

/// Requires the user to be ADMIN or COUNSELOR
#[allow(dead_code)]
pub async fn require_counselor_or_admin(
    State(state): State<crate::routes::AppState>,
    mut request: Request,
    next: Next,
) -> Result<Response, AppError> {
    let token = extract_token(request.headers())?;
    let claims = verify_access_token(&token, &state.config)?;

    // C-1: reject revoked tokens
    if state.blocklist.is_blocked(&claims.jti).await {
        return Err(AppError::Unauthorized(
            "Session has been invalidated. Please log in again.".to_string(),
        ));
    }

    if claims.role != "ADMIN" && claims.role != "COUNSELOR" {
        return Err(AppError::Forbidden(
            "Counselor or Administrator access required".to_string(),
        ));
    }

    request.extensions_mut().insert(claims);
    Ok(next.run(request).await)
}

/// Extracts a JWT from either the Authorization header OR the mvr_access cookie.
/// Priority: Bearer header → cookie fallback.
fn extract_token(headers: &axum::http::HeaderMap) -> Result<String, AppError> {
    // 1. Try Authorization: Bearer <token>
    if let Some(auth) = headers
        .get(header::AUTHORIZATION)
        .and_then(|v| v.to_str().ok())
    {
        if auth.starts_with("Bearer ") {
            return Ok(auth.trim_start_matches("Bearer ").to_string());
        }
        return Err(AppError::Unauthorized(
            "Authorization header must be a Bearer token".to_string(),
        ));
    }

    // 2. Fallback: read mvr_access httpOnly cookie
    if let Some(cookie_val) = headers
        .get(header::COOKIE)
        .and_then(|v| v.to_str().ok())
        .and_then(|cookies| {
            cookies
                .split(';')
                .map(|c| c.trim())
                .find(|c| c.starts_with("mvr_access="))
                .map(|c| c.trim_start_matches("mvr_access=").to_string())
        })
    {
        return Ok(cookie_val);
    }

    Err(AppError::Unauthorized(
        "Authentication required. Please log in.".to_string(),
    ))
}
