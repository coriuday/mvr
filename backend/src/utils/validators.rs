use crate::utils::errors::AppError;
use validator::ValidateEmail;

/// Validates an email address using the `validator` crate's RFC-5321-compliant check.
/// Rejects strings like "a@b", "user@", "@domain.com", and plain text without a TLD.
pub fn validate_email(email: &str) -> Result<(), AppError> {
    let email = email.trim();
    if email.is_empty() {
        return Err(AppError::BadRequest("Email is required".to_string()));
    }
    if email.len() > 254 {
        return Err(AppError::BadRequest(
            "Email address must not exceed 254 characters".to_string(),
        ));
    }
    if !email.validate_email() {
        return Err(AppError::BadRequest(
            "Please provide a valid email address".to_string(),
        ));
    }
    Ok(())
}

/// Validates a required string field is not empty
pub fn validate_required(value: &str, field_name: &str) -> Result<(), AppError> {
    if value.trim().is_empty() {
        return Err(AppError::BadRequest(format!("{} is required", field_name)));
    }
    Ok(())
}

/// Validates string length within bounds
pub fn validate_length(
    value: &str,
    field_name: &str,
    min: usize,
    max: usize,
) -> Result<(), AppError> {
    let len = value.trim().len();
    if len < min {
        return Err(AppError::BadRequest(format!(
            "{} must be at least {} characters",
            field_name, min
        )));
    }
    if len > max {
        return Err(AppError::BadRequest(format!(
            "{} must not exceed {} characters",
            field_name, max
        )));
    }
    Ok(())
}

/// Validates a phone number (basic: digits, spaces, +, -, (, ))
#[allow(dead_code)]
pub fn validate_phone(phone: &str) -> Result<(), AppError> {
    let cleaned: String = phone
        .chars()
        .filter(|c| c.is_ascii_digit() || *c == '+' || *c == '-' || *c == ' ' || *c == '(' || *c == ')')
        .collect();

    let digit_count = cleaned.chars().filter(|c| c.is_ascii_digit()).count();

    if digit_count < 7 || digit_count > 15 {
        return Err(AppError::BadRequest("Invalid phone number format".to_string()));
    }
    Ok(())
}

/// Validates a URL slug (lowercase letters, numbers, hyphens only)
#[allow(dead_code)]
pub fn validate_slug(slug: &str) -> Result<(), AppError> {
    if !slug.chars().all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || c == '-') {
        return Err(AppError::BadRequest(
            "Slug may only contain lowercase letters, numbers, and hyphens".to_string(),
        ));
    }
    if slug.starts_with('-') || slug.ends_with('-') {
        return Err(AppError::BadRequest(
            "Slug may not start or end with a hyphen".to_string(),
        ));
    }
    Ok(())
}
