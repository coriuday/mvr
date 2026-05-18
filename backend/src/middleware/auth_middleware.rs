use axum::{
    extract::{Request, State},
    middleware::Next,
    response::Response,
};
use axum_extra::extract::cookie::CookieJar;

use crate::{
    utils::{errors::AppError, jwt::verify_access_token},
};

/// Extracts and validates JWT access token from the HttpOnly cookie.
/// Injects verified `Claims` into request extensions for downstream handlers.
pub async fn require_auth(
    State(config): State<crate::routes::AppState>,
    jar: CookieJar,
    mut request: Request,
    next: Next,
) -> Result<Response, AppError> {
    let token = extract_access_token(&jar)?;
    let claims = verify_access_token(&token, &config.config)?;
    request.extensions_mut().insert(claims);
    Ok(next.run(request).await)
}

/// Requires the user to have the ADMIN role
pub async fn require_admin(
    State(state): State<crate::routes::AppState>,
    jar: CookieJar,
    mut request: Request,
    next: Next,
) -> Result<Response, AppError> {
    let token = extract_access_token(&jar)?;
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
    jar: CookieJar,
    mut request: Request,
    next: Next,
) -> Result<Response, AppError> {
    let token = extract_access_token(&jar)?;
    let claims = verify_access_token(&token, &state.config)?;

    if claims.role != "ADMIN" && claims.role != "COUNSELOR" {
        return Err(AppError::Forbidden(
            "Counselor or Administrator access required".to_string(),
        ));
    }

    request.extensions_mut().insert(claims);
    Ok(next.run(request).await)
}

/// Helper: extracts access token from CookieJar
fn extract_access_token(jar: &CookieJar) -> Result<String, AppError> {
    jar.get("mvr_access_token")
        .map(|cookie| cookie.value().to_string())
        .ok_or_else(|| AppError::Unauthorized("Authentication cookie missing".to_string()))
}
