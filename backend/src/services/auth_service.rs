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

#[derive(Clone)]
pub struct AuthService {
    db: PgPool,
    config: Config,
}

impl AuthService {
    pub fn new(db: PgPool, config: Config) -> Self {
        Self { db, config }
    }

    pub async fn register(&self, req: RegisterRequest) -> AppResult<UserResponse> {
        // Validate inputs
        if req.name.trim().is_empty() {
            return Err(AppError::BadRequest("Name is required".to_string()));
        }
        if req.email.trim().is_empty() {
            return Err(AppError::BadRequest("Email is required".to_string()));
        }

        validate_password_strength(&req.password)?;

        let repo = AuthRepository::new(self.db.clone());

        // Check existing email
        if repo.find_by_email(&req.email.to_lowercase()).await?.is_some() {
            return Err(AppError::Conflict("Email address is already registered".to_string()));
        }

        let password_hash = hash_password(&req.password)?;
        repo.create(&req, &password_hash).await
    }

    pub async fn login(&self, req: LoginRequest) -> AppResult<AuthTokenResponse> {
        if req.email.trim().is_empty() || req.password.trim().is_empty() {
            return Err(AppError::BadRequest("Email and password are required".to_string()));
        }

        let repo = AuthRepository::new(self.db.clone());

        // Look up user
        let user = repo
            .find_by_email(&req.email.to_lowercase())
            .await?
            .ok_or_else(|| AppError::Unauthorized("Invalid email or password".to_string()))?;

        // Check active status
        if !user.is_active {
            return Err(AppError::Unauthorized("Account is deactivated. Contact admin.".to_string()));
        }

        // Verify password
        if !verify_password(&req.password, &user.password_hash)? {
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

    pub async fn refresh_token(&self, refresh_token: &str) -> AppResult<AuthTokenResponse> {
        // Verify the refresh token
        let claims = verify_refresh_token(refresh_token, &self.config)?;

        let user_id = Uuid::parse_str(&claims.sub)
            .map_err(|_| AppError::Unauthorized("Invalid token subject".to_string()))?;

        // Fetch fresh user data (confirms account still active)
        let repo = AuthRepository::new(self.db.clone());
        let user = repo.find_by_id(user_id).await?;

        let role_str = format!("{:?}", user.role).to_uppercase();
        let access_token = generate_access_token(&user.id, &user.email, &role_str, &self.config)?;
        let new_refresh_token = generate_refresh_token(&user.id, &self.config)?;

        Ok(AuthTokenResponse {
            access_token,
            refresh_token: new_refresh_token,
            token_type: "Bearer".to_string(),
            expires_in: self.config.jwt_expiry_hours * 3600,
            user,
        })
    }
}
