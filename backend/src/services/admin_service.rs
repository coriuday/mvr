use crate::{
    models::lead::LeadFilter,
    repositories::{auth_repository::AuthRepository, lead_repository::LeadRepository},
    utils::errors::AppResult,
};
use sqlx::PgPool;

/// Dashboard statistics computed from the leads and users tables.
pub struct DashboardStats {
    pub total_leads: i64,
    pub new_leads_today: i64,
    pub new_leads_total: usize,
    pub converted_leads: usize,
    pub conversion_rate: String,
    pub staff_count: usize,
}

pub struct AdminService {
    db: PgPool,
}

impl AdminService {
    pub fn new(db: PgPool) -> Self {
        Self { db }
    }

    /// Gather all dashboard stats in parallel and compute derived metrics.
    pub async fn get_dashboard_stats(&self) -> AppResult<DashboardStats> {
        let lead_repo = LeadRepository::new(self.db.clone());
        let auth_repo = AuthRepository::new(self.db.clone());

        let (leads_today, (new_count, converted_count, total_leads), staff) = tokio::try_join!(
            lead_repo.count_today(),
            lead_repo.count_status_totals(),
            auth_repo.list_all(),
        )?;

        let conversion_rate = if total_leads > 0 {
            format!(
                "{:.1}%",
                (converted_count as f64 / total_leads as f64) * 100.0
            )
        } else {
            "0%".to_string()
        };

        Ok(DashboardStats {
            total_leads,
            new_leads_today: leads_today,
            new_leads_total: new_count as usize,
            converted_leads: converted_count as usize,
            conversion_rate,
            staff_count: staff.len(),
        })
    }

    /// Fetch the 10 most recent leads for the dashboard widget.
    pub async fn get_recent_leads(&self) -> AppResult<Vec<crate::models::lead::Lead>> {
        let repo = LeadRepository::new(self.db.clone());
        let filter = LeadFilter {
            status: None,
            page: Some(1),
            per_page: Some(10),
        };
        let (leads, _) = repo.find_all(&filter).await?;
        Ok(leads)
    }
}
