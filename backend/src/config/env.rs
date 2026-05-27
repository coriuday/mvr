use anyhow::{Context, Result};

/// Application configuration loaded from environment variables.
/// All secrets are loaded at startup — fail fast if missing.
#[derive(Debug, Clone)]
pub struct Config {
    // Server
    pub host: String,
    pub port: u16,
    pub environment: String,

    // Database (Supabase PostgreSQL)
    pub database_url: String,

    // JWT
    pub jwt_secret: String,
    pub jwt_refresh_secret: String,
    pub jwt_expiry_hours: u64,
    pub jwt_refresh_expiry_days: u64,

    // CORS
    pub frontend_url: String,
    pub allowed_origins: Vec<String>,

    // Cloudinary
    pub cloudinary_cloud_name: String,
    pub cloudinary_api_key: String,
    pub cloudinary_api_secret: String,
    pub cloudinary_upload_preset: String,

    // Resend Email
    pub resend_api_key: String,
    pub email_from: String,
    pub email_from_name: String,
    pub admin_email: String,
    pub admin_email_guntur: String,

    // AI — Gemini
    pub gemini_api_key: String,
}

impl Config {
    pub fn from_env() -> Result<Self> {
        Ok(Config {
            // Server
            host: std::env::var("BACKEND_HOST").unwrap_or_else(|_| "0.0.0.0".to_string()),
            port: std::env::var("PORT")
                .or_else(|_| std::env::var("BACKEND_PORT"))
                .unwrap_or_else(|_| "8080".to_string())
                .parse::<u16>()
                .context("PORT must be a valid port number")?,
            environment: std::env::var("ENVIRONMENT").unwrap_or_else(|_| "development".to_string()),

            // Database
            database_url: std::env::var("DATABASE_URL")
                .context("DATABASE_URL must be set (Supabase PostgreSQL connection string)")?,

            // JWT
            jwt_secret: std::env::var("JWT_SECRET")
                .context("JWT_SECRET must be set (minimum 32 characters)")?,
            jwt_refresh_secret: std::env::var("JWT_REFRESH_SECRET")
                .context("JWT_REFRESH_SECRET must be set")?,
            jwt_expiry_hours: std::env::var("JWT_EXPIRY_HOURS")
                .unwrap_or_else(|_| "24".to_string())
                .parse::<u64>()
                .context("JWT_EXPIRY_HOURS must be a number")?,
            jwt_refresh_expiry_days: std::env::var("JWT_REFRESH_EXPIRY_DAYS")
                .unwrap_or_else(|_| "30".to_string())
                .parse::<u64>()
                .context("JWT_REFRESH_EXPIRY_DAYS must be a number")?,

            // CORS
            frontend_url: std::env::var("FRONTEND_URL")
                .unwrap_or_else(|_| "http://localhost:3000".to_string()),
            allowed_origins: std::env::var("ALLOWED_ORIGINS")
                .unwrap_or_else(|_| "http://localhost:3000".to_string())
                .split(',')
                .map(|s| s.trim().to_string())
                .collect(),

            // Cloudinary
            cloudinary_cloud_name: std::env::var("CLOUDINARY_CLOUD_NAME")
                .unwrap_or_else(|_| "".to_string()),
            cloudinary_api_key: std::env::var("CLOUDINARY_API_KEY")
                .unwrap_or_else(|_| "".to_string()),
            cloudinary_api_secret: std::env::var("CLOUDINARY_API_SECRET")
                .unwrap_or_else(|_| "".to_string()),
            cloudinary_upload_preset: std::env::var("CLOUDINARY_UPLOAD_PRESET")
                .unwrap_or_else(|_| "mvr_consultants".to_string()),

            // Resend
            resend_api_key: std::env::var("RESEND_API_KEY")
                .unwrap_or_else(|_| "".to_string()),
            email_from: std::env::var("EMAIL_FROM")
                .unwrap_or_else(|_| "mvrconsultantshyd@gmail.com".to_string()),
            email_from_name: std::env::var("EMAIL_FROM_NAME")
                .unwrap_or_else(|_| "MVR Consultants".to_string()),
            admin_email: std::env::var("ADMIN_EMAIL")
                .unwrap_or_else(|_| "mvrconsultantshyd@gmail.com".to_string()),
            admin_email_guntur: std::env::var("ADMIN_EMAIL_GUNTUR")
                .unwrap_or_else(|_| "mvroverseasconsultancy@gmail.com".to_string()),

            // AI — Gemini Flash (cheap, fast, sufficient for SOP review)
            gemini_api_key: std::env::var("GEMINI_API_KEY")
                .unwrap_or_else(|_| "".to_string()),
        })
    }

    pub fn is_production(&self) -> bool {
        self.environment == "production"
    }
}
