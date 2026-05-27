use sqlx::PgPool;
use uuid::Uuid;
use crate::{
    models::user::{RegisterRequest, User, UserResponse, UserRole},
    utils::errors::{AppError, AppResult},
};

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

    /// Create a new staff user account
    pub async fn create(&self, req: &RegisterRequest, password_hash: &str) -> AppResult<UserResponse> {
        let role = req.role.clone().unwrap_or(UserRole::Counselor);

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

    /// List all staff users
    pub async fn list_all(&self) -> AppResult<Vec<UserResponse>> {
        sqlx::query_as::<_, UserResponse>(
            "SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC",
        )
        .fetch_all(&self.db)
        .await
        .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))
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
