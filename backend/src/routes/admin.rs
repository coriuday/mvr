use axum::{extract::State, Json};
use crate::{
    routes::AppState,
    services::admin_service::AdminService,
    utils::errors::AppResult,
};

// ─── GET /api/admin/stats ────────────────────────────────────────────────────
pub async fn get_stats(
    State(state): State<AppState>,
) -> AppResult<Json<serde_json::Value>> {
    let stats = AdminService::new(state.db).get_dashboard_stats().await?;
    Ok(Json(serde_json::json!({
        "success": true,
        "data": {
            "total_leads":      stats.total_leads,
            "new_leads_today":  stats.new_leads_today,
            "new_leads_total":  stats.new_leads_total,
            "converted_leads":  stats.converted_leads,
            "conversion_rate":  stats.conversion_rate,
            "staff_count":      stats.staff_count,
        }
    })))
}

// ─── GET /api/admin/recent-leads ─────────────────────────────────────────────
pub async fn get_recent_leads(
    State(state): State<AppState>,
) -> AppResult<Json<serde_json::Value>> {
    let leads = AdminService::new(state.db).get_recent_leads().await?;
    Ok(Json(serde_json::json!({ "success": true, "data": leads })))
}
