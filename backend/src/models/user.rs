use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type, PartialEq)]
#[sqlx(type_name = "user_role", rename_all = "SCREAMING_SNAKE_CASE")]
pub enum UserRole {
    Admin,
    Editor,
    Counselor,
}

/// Full user model (includes password_hash — never serialize to API responses)
#[derive(Debug, Clone, FromRow)]
pub struct User {
    pub id: Uuid,
    pub name: String,
    pub email: String,
    pub password_hash: String,
    pub role: UserRole,
    pub is_active: bool,
    pub totp_secret_encrypted: Option<String>,
    pub totp_enabled: bool,
    #[allow(dead_code)]
    pub totp_verified_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    #[allow(dead_code)]
    pub updated_at: DateTime<Utc>,
}

/// Safe user response (no password, no TOTP secret)
#[derive(Debug, Clone, Serialize, FromRow)]
pub struct UserResponse {
    pub id: Uuid,
    pub name: String,
    pub email: String,
    pub role: UserRole,
    pub is_active: bool,
    pub totp_enabled: bool,
    pub created_at: DateTime<Utc>,
}

impl From<User> for UserResponse {
    fn from(user: User) -> Self {
        UserResponse {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            is_active: user.is_active,
            totp_enabled: user.totp_enabled,
            created_at: user.created_at,
        }
    }
}

/// Request body for user registration
/// C-2 security fix: `role` field has been intentionally REMOVED.
/// The registration endpoint always creates a Counselor account.
/// Role assignment is done separately by an admin via PATCH /api/admin/users/:id/role.
/// Accepting role from the request body was a mass-assignment vulnerability.
#[derive(Debug, Deserialize)]
pub struct RegisterRequest {
    pub name: String,
    pub email: String,
    pub password: String,
    // NOTE: role is deliberately NOT included here. See above.
}

/// Request body for login
#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

/// Request body for updating a user's role (admin-only action).
/// C-2 security fix: role assignment is a separate privileged operation,
/// not bundled into the registration flow.
#[derive(Debug, Deserialize)]
pub struct UpdateUserRoleRequest {
    pub role: UserRole,
}

#[derive(Debug, Deserialize)]
pub struct UpdateUserActiveRequest {
    pub is_active: bool,
}

#[derive(Debug, Deserialize)]
pub struct TotpVerifyRequest {
    pub code: String,
}

#[derive(Debug, Deserialize)]
pub struct TotpConfirmRequest {
    pub code: String,
}

#[derive(Debug, Deserialize)]
pub struct TotpDisableRequest {
    pub password: String,
    pub code: String,
}

// AuthTokenResponse has been intentionally removed (security fix C-2).
// Tokens are set exclusively via httpOnly Set-Cookie headers and are
// never returned in the JSON response body.
// See routes/auth.rs for the login/refresh response format.
