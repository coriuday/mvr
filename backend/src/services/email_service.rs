/// Email service using the Resend API.
/// Uses reqwest to call Resend's REST API directly.
/// TODO: Phase 2 — implement send_email, send_lead_notification, send_contact_confirmation

pub struct EmailService {
    pub api_key: String,
    pub from_address: String,
    pub from_name: String,
}

impl EmailService {
    pub fn new(api_key: String, from_address: String, from_name: String) -> Self {
        Self { api_key, from_address, from_name }
    }
}
