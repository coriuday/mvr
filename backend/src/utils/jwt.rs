use crate::{config::env::Config, utils::errors::AppError};
use chrono::{Duration, Utc};
use jsonwebtoken::{Algorithm, DecodingKey, EncodingKey, Header, Validation, decode, encode};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// JWT Claims for access tokens
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub sub: String,        // User ID (UUID as string)
    pub email: String,      // User email
    pub role: String,       // User role: ADMIN, EDITOR, COUNSELOR
    pub exp: i64,           // Expiry timestamp (Unix)
    pub iat: i64,           // Issued at (Unix)
    pub jti: String,        // JWT ID (for revocation)
    pub token_type: String, // "access" or "refresh"
}

/// JWT Claims for refresh tokens (minimal payload)
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RefreshClaims {
    pub sub: String,
    pub jti: String,
    pub exp: i64,
    pub iat: i64,
    pub token_type: String,
}

/// Generates a JWT access token for the given user
pub fn generate_access_token(
    user_id: &Uuid,
    email: &str,
    role: &str,
    config: &Config,
) -> Result<String, AppError> {
    let now = Utc::now();
    let expiry = now + Duration::hours(config.jwt_expiry_hours as i64);

    let claims = Claims {
        sub: user_id.to_string(),
        email: email.to_string(),
        role: role.to_string(),
        exp: expiry.timestamp(),
        iat: now.timestamp(),
        jti: Uuid::new_v4().to_string(),
        token_type: "access".to_string(),
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(config.jwt_secret.as_bytes()),
    )
    .map_err(|e| AppError::InternalServerError(format!("Token generation failed: {}", e)))
}

/// Generates a JWT refresh token (longer-lived, minimal payload)
pub fn generate_refresh_token(user_id: &Uuid, config: &Config) -> Result<String, AppError> {
    let now = Utc::now();
    let expiry = now + Duration::days(config.jwt_refresh_expiry_days as i64);

    let claims = RefreshClaims {
        sub: user_id.to_string(),
        jti: Uuid::new_v4().to_string(),
        exp: expiry.timestamp(),
        iat: now.timestamp(),
        token_type: "refresh".to_string(),
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(config.jwt_refresh_secret.as_bytes()),
    )
    .map_err(|e| AppError::InternalServerError(format!("Refresh token generation failed: {}", e)))
}

/// Validates and decodes an access token
pub fn verify_access_token(token: &str, config: &Config) -> Result<Claims, AppError> {
    let validation = Validation::new(Algorithm::HS256);

    decode::<Claims>(
        token,
        &DecodingKey::from_secret(config.jwt_secret.as_bytes()),
        &validation,
    )
    .map(|data| data.claims)
    .map_err(|e| match e.kind() {
        jsonwebtoken::errors::ErrorKind::ExpiredSignature => {
            AppError::Unauthorized("Token has expired".to_string())
        }
        _ => AppError::Unauthorized(format!("Invalid token: {}", e)),
    })
}

/// Validates and decodes a refresh token
pub fn verify_refresh_token(token: &str, config: &Config) -> Result<RefreshClaims, AppError> {
    let validation = Validation::new(Algorithm::HS256);

    decode::<RefreshClaims>(
        token,
        &DecodingKey::from_secret(config.jwt_refresh_secret.as_bytes()),
        &validation,
    )
    .map(|data| data.claims)
    .map_err(|e| match e.kind() {
        jsonwebtoken::errors::ErrorKind::ExpiredSignature => {
            AppError::Unauthorized("Refresh token has expired. Please log in again.".to_string())
        }
        _ => AppError::Unauthorized(format!("Invalid refresh token: {}", e)),
    })
}
