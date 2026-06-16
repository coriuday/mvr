use crate::utils::errors::AppResult;
use chrono::Datelike;
use resend_rs::{Resend, types::CreateEmailBaseOptions};

/// H-8 security fix: HTML-escapes all characters that have special meaning in HTML.
/// Must be applied to EVERY user-controlled value before embedding it in an HTML email body.
/// Prevents HTML injection and potential XSS in email clients.
fn html_escape(s: &str) -> String {
    s.chars()
        .map(|c| match c {
            '&'  => "&amp;".to_string(),
            '<'  => "&lt;".to_string(),
            '>'  => "&gt;".to_string(),
            '"'  => "&quot;".to_string(),
            '\'' => "&#x27;".to_string(),
            c    => c.to_string(),
        })
        .collect()
}

pub struct EmailService {
    pub api_key: String,
    pub admin_email: String,
    pub admin_email_guntur: String,
    pub from: String,
}

impl EmailService {
    pub fn new(
        api_key: &str,
        from_address: &str,
        from_name: &str,
        admin_email: &str,
        admin_email_guntur: &str,
    ) -> Self {
        Self {
            api_key: api_key.to_string(),
            admin_email: admin_email.to_string(),
            admin_email_guntur: admin_email_guntur.to_string(),
            from: format!("{} <{}>", from_name, from_address),
        }
    }

