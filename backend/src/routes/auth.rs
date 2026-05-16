use axum::{extract::State, Json};
use uuid::Uuid;
use crate::{
    models::user::{AuthTokenResponse, LoginRequest, RegisterRequest},
    repositories::auth_repository::AuthRepository,
    routes::AppState,
    utils::{
        errors::{AppError, AppResult},
        jwt::{generate_access_token, generate_refresh_token, verify_refresh_token},
        password::{hash_password, validate_password_strength, verify_password},
        response::MessageResponse,
    },
};

/// Request body for token refresh
#[derive(Debug, serde::Deserialize)]
pub struct RefreshRequest {
    pub refresh_token: String,
}

// ─────────────────────────────────────────────
// POST /api/auth/register  (admin only)
// ─────────────────────────────────────────────
pub async fn register(
    State(state): State<AppState>,
    Json(body): Json<RegisterRequest>,
) -> AppResult<Json<serde_json::Value>> {
    // Validate inputs
    if body.name.trim().is_empty() {
        return Err(AppError::BadRequest("Name is required".to_string()));
    }
    if body.email.trim().is_empty() {
        return Err(AppError::BadRequest("Email is required".to_string()));
    }

    validate_password_strength(&body.password)?;

    let repo = AuthRepository::new(state.db.clone());

    // Check existing email
    if repo.find_by_email(&body.email.to_lowercase()).await?.is_some() {
        return Err(AppError::Conflict("Email address is already registered".to_string()));
    }

    let password_hash = hash_password(&body.password)?;
    let user = repo.create(&body, &password_hash).await?;

    Ok(Json(serde_json::json!({
        "success": true,
        "message": "Account created successfully",
        "data": user,
    })))
}

// ─────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────
pub async fn login(
    State(state): State<AppState>,
    Json(body): Json<LoginRequest>,
) -> AppResult<Json<serde_json::Value>> {
    if body.email.trim().is_empty() || body.password.trim().is_empty() {
        return Err(AppError::BadRequest("Email and password are required".to_string()));
    }

    let repo = AuthRepository::new(state.db.clone());

    // Look up user
    let user = repo
        .find_by_email(&body.email.to_lowercase())
        .await?
        .ok_or_else(|| AppError::Unauthorized("Invalid email or password".to_string()))?;

    // Check active status
    if !user.is_active {
        return Err(AppError::Unauthorized("Account is deactivated. Contact admin.".to_string()));
    }

    // Verify password
    if !verify_password(&body.password, &user.password_hash)? {
        return Err(AppError::Unauthorized("Invalid email or password".to_string()));
    }

    let role_str = format!("{:?}", user.role).to_uppercase();
    let access_token = generate_access_token(&user.id, &user.email, &role_str, &state.config)?;
    let refresh_token = generate_refresh_token(&user.id, &state.config)?;

    let response = AuthTokenResponse {
        access_token,
        refresh_token,
        token_type: "Bearer".to_string(),
        expires_in: state.config.jwt_expiry_hours * 3600,
        user: user.into(),
    };

    Ok(Json(serde_json::json!({
        "success": true,
        "message": "Login successful",
        "data": response,
    })))
}

// ─────────────────────────────────────────────
// POST /api/auth/logout  (requires auth)
// ─────────────────────────────────────────────
pub async fn logout(
    State(_state): State<AppState>,
) -> AppResult<Json<MessageResponse>> {
    // Stateless JWT — client just discards tokens.
    // Future: add token to a Redis denylist here.
    Ok(Json(MessageResponse::new("Logged out successfully")))
}

// ─────────────────────────────────────────────
// POST /api/auth/refresh
// ─────────────────────────────────────────────
pub async fn refresh_token(
    State(state): State<AppState>,
    Json(body): Json<RefreshRequest>,
) -> AppResult<Json<serde_json::Value>> {
    // Verify the refresh token
    let claims = verify_refresh_token(&body.refresh_token, &state.config)?;

    let user_id = Uuid::parse_str(&claims.sub)
        .map_err(|_| AppError::Unauthorized("Invalid token subject".to_string()))?;

    // Fetch fresh user data (confirms account still active)
    let repo = AuthRepository::new(state.db.clone());
    let user = repo.find_by_id(user_id).await?;

    let role_str = format!("{:?}", user.role).to_uppercase();
    let access_token = generate_access_token(&user.id, &user.email, &role_str, &state.config)?;
    let new_refresh_token = generate_refresh_token(&user.id, &state.config)?;

    Ok(Json(serde_json::json!({
        "success": true,
        "data": {
            "access_token": access_token,
            "refresh_token": new_refresh_token,
            "token_type": "Bearer",
            "expires_in": state.config.jwt_expiry_hours * 3600,
            "user": user,
        }
    })))
}

// ─────────────────────────────────────────────
// GET /api/auth/me  (requires auth)
// ─────────────────────────────────────────────
pub async fn get_me(
    State(state): State<AppState>,
    axum::Extension(claims): axum::Extension<crate::utils::jwt::Claims>,
) -> AppResult<Json<serde_json::Value>> {
    let user_id = Uuid::parse_str(&claims.sub)
        .map_err(|_| AppError::Unauthorized("Invalid token".to_string()))?;

    let repo = AuthRepository::new(state.db.clone());
    let user = repo.find_by_id(user_id).await?;

    Ok(Json(serde_json::json!({
        "success": true,
        "data": user,
    })))
}
