use crate::utils::errors::AppError;
use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};

/// Hashes a plaintext password using Argon2id (recommended variant).
/// Returns the PHC string format hash ready for database storage.
pub fn hash_password(password: &str) -> Result<String, AppError> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();

    argon2
        .hash_password(password.as_bytes(), &salt)
        .map(|hash| hash.to_string())
        .map_err(|e| AppError::InternalServerError(format!("Password hashing failed: {}", e)))
}

/// Verifies a plaintext password against an Argon2 hash.
/// Returns Ok(true) if valid, Ok(false) if invalid, Err on internal failure.
pub fn verify_password(password: &str, hash: &str) -> Result<bool, AppError> {
    let parsed_hash = PasswordHash::new(hash)
        .map_err(|e| AppError::InternalServerError(format!("Invalid hash format: {}", e)))?;

    Ok(Argon2::default()
        .verify_password(password.as_bytes(), &parsed_hash)
        .is_ok())
}

/// Validates password strength:
/// - Minimum 8 characters
/// - At least one uppercase letter
/// - At least one lowercase letter
/// - At least one digit
pub fn validate_password_strength(password: &str) -> Result<(), AppError> {
    if password.len() < 8 {
        return Err(AppError::BadRequest(
            "Password must be at least 8 characters long".to_string(),
        ));
    }
    if !password.chars().any(|c| c.is_uppercase()) {
        return Err(AppError::BadRequest(
            "Password must contain at least one uppercase letter".to_string(),
        ));
    }
    if !password.chars().any(|c| c.is_lowercase()) {
        return Err(AppError::BadRequest(
            "Password must contain at least one lowercase letter".to_string(),
        ));
    }
    if !password.chars().any(|c| c.is_ascii_digit()) {
        return Err(AppError::BadRequest(
            "Password must contain at least one digit".to_string(),
        ));
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_password_strength_valid() {
        assert!(validate_password_strength("Valid123").is_ok());
        assert!(validate_password_strength("StrongPassw0rd!").is_ok());
    }

    #[test]
    fn test_validate_password_strength_too_short() {
        let result = validate_password_strength("Val1d");
        assert!(result.is_err());
        if let Err(AppError::BadRequest(msg)) = result {
            assert_eq!(msg, "Password must be at least 8 characters long");
        } else {
            panic!("Expected BadRequest error");
        }
    }

    #[test]
    fn test_validate_password_strength_no_uppercase() {
        let result = validate_password_strength("invalid123");
        assert!(result.is_err());
        if let Err(AppError::BadRequest(msg)) = result {
            assert_eq!(msg, "Password must contain at least one uppercase letter");
        } else {
            panic!("Expected BadRequest error");
        }
    }

    #[test]
    fn test_validate_password_strength_no_lowercase() {
        let result = validate_password_strength("INVALID123");
        assert!(result.is_err());
        if let Err(AppError::BadRequest(msg)) = result {
            assert_eq!(msg, "Password must contain at least one lowercase letter");
        } else {
            panic!("Expected BadRequest error");
        }
    }

    #[test]
    fn test_validate_password_strength_no_digit() {
        let result = validate_password_strength("InvalidPassword");
        assert!(result.is_err());
        if let Err(AppError::BadRequest(msg)) = result {
            assert_eq!(msg, "Password must contain at least one digit");
        } else {
            panic!("Expected BadRequest error");
        }
    }

    #[test]
    fn test_validate_password_strength_empty() {
        let result = validate_password_strength("");
        assert!(result.is_err());
        if let Err(AppError::BadRequest(msg)) = result {
            assert_eq!(msg, "Password must be at least 8 characters long");
        } else {
            panic!("Expected BadRequest error");
        }
    }
}
