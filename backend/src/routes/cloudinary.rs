use crate::{
    routes::AppState,
    services::cloudinary_service::CloudinaryService,
    utils::errors::{AppError, AppResult},
};
use axum::{Json, extract::State};
use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct SignUploadRequest {
    /// Target folder in Cloudinary (e.g. "blog", "universities")
    pub folder: String,
}

// ─── POST /api/admin/cloudinary/sign ─────────────────────────────────────────
/// Generate a Cloudinary signed upload signature.
///
/// H-2 security fix: Instead of using an unsigned Cloudinary upload preset
/// (which allows anyone to upload arbitrary files to MVR's storage), the
/// frontend requests a time-limited signed signature from this admin-only
/// endpoint before uploading directly to Cloudinary.
///
/// Flow:
///   1. Admin client calls POST /api/admin/cloudinary/sign with { folder }
///   2. Backend generates a signature using CLOUDINARY_API_SECRET (never exposed)
///   3. Frontend uses the signature + timestamp to make a signed Cloudinary upload
///   4. Cloudinary verifies the signature server-side — rejects unsigned requests
///
/// This endpoint requires ADMIN authentication (enforced by require_admin middleware).
pub async fn sign_upload(
    State(state): State<AppState>,
    Json(body): Json<SignUploadRequest>,
) -> AppResult<Json<serde_json::Value>> {
    // Validate folder to prevent path traversal / injection
    if body.folder.is_empty()
        || body.folder.len() > 100
        || body.folder.contains("..")
        || body.folder.contains('\0')
    {
        return Err(AppError::BadRequest("Invalid folder name".to_string()));
    }

    let svc = CloudinaryService::from_config(&state.config).ok_or_else(|| {
        AppError::ServiceUnavailable(
            "Image uploads are not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, \
             and CLOUDINARY_API_SECRET on the server."
                .to_string(),
        )
    })?;

    let signature = svc.sign_upload(&state.config, &body.folder)?;

    Ok(Json(serde_json::json!({
        "success": true,
        "data": signature,
    })))
}
