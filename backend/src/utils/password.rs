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
    fn test_hash_password_success() {
        let password = "SuperSecretPassword123!";
        let result = hash_password(password);
        assert!(result.is_ok());

        let hash = result.unwrap();
        assert!(!hash.is_empty());
        // Argon2 hashes usually start with $argon2
        assert!(hash.starts_with("$argon2"));
    }

    #[test]
    fn test_hash_password_different_salts() {
        let password = "SuperSecretPassword123!";
        let hash1 = hash_password(password).unwrap();
        let hash2 = hash_password(password).unwrap();

        // Hashing the same password twice should produce different hashes due to random salts
        assert_ne!(hash1, hash2);
    }

    #[test]
    fn test_verify_password_success() {
        let password = "SuperSecretPassword123!";
        let hash = hash_password(password).unwrap();

        let verify_result = verify_password(password, &hash);
        assert!(verify_result.is_ok());
        assert!(verify_result.unwrap());
    }

    #[test]
    fn test_verify_password_failure_wrong_password() {
        let password = "SuperSecretPassword123!";
        let wrong_password = "WrongPassword456!";
        let hash = hash_password(password).unwrap();

        let verify_result = verify_password(wrong_password, &hash);
        assert!(verify_result.is_ok());
        assert!(!verify_result.unwrap());
    }

    #[test]
    fn test_verify_password_failure_invalid_hash() {
        let password = "SuperSecretPassword123!";
        let invalid_hash = "not_a_valid_hash_string";

        let verify_result = verify_password(password, invalid_hash);
        assert!(verify_result.is_err());
    }

    #[test]
    fn test_validate_password_strength_success() {
        let valid_passwords = vec![
            "Valid1Password!",
            "1234567Aa",
            "AAbbCC12",
        ];

        for pw in valid_passwords {
            assert!(validate_password_strength(pw).is_ok());
        }
    }

    #[test]
    fn test_validate_password_strength_failure_length() {
        let short_password = "Short1A"; // 7 chars
        let result = validate_password_strength(short_password);
        assert!(result.is_err());
    }

    #[test]
    fn test_validate_password_strength_failure_no_uppercase() {
        let no_upper = "nouppercase1!";
        let result = validate_password_strength(no_upper);
        assert!(result.is_err());
    }

    #[test]
    fn test_validate_password_strength_failure_no_lowercase() {
        let no_lower = "NOLOWERCASE1!";
        let result = validate_password_strength(no_lower);
        assert!(result.is_err());
    }

    #[test]
    fn test_validate_password_strength_failure_no_digit() {
        let no_digit = "NoDigitPassword!";
        let result = validate_password_strength(no_digit);
        assert!(result.is_err());
    }
}
