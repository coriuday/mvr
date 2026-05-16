use reqwest::Client;
use serde::Serialize;
use crate::utils::errors::{AppError, AppResult};

pub struct EmailService {
    pub api_key: String,
    pub from_address: String,
    pub from_name: String,
    pub client: Client,
}

#[derive(Serialize)]
struct ResendEmailRequest<'a> {
    from: String,
    to: Vec<&'a str>,
    subject: &'a str,
    html: String,
    reply_to: Option<Vec<&'a str>>,
}

impl EmailService {
    pub fn new(api_key: String, from_address: String, from_name: String) -> Self {
        Self {
            api_key,
            from_address,
            from_name,
            client: Client::new(),
        }
    }

    /// Send a notification email to the admin when a new lead comes in
    pub async fn send_lead_notification(
        &self,
        admin_email: &str,
        lead_name: &str,
        lead_email: &str,
        lead_phone: Option<&str>,
        lead_message: Option<&str>,
        country_interest: Option<&str>,
    ) -> AppResult<()> {
        let phone_line = lead_phone.map(|p| format!("<li><strong>Phone:</strong> {}</li>", p)).unwrap_or_default();
        let country_line = country_interest.map(|c| format!("<li><strong>Country Interest:</strong> {}</li>", c)).unwrap_or_default();
        let message_line = lead_message.map(|m| format!("<p><strong>Message:</strong><br/>{}</p>", m)).unwrap_or_default();

        let html = format!(r#"
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #1a2f5e; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: #c9a84c; margin: 0; font-size: 22px;">🎓 New Lead — MVR Consultants</h1>
  </div>
  <div style="border: 1px solid #e5e7eb; border-top: none; padding: 28px; border-radius: 0 0 12px 12px;">
    <p style="color: #4b5563; margin-bottom: 16px;">A new inquiry was submitted via the website.</p>
    <ul style="list-style: none; padding: 0; background: #f9fafb; border-radius: 8px; padding: 16px;">
      <li style="margin-bottom: 10px;"><strong>Name:</strong> {}</li>
      <li style="margin-bottom: 10px;"><strong>Email:</strong> <a href="mailto:{}">{}</a></li>
      {}
      {}
    </ul>
    {}
    <div style="margin-top: 24px; text-align: center;">
      <a href="https://mvrconsultants.com/admin/leads" style="background: #1a2f5e; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">
        View in Dashboard →
      </a>
    </div>
  </div>
  <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 16px;">
    MVR Consultants · Automated Lead Notification
  </p>
</body>
</html>
        "#,
        lead_name, lead_email, lead_email, phone_line, country_line, message_line);

        let payload = ResendEmailRequest {
            from: format!("{} <{}>", self.from_name, self.from_address),
            to: vec![admin_email],
            subject: &format!("New Inquiry: {} — MVR Consultants", lead_name),
            html,
            reply_to: Some(vec![lead_email]),
        };

        let response = self.client
            .post("https://api.resend.com/emails")
            .header("Authorization", format!("Bearer {}", self.api_key))
            .json(&payload)
            .send()
            .await
            .map_err(|e| AppError::InternalServerError(format!("Email send failed: {e}")))?;

        if !response.status().is_success() {
            let error_body = response.text().await.unwrap_or_default();
            tracing::error!("Resend API error: {}", error_body);
            // Don't fail the request if email fails — log and continue
        }

        Ok(())
    }

    /// Send a confirmation email to the student who submitted the inquiry
    pub async fn send_inquiry_confirmation(
        &self,
        student_email: &str,
        student_name: &str,
    ) -> AppResult<()> {
        let html = format!(r#"
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #1a2f5e, #0f1c3d); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: #c9a84c; margin: 0 0 8px 0; font-size: 24px;">MVR Consultants</h1>
    <p style="color: rgba(255,255,255,0.75); margin: 0; font-size: 14px;">Your Dream. Our Guidance.</p>
  </div>
  <div style="border: 1px solid #e5e7eb; border-top: none; padding: 32px; border-radius: 0 0 12px 12px; text-align: center;">
    <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
    <h2 style="color: #1a2f5e; margin-bottom: 12px;">Thank You, {}!</h2>
    <p style="color: #4b5563; line-height: 1.7;">
      We have received your inquiry and one of our expert counselors will reach out to you within <strong>24 hours</strong>.
    </p>
    <p style="color: #4b5563; line-height: 1.7;">
      In the meantime, explore our <a href="https://mvrconsultants.com/universities" style="color: #c9a84c;">partner universities</a> and <a href="https://mvrconsultants.com/scholarships" style="color: #c9a84c;">available scholarships</a>.
    </p>
    <div style="margin-top: 28px;">
      <a href="https://mvrconsultants.com" style="background: #c9a84c; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">
        Visit Our Website
      </a>
    </div>
  </div>
  <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 16px;">
    © MVR Consultants · Study Abroad Experts
  </p>
</body>
</html>
        "#, student_name);

        let payload = ResendEmailRequest {
            from: format!("{} <{}>", self.from_name, self.from_address),
            to: vec![student_email],
            subject: "We received your inquiry — MVR Consultants",
            html,
            reply_to: None,
        };

        let _ = self.client
            .post("https://api.resend.com/emails")
            .header("Authorization", format!("Bearer {}", self.api_key))
            .json(&payload)
            .send()
            .await;

        Ok(())
    }
}
