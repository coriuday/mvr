use crate::{
    models::user::{RegisterRequest, UpdateUserRoleRequest, User, UserResponse, UserRole},
    utils::errors::{AppError, AppResult},
};
use sqlx::PgPool;
use uuid::Uuid;

pub struct AuthRepository {
    pub db: PgPool,
}

impl AuthRepository {
    pub fn new(db: PgPool) -> Self {
        Self { db }
    }

    /// Find a user by email address
    pub async fn find_by_email(&self, email: &str) -> AppResult<Option<User>> {
        sqlx::query_as::<_, User>(
            r#"
            SELECT id, name, email, password_hash, role, is_active, created_at, updated_at
            FROM users WHERE email = $1
            "#,
        )
        .bind(email)
        .fetch_optional(&self.db)
        .await
        .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))
    }

    /// Find a user by ID — returns safe UserResponse (no password hash)
    pub async fn find_by_id(&self, id: Uuid) -> AppResult<UserResponse> {
        sqlx::query_as::<_, UserResponse>(
            "SELECT id, name, email, role, is_active, created_at FROM users WHERE id = $1",
        )
        .bind(id)
        .fetch_optional(&self.db)
        .await
        .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?
        .ok_or_else(|| AppError::NotFound(format!("User {id} not found")))
    }

    /// Create a new staff user account.
    /// C-2 security fix: Role is always set to Counselor regardless of request body.
    /// Use update_role() to change a user's role after creation (admin action).
    pub async fn create(
        &self,
        req: &RegisterRequest,
        password_hash: &str,
    ) -> AppResult<UserResponse> {
        // C-2: role is NOT taken from the request — always defaults to Counselor.
        // This prevents privilege escalation via mass assignment.
        let role = UserRole::Counselor;

        sqlx::query_as::<_, UserResponse>(
            r#"
            INSERT INTO users (name, email, password_hash, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id, name, email, role, is_active, created_at
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

    /// Update a staff user's role.
    /// C-2 security fix: role assignment is a privileged admin-only operation,
    /// separate from account creation.
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
            RETURNING id, name, email, role, is_active, created_at
            "#,
        )
        .bind(id)
        .bind(&req.role)
        .fetch_optional(&self.db)
        .await
        .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?
        .ok_or_else(|| AppError::NotFound(format!("User {id} not found")))
    }

    /// List all staff users
    pub async fn list_all(&self) -> AppResult<Vec<UserResponse>> {
        sqlx::query_as::<_, UserResponse>(
            "SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC",
        )
        .fetch_all(&self.db)
        .await
        .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))
    }

    /// Set user active status (admin toggle)
    pub async fn set_active(&self, id: Uuid, is_active: bool) -> AppResult<UserResponse> {
        sqlx::query_as::<_, UserResponse>(
            r#"
            UPDATE users SET is_active = $2, updated_at = NOW() WHERE id = $1
            RETURNING id, name, email, role, is_active, created_at
            "#,
        )
        .bind(id)
        .bind(is_active)
        .fetch_optional(&self.db)
        .await
        .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?
        .ok_or_else(|| AppError::NotFound(format!("User {id} not found")))
    }

    /// Deactivate a user (soft delete)
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