    /// Send admin notification when a new lead is submitted
    pub async fn send_lead_notification(
        &self,
        lead_name: &str,
        lead_email: &str,
        lead_phone: Option<&str>,
        lead_message: Option<&str>,
        country_interest: Option<&str>,
    ) -> AppResult<()> {
        // H-8: Escape all user-controlled values before HTML interpolation
        let safe_name    = html_escape(lead_name);
        let safe_email   = html_escape(lead_email);
        let safe_phone   = lead_phone.map(html_escape);
        let safe_message = lead_message.map(html_escape);
        let safe_country = country_interest.map(html_escape);

        let phone_row = safe_phone
            .as_deref()
            .map(|p| format!("<tr><td style='padding:8px 0;color:#6b7280;font-weight:600;width:140px;vertical-align:top;'>Phone</td><td style='padding:8px 0;color:#111827;'>{}</td></tr>", p))
            .unwrap_or_default();
        let country_row = safe_country
            .as_deref()
            .map(|c| format!("<tr><td style='padding:8px 0;color:#6b7280;font-weight:600;vertical-align:top;'>Country Interest</td><td style='padding:8px 0;color:#111827;'>{}</td></tr>", c))
            .unwrap_or_default();
        let message_block = safe_message
            .as_deref()
            .filter(|m| !m.trim().is_empty())
            .map(|m| format!(
                r#"<div style="background:#f9fafb;border-radius:8px;padding:16px;margin-top:16px;">
                     <p style="color:#6b7280;font-size:12px;font-weight:600;margin:0 0 8px 0;text-transform:uppercase;letter-spacing:0.05em;">Message</p>
                     <p style="color:#111827;margin:0;line-height:1.6;">{}</p>
                   </div>"#, m))
            .unwrap_or_default();

        let subject = format!("🎓 New Lead: {} — MVR Consultants", safe_name);
        let resend = Resend::new(&self.api_key);

        // Build email body with escaped values
        let html = format!(
            r#"<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="font-family:Arial,sans-serif;background:#f3f4f6;margin:0;padding:20px;">
  <div style="max-width:580px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#1a2f5e,#0f1c3d);padding:28px 32px;text-align:center;">
      <h1 style="color:#c9a84c;margin:0 0 6px 0;font-size:20px;letter-spacing:0.05em;">MVR CONSULTANTS</h1>
      <p style="color:rgba(255,255,255,0.6);margin:0;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;">Overseas Education · Immigration</p>
    </div>
    <div style="padding:28px 32px;">
      <p style="color:#374151;margin:0 0 4px 0;font-weight:600;">🎓 New Lead Received</p>
      <p style="color:#6b7280;font-size:14px;margin:0 0 20px 0;">A new inquiry was submitted via the MVR Consultants website.</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:8px 0;color:#6b7280;font-weight:600;width:140px;vertical-align:top;">Full Name</td><td style="padding:8px 0;color:#111827;font-weight:700;">{safe_name}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;font-weight:600;vertical-align:top;">Email</td><td style="padding:8px 0;"><a href="mailto:{safe_email}" style="color:#c9a84c;font-weight:600;">{safe_email}</a></td></tr>
        {phone_row}
        {country_row}
      </table>
      {message_block}
      <div style="margin-top:28px;text-align:center;">
        <a href="https://www.mvrconsultants.org/admin/leads"
           style="display:inline-block;background:#1a2f5e;color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">
          Open Admin Dashboard &rarr;
        </a>
      </div>
    </div>
    <div style="background:#f9fafb;padding:16px 32px;text-align:center;border-top:1px solid #f3f4f6;">
      <p style="color:#9ca3af;font-size:11px;margin:0;">
        MVR Consultants &middot; Hyderabad: +91 99669 03884 &middot; Guntur: +91 85999 99331
      </p>
      <p style="color:#d1d5db;font-size:10px;margin:4px 0 0 0;">Automated lead notification &mdash; do not reply to this email</p>
    </div>
  </div>
</body>
</html>"#,
            safe_name = safe_name,
            safe_email = safe_email,
            phone_row = phone_row,
            country_row = country_row,
            message_block = message_block,
        );

        // Send to Hyderabad office (primary)
        let email = CreateEmailBaseOptions::new(&self.from, [self.admin_email.as_str()], &subject)
            .with_html(&html)
            .with_reply(lead_email);

        if let Err(e) = resend.emails.send(email).await {
            tracing::error!("Failed to send lead notification to HYD: {}", e);
            // Soft-fail — don't block lead creation if email fails
        }

        // Also CC Guntur office if different
        if self.admin_email_guntur != self.admin_email {
            let email2 = CreateEmailBaseOptions::new(
                &self.from,
                [self.admin_email_guntur.as_str()],
                &subject,
            )
            .with_html(&html)
            .with_reply(lead_email);

            if let Err(e) = resend.emails.send(email2).await {
                tracing::error!("Failed to send lead notification to GNT: {}", e);
            }
        }

        Ok(())
    }

    /// Send an auto-reply confirmation to the student
    pub async fn send_inquiry_confirmation(
        &self,
        student_email: &str,
        student_name: &str,
    ) -> AppResult<()> {
        let html = format!(
            r#"<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="font-family:Arial,sans-serif;background:#f3f4f6;margin:0;padding:20px;">
  <div style="max-width:580px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#1a2f5e,#0f1c3d);padding:32px;text-align:center;">
      <h1 style="color:#c9a84c;margin:0 0 6px 0;font-size:24px;letter-spacing:0.05em;">MVR CONSULTANTS</h1>
      <p style="color:rgba(255,255,255,0.65);margin:0;font-size:13px;">Overseas Education · Immigration</p>
    </div>
    <div style="padding:36px 32px;text-align:center;">
      <div style="font-size:52px;margin-bottom:16px;">✅</div>
      <h2 style="color:#1a2f5e;margin:0 0 12px 0;font-size:22px;">Thank You, {}!</h2>
      <p style="color:#4b5563;line-height:1.75;margin:0 0 12px 0;font-size:15px;">
        We have received your inquiry. One of our expert counselors will contact you within <strong>24 hours</strong>.
      </p>
      <p style="color:#6b7280;font-size:14px;line-height:1.7;margin:0 0 28px 0;">
        In the meantime, explore our
        <a href="https://www.mvrconsultants.org/universities" style="color:#c9a84c;font-weight:600;">partner universities</a>
        and
        <a href="https://www.mvrconsultants.org/scholarships" style="color:#c9a84c;font-weight:600;">available scholarships</a>.
      </p>
      <a href="https://www.mvrconsultants.org"
         style="display:inline-block;background:#c9a84c;color:white;padding:14px 36px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">
        Visit Our Website
      </a>
    </div>
    <div style="background:#1a2f5e;padding:20px 32px;">
      <table style="width:100%;font-size:12px;color:rgba(255,255,255,0.65);">
        <tr>
          <td style="padding:4px 0;">📞 Hyderabad</td>
          <td style="padding:4px 0;text-align:right;"><a href="tel:+919966903884" style="color:#c9a84c;text-decoration:none;">+91 99669 03884</a> · <a href="tel:+918599999331" style="color:#c9a84c;text-decoration:none;">+91 85999 99331</a></td>
        </tr>
        <tr>
          <td style="padding:4px 0;">📞 Guntur</td>
          <td style="padding:4px 0;text-align:right;"><a href="tel:+918599999331" style="color:#c9a84c;text-decoration:none;">+91 85999 99331</a></td>
        </tr>
        <tr>
          <td style="padding:4px 0;">✉️ Email</td>
          <td style="padding:4px 0;text-align:right;"><a href="mailto:{}" style="color:#c9a84c;text-decoration:none;">{}</a></td>
        </tr>
        <tr>
          <td style="padding:4px 0;">🌐 Web</td>
          <td style="padding:4px 0;text-align:right;"><a href="https://www.mvrconsultants.org" style="color:#c9a84c;text-decoration:none;">www.mvrconsultants.org</a></td>
        </tr>
      </table>
    </div>
    <div style="padding:12px 32px;text-align:center;background:#f9fafb;border-top:1px solid #f3f4f6;">
      <p style="color:#d1d5db;font-size:10px;margin:0;">© {} MVR Consultants. Managing Director: Mukkapati Veeranjaneyulu</p>
    </div>
  </div>
</body>
</html>"#,
            student_name,
            self.admin_email_guntur,
            self.admin_email_guntur,
            chrono::Utc::now().year()
        );

        let resend = Resend::new(&self.api_key);
        let email = CreateEmailBaseOptions::new(
            &self.from,
            [student_email],
            "We received your inquiry — MVR Consultants",
        )
        .with_html(&html);

        if let Err(e) = resend.emails.send(email).await {
            tracing::warn!(
                "Failed to send inquiry confirmation to {}: {}",
                student_email,
                e
            );
            // Soft-fail
        }

        Ok(())
    }
}
