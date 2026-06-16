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
    pub created_at: DateTime<Utc>,
    #[allow(dead_code)]
    pub updated_at: DateTime<Utc>,
}

/// Safe user response (no password)
#[derive(Debug, Clone, Serialize, FromRow)]
pub struct UserResponse {
    pub id: Uuid,
    pub name: String,
    pub email: String,
    pub role: UserRole,
    pub is_active: bool,
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
            created_at: user.created_at,
        }
    }
}

/// Request body for user registration
#[derive(Debug, Deserialize)]
pub struct RegisterRequest {
    pub name: String,
    pub email: String,
    pub password: String,
    pub role: Option<UserRole>,
}

/// Request body for login
#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

// AuthTokenResponse has been intentionally removed (security fix C-2).
// Tokens are set exclusively via httpOnly Set-Cookie headers and are
// never returned in the JSON response body.
// See routes/auth.rs for the login/refresh response format.
