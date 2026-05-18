use axum::{extract::State, Json};
use crate::{
    repositories::{auth_repository::AuthRepository, lead_repository::LeadRepository},
    routes::AppState,
    utils::errors::AppResult,
};

// ─── GET /api/admin/stats ────────────────────────────────────────────────────
pub async fn get_stats(
    State(state): State<AppState>,
) -> AppResult<Json<serde_json::Value>> {
    let lead_repo = LeadRepository::new(state.db.clone());
    let auth_repo = AuthRepository::new(state.db.clone());

    // Run queries concurrently
    let (leads_today, lead_stats, staff_count) = tokio::try_join!(
        lead_repo.count_today(),
        lead_repo.get_lead_stats(),
        auth_repo.list_all(),
    )?;

    let (total_leads, new_count, converted_count) = lead_stats;

    Ok(Json(serde_json::json!({
        "success": true,
        "data": {
            "total_leads": total_leads,
            "new_leads_today": leads_today,
            "new_leads_total": new_count,
            "converted_leads": converted_count,
            "conversion_rate": if total_leads > 0 {
                format!("{:.1}%", (converted_count as f64 / total_leads as f64) * 100.0)
            } else { "0%".to_string() },
            "staff_count": staff_count.len(),
        }
    })))
}

// ─── GET /api/admin/recent-leads ─────────────────────────────────────────────
pub async fn get_recent_leads(
    State(state): State<AppState>,
) -> AppResult<Json<serde_json::Value>> {
    let repo = LeadRepository::new(state.db.clone());
    let filter = crate::models::lead::LeadFilter {
        status: None,
        page: Some(1),
        per_page: Some(10),
    };
    let (leads, _) = repo.find_all(&filter).await?;
    Ok(Json(serde_json::json!({ "success": true, "data": leads })))
}
