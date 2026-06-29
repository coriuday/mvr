use axum::{
    extract::{Request, State},
    http::header,
    middleware::Next,
    response::Response,
};
use uuid::Uuid;

use crate::{
    repositories::auth_repository::AuthRepository,
    utils::{
        errors::AppError,
        jwt::{verify_access_token, verify_pending_totp_token},
    },
};

/// Extracts and validates JWT access token from either:
/// 1. `Authorization: Bearer <token>` header  (legacy / API clients)
/// 2. `mvr_access` httpOnly cookie             (browser cookie auth)
pub async fn require_auth(
    State(state): State<crate::routes::AppState>,
    mut request: Request,
    next: Next,
) -> Result<Response, AppError> {
    let token = extract_token(request.headers())?;
    let claims = verify_access_token(&token, &state.config)?;

    if state.blocklist.is_blocked(&claims.jti).await {
        return Err(AppError::Unauthorized(
            "Session has been invalidated. Please log in again.".to_string(),
        ));
    }

    let user_id = Uuid::parse_str(&claims.sub)
        .map_err(|_| AppError::Unauthorized("Invalid token".to_string()))?;
    let repo = AuthRepository::new(state.db.clone());
    if !repo.is_user_active(user_id).await? {
        return Err(AppError::Unauthorized(
            "Account is deactivated. Contact admin.".to_string(),
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

    let user_id = Uuid::parse_str(&claims.sub)
        .map_err(|_| AppError::Unauthorized("Invalid token".to_string()))?;
    let repo = AuthRepository::new(state.db.clone());
    if !repo.is_user_active(user_id).await? {
        return Err(AppError::Unauthorized(
            "Account is deactivated. Contact admin.".to_string(),
        ));
    }

    request.extensions_mut().insert(claims);
    Ok(next.run(request).await)
}

/// Requires the user to be ADMIN or COUNSELOR (leads access).
pub async fn require_counselor_or_admin(
    State(state): State<crate::routes::AppState>,
    mut request: Request,
    next: Next,
) -> Result<Response, AppError> {
    let token = extract_token(request.headers())?;
    let claims = verify_access_token(&token, &state.config)?;

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

    let user_id = Uuid::parse_str(&claims.sub)
        .map_err(|_| AppError::Unauthorized("Invalid token".to_string()))?;
    let repo = AuthRepository::new(state.db.clone());
    if !repo.is_user_active(user_id).await? {
        return Err(AppError::Unauthorized(
            "Account is deactivated. Contact admin.".to_string(),
        ));
    }

    request.extensions_mut().insert(claims);
    Ok(next.run(request).await)
}

/// Requires a valid pending TOTP cookie from the password login step.
pub async fn require_pending_totp(
    State(state): State<crate::routes::AppState>,
    mut request: Request,
    next: Next,
) -> Result<Response, AppError> {
    let token = extract_pending_totp_cookie(request.headers())
        .ok_or_else(|| AppError::Unauthorized("2FA session required".to_string()))?;
    let claims = verify_pending_totp_token(&token, &state.config)?;

    if state.blocklist.is_blocked(&claims.jti).await {
        return Err(AppError::Unauthorized(
            "2FA session has expired. Please log in again.".to_string(),
        ));
    }

    request.extensions_mut().insert(claims);
    Ok(next.run(request).await)
}

/// Extracts a JWT from either the Authorization header OR the mvr_access cookie.
fn extract_token(headers: &axum::http::HeaderMap) -> Result<String, AppError> {
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

fn extract_pending_totp_cookie(headers: &axum::http::HeaderMap) -> Option<String> {
    headers
        .get(header::COOKIE)
        .and_then(|v| v.to_str().ok())
        .and_then(|cookies| {
            cookies
                .split(';')
                .map(|c| c.trim())
                .find(|c| c.starts_with("mvr_pending_totp="))
                .map(|c| c.trim_start_matches("mvr_pending_totp=").to_string())
        })
}
