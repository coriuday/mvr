use crate::{
    models::user::{RegisterRequest, UpdateUserRoleRequest, User, UserResponse, UserRole},
    utils::errors::{AppError, AppResult},
};
use sqlx::PgPool;
use uuid::Uuid;

const USER_SELECT: &str = r#"
    SELECT id, name, email, password_hash, role, is_active,
           totp_secret_encrypted, totp_enabled, totp_verified_at,
           created_at, updated_at
    FROM users
"#;

const USER_RESPONSE_SELECT: &str =
    "SELECT id, name, email, role, is_active, totp_enabled, created_at FROM users";

pub struct AuthRepository {
    pub db: PgPool,
}

impl AuthRepository {
    pub fn new(db: PgPool) -> Self {
        Self { db }
    }

    /// Find a user by email address (includes password hash and TOTP secret).
    pub async fn find_by_email(&self, email: &str) -> AppResult<Option<User>> {
        sqlx::query_as::<_, User>(&format!("{USER_SELECT} WHERE email = $1"))
            .bind(email)
            .fetch_optional(&self.db)
            .await
            .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))
    }

    /// Find full user record by ID (internal auth use).
    pub async fn find_full_by_id(&self, id: Uuid) -> AppResult<User> {
        sqlx::query_as::<_, User>(&format!("{USER_SELECT} WHERE id = $1"))
            .bind(id)
            .fetch_optional(&self.db)
            .await
            .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?
            .ok_or_else(|| AppError::NotFound(format!("User {id} not found")))
    }

    /// Find a user by ID — returns safe UserResponse (no password hash).
    pub async fn find_by_id(&self, id: Uuid) -> AppResult<UserResponse> {
        sqlx::query_as::<_, UserResponse>(&format!("{USER_RESPONSE_SELECT} WHERE id = $1"))
            .bind(id)
            .fetch_optional(&self.db)
            .await
            .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?
            .ok_or_else(|| AppError::NotFound(format!("User {id} not found")))
    }

    /// Live check used by auth middleware — immediate deactivate enforcement.
    pub async fn is_user_active(&self, id: Uuid) -> AppResult<bool> {
        let row: Option<(bool,)> = sqlx::query_as("SELECT is_active FROM users WHERE id = $1")
            .bind(id)
            .fetch_optional(&self.db)
            .await
            .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?;
        Ok(row.map(|(active,)| active).unwrap_or(false))
    }

    /// Create a new staff user account.
    pub async fn create(
        &self,
        req: &RegisterRequest,
        password_hash: &str,
    ) -> AppResult<UserResponse> {
        let role = UserRole::Counselor;

        sqlx::query_as::<_, UserResponse>(
            r#"
            INSERT INTO users (name, email, password_hash, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id, name, email, role, is_active, totp_enabled, created_at
            "#,
        )
        .bind(&req.name)
        .bind(req.email.to_lowercase())
        .bind(password_hash)
        .bind(role)
        .fetch_one(&self.db)
        .await
        .map_err(|e| {
            let msg = e.to_string();
            if msg.contains("duplicate key") || msg.contains("unique") {
                AppError::Conflict("Email address is already registered".to_string())
            } else {
                AppError::InternalServerError(format!("DB error: {e}"))
            }
        })
    }

    pub async fn update_role(
        &self,
        id: Uuid,
        req: &UpdateUserRoleRequest,
    ) -> AppResult<UserResponse> {
        sqlx::query_as::<_, UserResponse>(
            r#"
            UPDATE users
            SET role = $2, updated_at = NOW()
            WHERE id = $1
            RETURNING id, name, email, role, is_active, totp_enabled, created_at
            "#,
        )
        .bind(id)
        .bind(&req.role)
        .fetch_optional(&self.db)
        .await
        .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?
        .ok_or_else(|| AppError::NotFound(format!("User {id} not found")))
    }

    pub async fn list_all(&self) -> AppResult<Vec<UserResponse>> {
        sqlx::query_as::<_, UserResponse>(&format!(
            "{USER_RESPONSE_SELECT} ORDER BY created_at DESC"
        ))
        .fetch_all(&self.db)
        .await
        .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))
    }

    pub async fn set_active(&self, id: Uuid, is_active: bool) -> AppResult<UserResponse> {
        sqlx::query_as::<_, UserResponse>(
            r#"
            UPDATE users SET is_active = $2, updated_at = NOW() WHERE id = $1
            RETURNING id, name, email, role, is_active, totp_enabled, created_at
            "#,
        )
        .bind(id)
        .bind(is_active)
        .fetch_optional(&self.db)
        .await
        .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?
        .ok_or_else(|| AppError::NotFound(format!("User {id} not found")))
    }

    /// Store encrypted TOTP secret during setup (not yet enabled).
    pub async fn save_totp_secret(&self, id: Uuid, encrypted: &str) -> AppResult<()> {
        sqlx::query(
            r#"
            UPDATE users
            SET totp_secret_encrypted = $2,
                totp_enabled = FALSE,
                totp_verified_at = NULL,
                updated_at = NOW()
            WHERE id = $1
            "#,
        )
        .bind(id)
        .bind(encrypted)
        .execute(&self.db)
        .await
        .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?;
        Ok(())
    }

    /// Enable TOTP after the user confirms with a valid code.
    pub async fn enable_totp(&self, id: Uuid) -> AppResult<UserResponse> {
        sqlx::query_as::<_, UserResponse>(
            r#"
            UPDATE users
            SET totp_enabled = TRUE,
                totp_verified_at = NOW(),
                updated_at = NOW()
            WHERE id = $1
            RETURNING id, name, email, role, is_active, totp_enabled, created_at
            "#,
        )
        .bind(id)
        .fetch_optional(&self.db)
        .await
        .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?
        .ok_or_else(|| AppError::NotFound(format!("User {id} not found")))
    }

    /// Disable TOTP and clear stored secret.
    pub async fn disable_totp(&self, id: Uuid) -> AppResult<UserResponse> {
        sqlx::query_as::<_, UserResponse>(
            r#"
            UPDATE users
            SET totp_enabled = FALSE,
                totp_secret_encrypted = NULL,
                totp_verified_at = NULL,
                updated_at = NOW()
            WHERE id = $1
            RETURNING id, name, email, role, is_active, totp_enabled, created_at
            "#,
        )
        .bind(id)
        .fetch_optional(&self.db)
        .await
        .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?
        .ok_or_else(|| AppError::NotFound(format!("User {id} not found")))
    }

    #[allow(dead_code)]
    pub async fn deactivate(&self, id: Uuid) -> AppResult<()> {
        sqlx::query("UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1")
            .bind(id)
            .execute(&self.db)
            .await
            .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?;
        Ok(())
    }
}
