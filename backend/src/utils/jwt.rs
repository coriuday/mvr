use crate::{config::env::Config, utils::errors::AppError};
use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// JWT Claims for access tokens
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub sub: String,       // User ID (UUID as string)
    pub email: String,     // User email
    pub role: String,      // User role: ADMIN, EDITOR, COUNSELOR
    pub exp: i64,          // Expiry timestamp (Unix)
    pub iat: i64,          // Issued at (Unix)
    pub jti: String,       // JWT ID (for revocation)
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

#[cfg(test)]
mod tests {
    use super::*;
    use uuid::Uuid;

    fn mock_config() -> Config {
        Config {
            host: "localhost".to_string(),
            port: 8080,
            environment: "test".to_string(),
            database_url: "postgres://test:test@localhost:5432/test".to_string(),
            jwt_secret: "super_secret_access_key_that_is_long_enough_for_hs256".to_string(),
            jwt_refresh_secret: "super_secret_refresh_key_that_is_long_enough_for_hs256".to_string(),
            jwt_expiry_hours: 1,
            jwt_refresh_expiry_days: 7,
            frontend_url: "http://localhost:3000".to_string(),
            allowed_origins: vec!["http://localhost:3000".to_string()],
            cloudinary_cloud_name: "".to_string(),
            cloudinary_api_key: "".to_string(),
            cloudinary_api_secret: "".to_string(),
            cloudinary_upload_preset: "".to_string(),
            resend_api_key: "".to_string(),
            email_from: "test@example.com".to_string(),
            email_from_name: "Test".to_string(),
            admin_email: "admin@example.com".to_string(),
            admin_email_guntur: "admin2@example.com".to_string(),
        }
    }

    #[test]
    fn test_verify_refresh_token_valid() {
        let config = mock_config();
        let user_id = Uuid::new_v4();

        // Generate a token
        let token = generate_refresh_token(&user_id, &config).unwrap();

        // Verify it
        let result = verify_refresh_token(&token, &config);

        assert!(result.is_ok());
        let claims = result.unwrap();
        assert_eq!(claims.sub, user_id.to_string());
        assert_eq!(claims.token_type, "refresh");
    }

    #[test]
    fn test_verify_refresh_token_invalid_signature() {
        let config = mock_config();
        let user_id = Uuid::new_v4();

        // Generate a token with correct secret
        let token = generate_refresh_token(&user_id, &config).unwrap();

        // Create a config with a different secret
        let mut wrong_config = mock_config();
        wrong_config.jwt_refresh_secret = "wrong_secret_key_that_is_long_enough_for_hs256".to_string();

        // Verify with wrong secret
        let result = verify_refresh_token(&token, &wrong_config);

        assert!(result.is_err());
        match result.unwrap_err() {
            AppError::Unauthorized(msg) => assert!(msg.contains("Invalid refresh token")),
            _ => panic!("Expected Unauthorized error"),
        }
    }

    #[test]
    fn test_verify_refresh_token_expired() {
        let config = mock_config();
        let user_id = Uuid::new_v4();

        // Create an expired claims payload manually
        let now = chrono::Utc::now();
        let expired_time = now - chrono::Duration::days(1);

        let claims = RefreshClaims {
            sub: user_id.to_string(),
            jti: Uuid::new_v4().to_string(),
            exp: expired_time.timestamp(),
            iat: (now - chrono::Duration::days(2)).timestamp(),
            token_type: "refresh".to_string(),
        };

        // Encode it
        let token = jsonwebtoken::encode(
            &jsonwebtoken::Header::default(),
            &claims,
            &jsonwebtoken::EncodingKey::from_secret(config.jwt_refresh_secret.as_bytes()),
        ).unwrap();

        // Verify it
        let result = verify_refresh_token(&token, &config);

        assert!(result.is_err());
        match result.unwrap_err() {
            AppError::Unauthorized(msg) => assert!(msg.contains("Refresh token has expired")),
            _ => panic!("Expected Unauthorized error"),
        }
    }
}
