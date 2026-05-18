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

    fn get_mock_config() -> Config {
        Config {
            host: "0.0.0.0".to_string(),
            port: 8080,
            environment: "development".to_string(),
            database_url: "postgres://mock".to_string(),
            jwt_secret: "super_secret_key_that_is_long_enough".to_string(),
            jwt_refresh_secret: "super_secret_refresh_key_that_is_long_enough".to_string(),
            jwt_expiry_hours: 1,
            jwt_refresh_expiry_days: 7,
            frontend_url: "http://localhost".to_string(),
            allowed_origins: vec!["http://localhost".to_string()],
            cloudinary_cloud_name: "".to_string(),
            cloudinary_api_key: "".to_string(),
            cloudinary_api_secret: "".to_string(),
            cloudinary_upload_preset: "".to_string(),
            resend_api_key: "".to_string(),
            email_from: "".to_string(),
            email_from_name: "".to_string(),
            admin_email: "".to_string(),
            admin_email_guntur: "".to_string(),
        }
    }

    #[test]
    fn test_generate_and_verify_access_token() {
        let config = get_mock_config();
        let user_id = Uuid::new_v4();
        let email = "test@example.com";
        let role = "USER";

        // Generate token
        let token_result = generate_access_token(&user_id, email, role, &config);
        assert!(token_result.is_ok(), "Token generation should succeed");
        let token = token_result.unwrap();

        // Verify token
        let verify_result = verify_access_token(&token, &config);
        assert!(verify_result.is_ok(), "Token verification should succeed");
        let claims = verify_result.unwrap();

        // Assert claims
        assert_eq!(claims.sub, user_id.to_string());
        assert_eq!(claims.email, email);
        assert_eq!(claims.role, role);
        assert_eq!(claims.token_type, "access");
        assert!(claims.exp > claims.iat);
    }

    #[test]
    fn test_generate_and_verify_refresh_token() {
        let config = get_mock_config();
        let user_id = Uuid::new_v4();

        // Generate refresh token
        let token_result = generate_refresh_token(&user_id, &config);
        assert!(token_result.is_ok(), "Refresh token generation should succeed");
        let token = token_result.unwrap();

        // Verify refresh token
        let verify_result = verify_refresh_token(&token, &config);
        assert!(verify_result.is_ok(), "Refresh token verification should succeed");
        let claims = verify_result.unwrap();

        // Assert claims
        assert_eq!(claims.sub, user_id.to_string());
        assert_eq!(claims.token_type, "refresh");
        assert!(claims.exp > claims.iat);
    }

    #[test]
    fn test_verify_invalid_token() {
        let config = get_mock_config();
        let user_id = Uuid::new_v4();
        let email = "test@example.com";
        let role = "USER";

        // Generate token with one config
        let token = generate_access_token(&user_id, email, role, &config).unwrap();

        // Verify with a different secret
        let mut bad_config = config.clone();
        bad_config.jwt_secret = "a_completely_different_secret_key_here".to_string();

        let verify_result = verify_access_token(&token, &bad_config);
        assert!(verify_result.is_err(), "Verification should fail with wrong secret");

        match verify_result {
            Err(AppError::Unauthorized(_)) => {} // Expected
            _ => panic!("Expected AppError::Unauthorized"),
        }
    }
}
