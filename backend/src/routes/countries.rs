use axum::{extract::{Path, Query, State}, Json};
use uuid::Uuid;
use crate::{
    models::country::{CountryFilter, CreateCountryRequest, UpdateCountryRequest},
    routes::AppState,
    services::country_service::CountryService,
    utils::{errors::AppResult, response::MessageResponse},
};

// ─── GET /api/countries  (public — card listing) ─────────────────────────────
/// Returns lightweight card data: slug, name, flag, tagline, image_url.
/// No JSONB content — keeps the payload small for the listing grid.
pub async fn get_all_countries(
    State(state): State<AppState>,
) -> AppResult<Json<serde_json::Value>> {
    let cards = CountryService::new(state.db).list_active().await?;
    Ok(Json(serde_json::json!({
        "success": true,
        "data": cards,
    })))
}

// ─── GET /api/countries/:slug  (public — full detail) ────────────────────────
/// Returns the full country row including the JSONB content blob.
pub async fn get_country_by_slug(
    State(state): State<AppState>,
    Path(slug): Path<String>,
) -> AppResult<Json<serde_json::Value>> {
    let country = CountryService::new(state.db).get_by_slug(&slug).await?;
    // Merge scalar fields with the content JSONB so the frontend receives
    // a single flat object that matches the CountryData TypeScript interface.
    let mut data = serde_json::json!({
        "slug":           country.slug,
        "name":           country.name,
        "flag":           country.flag,
        "tagline":        country.tagline,
        "heroImage":      country.hero_image_url,
        "sort_order":     country.sort_order,
        "is_active":      country.is_active,
    });
    // Merge content JSONB fields — these can override scalar fields if present
    if let serde_json::Value::Object(ref content_map) = *country.content {
        if let serde_json::Value::Object(ref mut data_map) = data {
            for (k, v) in content_map {
                data_map.entry(k.clone()).or_insert_with(|| v.clone());
            }
        }
    }
    Ok(Json(serde_json::json!({ "success": true, "data": data })))
}

// ─── Admin routes ─────────────────────────────────────────────────────────────

/// GET /api/admin/countries  — paginated full list for admin panel
pub async fn admin_list_countries(
    State(state): State<AppState>,
    Query(filter): Query<CountryFilter>,
) -> AppResult<Json<serde_json::Value>> {
    let (countries, total) = CountryService::new(state.db).list_all(&filter).await?;
    let page     = filter.page.unwrap_or(1);
    let per_page = filter.per_page.unwrap_or(50);
    Ok(Json(serde_json::json!({
        "success": true,
        "data": countries,
        "meta": {
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": (total as f64 / per_page as f64).ceil() as i64,
        }
    })))
}

/// POST /api/admin/countries
pub async fn create_country(
    State(state): State<AppState>,
    Json(body): Json<CreateCountryRequest>,
) -> AppResult<Json<serde_json::Value>> {
    let country = CountryService::new(state.db).create(&body).await?;
    Ok(Json(serde_json::json!({ "success": true, "data": country })))
}

/// PUT /api/admin/countries/:id
pub async fn update_country(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(body): Json<UpdateCountryRequest>,
) -> AppResult<Json<serde_json::Value>> {
    let country = CountryService::new(state.db).update(id, &body).await?;
    Ok(Json(serde_json::json!({ "success": true, "data": country })))
}

/// DELETE /api/admin/countries/:id
pub async fn delete_country(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<MessageResponse>> {
    CountryService::new(state.db).delete(id).await?;
    Ok(Json(MessageResponse::new("Country deleted successfully")))
}
