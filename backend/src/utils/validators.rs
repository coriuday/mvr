use crate::utils::errors::AppError;

/// Validates an email address format
pub fn validate_email(email: &str) -> Result<(), AppError> {
    let email = email.trim();
    if email.is_empty() {
        return Err(AppError::BadRequest("Email is required".to_string()));
    }

    // Basic email validation: must contain @ with non-empty local and domain parts
    let parts: Vec<&str> = email.splitn(2, '@').collect();
    if parts.len() != 2 || parts[0].is_empty() || parts[1].is_empty() {
        return Err(AppError::BadRequest("Invalid email address format".to_string()));
    }

    // Domain must contain a dot
    if !parts[1].contains('.') {
        return Err(AppError::BadRequest("Invalid email domain".to_string()));
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_email() {
        // Valid emails
        assert!(validate_email("test@example.com").is_ok());
        assert!(validate_email("user.name@domain.co.uk").is_ok());
        assert!(validate_email("a@b.c").is_ok());

        // Invalid emails - empty
        let err = validate_email("").unwrap_err();
        assert!(matches!(err, AppError::BadRequest(msg) if msg == "Email is required"));

        // Invalid emails - whitespace
        let err = validate_email("   ").unwrap_err();
        assert!(matches!(err, AppError::BadRequest(msg) if msg == "Email is required"));

        // Invalid emails - missing @
        let err = validate_email("testexample.com").unwrap_err();
        assert!(matches!(err, AppError::BadRequest(msg) if msg == "Invalid email address format"));

        // Invalid emails - missing local part
        let err = validate_email("@example.com").unwrap_err();
        assert!(matches!(err, AppError::BadRequest(msg) if msg == "Invalid email address format"));

        // Invalid emails - missing domain part
        let err = validate_email("test@").unwrap_err();
        assert!(matches!(err, AppError::BadRequest(msg) if msg == "Invalid email address format"));

        // Invalid emails - missing dot in domain
        let err = validate_email("test@example").unwrap_err();
        assert!(matches!(err, AppError::BadRequest(msg) if msg == "Invalid email domain"));
    }
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
