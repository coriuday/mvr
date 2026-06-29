use crate::{
    config::env::Config,
    utils::errors::{AppError, AppResult},
};
use aes_gcm::{
    Aes256Gcm, Nonce,
    aead::{Aead, KeyInit},
};
use base64::{Engine, engine::general_purpose::STANDARD as B64};
use totp_rs::{Algorithm, Secret, TOTP};

const ISSUER: &str = "MVR Consultants";
const TOTP_DIGITS: usize = 6;
const TOTP_STEP: u64 = 30;

/// Generates a new base32 TOTP secret suitable for Google Authenticator.
pub fn generate_secret() -> String {
    match Secret::generate_secret().to_encoded() {
        Secret::Encoded(s) => s,
        Secret::Raw(_) => unreachable!("to_encoded always returns Encoded"),
    }
}

/// Builds an otpauth:// URL for QR code scanning.
pub fn build_otpauth_url(email: &str, secret: &str) -> AppResult<String> {
    let totp = make_totp(secret, email)?;
    Ok(totp.get_url())
}

/// Verifies a 6-digit TOTP code against the plaintext secret.
pub fn verify_code(secret: &str, code: &str) -> AppResult<bool> {
    let trimmed = code.trim();
    if trimmed.len() != 6 || !trimmed.chars().all(|c| c.is_ascii_digit()) {
        return Ok(false);
    }
    let totp = make_totp(secret, "verify")?;
    Ok(totp.check_current(trimmed).unwrap_or(false))
}

fn make_totp(secret: &str, account: &str) -> AppResult<TOTP> {
    let secret_bytes = Secret::Encoded(secret.to_string())
        .to_bytes()
        .map_err(|e| AppError::InternalServerError(format!("Invalid TOTP secret: {e}")))?;
    TOTP::new(
        Algorithm::SHA1,
        TOTP_DIGITS,
        1,
        TOTP_STEP,
        secret_bytes,
        Some(ISSUER.to_string()),
        account.to_string(),
    )
    .map_err(|e| AppError::InternalServerError(format!("TOTP init failed: {e}")))
}

/// Encrypts a TOTP secret for storage at rest.
pub fn encrypt_secret(plaintext: &str, config: &Config) -> AppResult<String> {
    let key = decode_encryption_key(config)?;
    let cipher = Aes256Gcm::new(&key.into());
    let nonce_bytes: [u8; 12] = rand::random();
    let nonce = Nonce::from_slice(&nonce_bytes);
    let ciphertext = cipher
        .encrypt(nonce, plaintext.as_bytes())
        .map_err(|e| AppError::InternalServerError(format!("TOTP encrypt failed: {e}")))?;
    let mut payload = nonce_bytes.to_vec();
    payload.extend(ciphertext);
    Ok(B64.encode(payload))
}

/// Decrypts a stored TOTP secret.
pub fn decrypt_secret(encrypted: &str, config: &Config) -> AppResult<String> {
    let key = decode_encryption_key(config)?;
    let data = B64
        .decode(encrypted)
        .map_err(|e| AppError::InternalServerError(format!("TOTP decrypt decode failed: {e}")))?;
    if data.len() < 13 {
        return Err(AppError::InternalServerError(
            "Invalid encrypted TOTP payload".to_string(),
        ));
    }
    let (nonce_bytes, ciphertext) = data.split_at(12);
    let cipher = Aes256Gcm::new(&key.into());
    let nonce = Nonce::from_slice(nonce_bytes);
    let plaintext = cipher
        .decrypt(nonce, ciphertext)
        .map_err(|e| AppError::InternalServerError(format!("TOTP decrypt failed: {e}")))?;
    String::from_utf8(plaintext)
        .map_err(|e| AppError::InternalServerError(format!("TOTP secret utf8 failed: {e}")))
}

fn decode_encryption_key(config: &Config) -> AppResult<[u8; 32]> {
    let key_b64 = config.totp_encryption_key.as_ref().ok_or_else(|| {
        AppError::ServiceUnavailable(
            "Two-factor setup is not available: TOTP_ENCRYPTION_KEY is not configured on the server"
                .to_string(),
        )
    })?;
    let bytes = B64.decode(key_b64).map_err(|e| {
        AppError::ServiceUnavailable(format!(
            "Two-factor setup is not available: TOTP_ENCRYPTION_KEY is invalid base64 ({e})"
        ))
    })?;
    if bytes.len() != 32 {
        return Err(AppError::ServiceUnavailable(
            "Two-factor setup is not available: TOTP_ENCRYPTION_KEY must decode to exactly 32 bytes"
                .to_string(),
        ));
    }
    let mut key = [0u8; 32];
    key.copy_from_slice(&bytes);
    Ok(key)
}
