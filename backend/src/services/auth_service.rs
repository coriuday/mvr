use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    config::env::Config,
    models::user::{AuthTokenResponse, LoginRequest, RegisterRequest, UserResponse},
    repositories::auth_repository::AuthRepository,
    utils::{
        errors::{AppError, AppResult},
        jwt::{generate_access_token, generate_refresh_token, verify_refresh_token},
        password::{hash_password, validate_password_strength, verify_password},
    },
};

pub struct AuthService {
    repo: AuthRepository,
    config: Config,
}

impl AuthService {
    pub fn new(db: PgPool, config: Config) -> Self {
        Self {
            repo: AuthRepository::new(db),
            config,
        }
    }

    pub async fn register(&self, body: &RegisterRequest) -> AppResult<UserResponse> {
        // Validate inputs
        if body.name.trim().is_empty() {
            return Err(AppError::BadRequest("Name is required".to_string()));
        }
        if body.email.trim().is_empty() {
            return Err(AppError::BadRequest("Email is required".to_string()));
        }

        validate_password_strength(&body.password)?;

        // Check existing email
        if self.repo.find_by_email(&body.email.to_lowercase()).await?.is_some() {
            return Err(AppError::Conflict("Email address is already registered".to_string()));
        }

        let password_hash = hash_password(&body.password)?;
        let user = self.repo.create(body, &password_hash).await?;

        Ok(user)
    }

    pub async fn login(&self, body: &LoginRequest) -> AppResult<AuthTokenResponse> {
        if body.email.trim().is_empty() || body.password.trim().is_empty() {
            return Err(AppError::BadRequest("Email and password are required".to_string()));
        }

        // Look up user
        let user = self
            .repo
            .find_by_email(&body.email.to_lowercase())
            .await?
            .ok_or_else(|| AppError::Unauthorized("Invalid email or password".to_string()))?;

        // Check active status
        if !user.is_active {
            return Err(AppError::Unauthorized("Account is deactivated. Contact admin.".to_string()));
        }

        // Verify password
        if !verify_password(&body.password, &user.password_hash)? {
            return Err(AppError::Unauthorized("Invalid email or password".to_string()));
        }

        let role_str = format!("{:?}", user.role).to_uppercase();
        let access_token = generate_access_token(&user.id, &user.email, &role_str, &self.config)?;
        let refresh_token = generate_refresh_token(&user.id, &self.config)?;

        Ok(AuthTokenResponse {
            access_token,
            refresh_token,
            token_type: "Bearer".to_string(),
            expires_in: self.config.jwt_expiry_hours * 3600,
            user: user.into(),
        })
    }

    pub async fn refresh_token(&self, refresh_token: &str) -> AppResult<(String, String, UserResponse)> {
        // Verify the refresh token
        let claims = verify_refresh_token(refresh_token, &self.config)?;

        let user_id = Uuid::parse_str(&claims.sub)
            .map_err(|_| AppError::Unauthorized("Invalid token subject".to_string()))?;

        // Fetch fresh user data (confirms account still active)
        let user = self.repo.find_by_id(user_id).await?;

        let role_str = format!("{:?}", user.role).to_uppercase();
        let access_token = generate_access_token(&user.id, &user.email, &role_str, &self.config)?;
        let new_refresh_token = generate_refresh_token(&user.id, &self.config)?;

        Ok((access_token, new_refresh_token, user))
    }

    pub async fn get_me(&self, user_id: Uuid) -> AppResult<UserResponse> {
        let user = self.repo.find_by_id(user_id).await?;
        Ok(user)
    }
}
