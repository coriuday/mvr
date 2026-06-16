use crate::{
    config::env::Config,
    utils::errors::{AppError, AppResult},
};
use std::collections::BTreeMap;

/// H-2 security fix: Cloudinary signed upload service.
///
/// Previously, the frontend uploaded directly to Cloudinary using an *unsigned*
/// preset, which allowed anyone who discovered the cloud name to upload arbitrary
/// content (malware, illegal material) to MVR's storage.
///
/// This service generates a Cloudinary API **signature** that is valid for a
/// single upload. The frontend requests a signature from the backend, then uses
/// it to make a *signed* direct upload to Cloudinary. The backend validates the
/// request with `require_admin` middleware, so only authenticated admins can
/// obtain a signature.
///
/// Signature algorithm: SHA-256 HMAC of the sorted parameter string.
/// Reference: https://cloudinary.com/documentation/upload_images#generating_authentication_signatures
pub struct CloudinaryService {
    api_secret: String,
    cloud_name: String,
}

#[derive(Debug, serde::Serialize)]
pub struct UploadSignature {
    /// The computed SHA-256 HMAC signature
    pub signature: String,
    /// Unix timestamp (seconds) used in the signature
    pub timestamp: i64,
    /// Cloudinary cloud name — safe to expose (not a secret)
    pub cloud_name: String,
    /// Cloudinary API key — safe to expose (not a secret)
    pub api_key: String,
    /// The folder path included in the signature
    pub folder: String,
    /// Upload preset name (MUST be a signed preset in production)
    pub upload_preset: Option<String>,
}

impl CloudinaryService {
    pub fn from_config(config: &Config) -> Option<Self> {
        let api_secret = config.cloudinary_api_secret.clone()?;
        let cloud_name = config.cloudinary_cloud_name.clone()?;
        if api_secret.is_empty() || cloud_name.is_empty() {
            return None;
        }
        Some(Self {
            api_secret,
            cloud_name,
        })
    }

    /// Generate a signed upload signature for the given folder.
    ///
    /// The signature is computed as:
    ///   SHA256(sorted_param_string + api_secret)
    ///
    /// where sorted_param_string is the alphabetically sorted, URL-encoded
    /// key=value pairs joined by `&`.
    pub fn sign_upload(&self, config: &Config, folder: &str) -> AppResult<UploadSignature> {
        if config
            .cloudinary_api_key
            .as_deref()
            .unwrap_or("")
            .is_empty()
        {
            return Err(AppError::InternalServerError(
                "Cloudinary is not configured on this server".to_string(),
            ));
        }

        let timestamp = chrono::Utc::now().timestamp();

        // Build the parameter map. Only include params that are in the signature.
        // Fields like `api_key` and `file` are excluded (Cloudinary spec).
        let mut params: BTreeMap<&str, String> = BTreeMap::new();
        params.insert("folder", folder.to_string());
        params.insert("timestamp", timestamp.to_string());

        // Include upload_preset in the signature if set, so the frontend can
        // safely send it without being able to swap it for an unsigned preset.
        if let Some(preset) = &config.cloudinary_upload_preset {
            if !preset.is_empty() {
                params.insert("upload_preset", preset.clone());
            }
        }

        // Sorted param string: "folder=uploads/blog&timestamp=1234567890&upload_preset=my_preset"
        let param_string = params
            .iter()
            .map(|(k, v)| format!("{k}={v}"))
            .collect::<Vec<_>>()
            .join("&");

        // Signature input = param_string + api_secret (NOT URL encoded)
        let to_sign = format!("{}{}", param_string, self.api_secret);
        // Cloudinary uses raw SHA-256 (not HMAC) for upload signatures.
        // The signature is SHA256(sorted_param_string + api_secret).
        let signature = sha256_hex(&to_sign);

        Ok(UploadSignature {
            signature,
            timestamp,
            cloud_name: self.cloud_name.clone(),
            api_key: config.cloudinary_api_key.clone().unwrap_or_default(),
            folder: folder.to_string(),
            upload_preset: config.cloudinary_upload_preset.clone(),
        })
    }
}

/// Compute hex-encoded SHA-256 hash of a string.
/// This is what Cloudinary's signed upload API expects.
fn sha256_hex(input: &str) -> String {
    use sha2::Digest;
    let mut hasher = sha2::Sha256::new();
    hasher.update(input.as_bytes());
    hex::encode(hasher.finalize())
}
