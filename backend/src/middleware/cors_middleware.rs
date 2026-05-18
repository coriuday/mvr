use tower_http::cors::{AllowOrigin, CorsLayer};
use axum::http::{HeaderValue, Method, header};

/// Builds the CORS layer from allowed origins list.
pub fn build_cors_layer(allowed_origins: &[String]) -> CorsLayer {
    let origins: Vec<HeaderValue> = allowed_origins
        .iter()
        .filter_map(|origin| origin.parse::<HeaderValue>().ok())
        .collect();

    CorsLayer::new()
        .allow_origin(AllowOrigin::list(origins))
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::PUT,
            Method::PATCH,
            Method::DELETE,
            Method::OPTIONS,
        ])
        // Explicit header list — required when allow_credentials is true
        // (wildcards are forbidden by the CORS spec in that case)
        .allow_headers([
            header::AUTHORIZATION,
            header::CONTENT_TYPE,
            header::ACCEPT,
            header::ORIGIN,
            header::ACCESS_CONTROL_REQUEST_HEADERS,
            header::ACCESS_CONTROL_REQUEST_METHOD,
        ])
        .allow_credentials(true)
}
