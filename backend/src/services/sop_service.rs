use crate::utils::errors::{AppError, AppResult};
use reqwest::Client;
use serde::{Deserialize, Serialize};

// ─── Request / Response types ─────────────────────────────────────────────────

/// Inbound from the route handler
#[derive(Debug, Deserialize)]
pub struct SopReviewRequest {
    /// The raw SOP text the student wants reviewed
    pub sop_text: String,
    /// Target country slug, e.g. "usa", "uk", "germany"
    pub country: Option<String>,
    /// Target degree level
    pub degree: Option<DegreeLevel>,
    /// Intended program/field
    pub program: Option<String>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
#[serde(rename_all = "snake_case")]
pub enum DegreeLevel {
    Undergraduate,
    Postgraduate,
    Phd,
}

impl DegreeLevel {
    fn label(&self) -> &'static str {
        match self {
            DegreeLevel::Undergraduate => "Undergraduate",
            DegreeLevel::Postgraduate => "Postgraduate (Masters)",
            DegreeLevel::Phd => "PhD / Doctorate",
        }
    }
}

/// Structured AI output — mirrors the TypeScript interface on the frontend
#[derive(Debug, Serialize, Deserialize)]
pub struct SopReviewResult {
    /// 0–100 composite score
    pub overall_score: u8,
    /// One-line verdict
    pub verdict: String,
    pub dimensions: Vec<ReviewDimension>,
    pub strengths: Vec<String>,
    pub improvements: Vec<Improvement>,
    pub revised_intro: Option<String>,
    pub word_count: usize,
    /// Cost indicator for UI
    pub tokens_used: Option<u32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ReviewDimension {
    pub name: String,
    pub score: u8,
    pub comment: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Improvement {
    pub priority: ImprovementPriority,
    pub section: String,
    pub issue: String,
    pub fix: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ImprovementPriority {
    Critical,
    High,
    Medium,
    Low,
}

// ─── Gemini API wire types (only fields we need) ──────────────────────────────

#[derive(Serialize)]
struct GeminiRequest {
    contents: Vec<GeminiContent>,
    #[serde(rename = "generationConfig")]
    generation_config: GeminiGenerationConfig,
}

#[derive(Serialize)]
struct GeminiContent {
    parts: Vec<GeminiPart>,
}

#[derive(Serialize)]
struct GeminiPart {
    text: String,
}

#[derive(Serialize)]
struct GeminiGenerationConfig {
    temperature: f32,
    #[serde(rename = "maxOutputTokens")]
    max_output_tokens: u32,
    #[serde(rename = "responseMimeType")]
    response_mime_type: String,
}

#[derive(Deserialize)]
struct GeminiResponse {
    candidates: Vec<GeminiCandidate>,
    #[serde(rename = "usageMetadata")]
    usage_metadata: Option<GeminiUsage>,
}

#[derive(Deserialize)]
struct GeminiCandidate {
    content: GeminiContent2,
}

#[derive(Deserialize)]
struct GeminiContent2 {
    parts: Vec<GeminiPart2>,
}

#[derive(Deserialize)]
struct GeminiPart2 {
    text: String,
}

#[derive(Deserialize)]
struct GeminiUsage {
    #[serde(rename = "totalTokenCount")]
    total_token_count: Option<u32>,
}

// ─── Prompt builder ───────────────────────────────────────────────────────────

/// Constructs the structured prompt.
///
/// Design principles:
/// 1. Role injection — "You are an expert admissions consultant" primes the
///    model with the right persona and vocabulary.
/// 2. Context injection — country, degree, program tailor feedback; without
///    these the model gives generic advice.
/// 3. Strict JSON-only output — `responseMimeType: application/json` + explicit
///    schema in the prompt prevents markdown wrappers in the response.
/// 4. Word-count cap check — prompt explicitly asks model to flag SOP length
///    issues (most universities want 600–1000 words).
/// 5. Concrete fix phrasing — each improvement must include an actionable `fix`
///    so students get prescriptive guidance, not vague critique.
fn build_prompt(req: &SopReviewRequest) -> String {
    let country_ctx = req
        .country
        .as_deref()
        .unwrap_or("any English-speaking country");
    let degree_ctx = req
        .degree
        .as_ref()
        .map(DegreeLevel::label)
        .unwrap_or("postgraduate");
    let program_ctx = req.program.as_deref().unwrap_or("not specified");
    let word_count = req.sop_text.split_whitespace().count();

    format!(
        r#"You are a senior admissions consultant with 15+ years of experience reviewing Statements of Purpose (SOPs) for international students applying to universities in {country_ctx}. You have deep knowledge of what admissions committees at top universities look for.

## Task
Review the following SOP for a {degree_ctx} application in {program_ctx}. The SOP has {word_count} words.

## SOP Text
---
{sop_text}
---

## Instructions
Evaluate the SOP across these 5 dimensions, score each 0–100:
1. **Clarity & Structure** — Logical flow, paragraph organisation, transitions
2. **Motivation & Purpose** — Why this program, why this country, career goals alignment
3. **Academic & Professional Background** — How well achievements are presented and linked to goals
4. **Uniqueness & Differentiation** — Personal story, what makes this student stand out
5. **Language & Style** — Grammar, vocabulary, tone appropriate for academic audience

Then identify:
- Top 3 genuine strengths (specific, not generic praise)
- Up to 5 improvements ordered by priority (critical/high/medium/low), each with a concrete rewrite suggestion
- Optionally rewrite the opening paragraph only if it is weak (score < 65)

## Output
Respond with ONLY valid JSON matching this exact schema. No markdown, no explanation outside JSON:

{{
  "overall_score": <integer 0-100>,
  "verdict": "<one punchy sentence verdict>",
  "dimensions": [
    {{"name": "Clarity & Structure", "score": <0-100>, "comment": "<2-3 sentences>"}},
    {{"name": "Motivation & Purpose", "score": <0-100>, "comment": "<2-3 sentences>"}},
    {{"name": "Academic & Professional Background", "score": <0-100>, "comment": "<2-3 sentences>"}},
    {{"name": "Uniqueness & Differentiation", "score": <0-100>, "comment": "<2-3 sentences>"}},
    {{"name": "Language & Style", "score": <0-100>, "comment": "<2-3 sentences>"}}
  ],
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": [
    {{
      "priority": "critical|high|medium|low",
      "section": "<which part of SOP>",
      "issue": "<what is wrong>",
      "fix": "<concrete rewrite or specific action>"
    }}
  ],
  "revised_intro": "<rewritten opening paragraph, or null if score >= 65>",
  "word_count": {word_count}
}}"#,
        country_ctx = country_ctx,
        degree_ctx = degree_ctx,
        program_ctx = program_ctx,
        word_count = word_count,
        sop_text = &req.sop_text,
    )
}

// ─── Service ──────────────────────────────────────────────────────────────────

pub struct SopService {
    api_key: String,
    client: Client,
}

impl SopService {
    pub fn new(api_key: &str) -> Self {
        // 30s timeout: Gemini Flash typically responds in <5s; 30s covers high-load cases
        // without blocking a handler thread indefinitely if the API hangs.
        let client = Client::builder()
            .timeout(std::time::Duration::from_secs(30))
            .build()
            .unwrap_or_default();
        Self {
            api_key: api_key.to_string(),
            client,
        }
    }

    pub fn is_configured(&self) -> bool {
        !self.api_key.is_empty()
    }

    /// Call Gemini Flash and parse the structured JSON response.
    ///
    /// Cost notes:
    ///   - Gemini 1.5 Flash: ~$0.075 / 1M input tokens, ~$0.30 / 1M output tokens
    ///   - A typical SOP review: ~1,500 input tokens + ~600 output tokens ≈ $0.0003/call
    ///   - maxOutputTokens=1024 caps spend; Flash is 10x cheaper than Pro
    pub async fn review_sop(&self, req: &SopReviewRequest) -> AppResult<SopReviewResult> {
        if !self.is_configured() {
            return Err(AppError::InternalServerError(
                "AI service is not configured on this server. Please add GEMINI_API_KEY."
                    .to_string(),
            ));
        }

        // Validate SOP length — saves tokens for empty/spam submissions
        let word_count = req.sop_text.split_whitespace().count();
        if word_count < 50 {
            return Err(AppError::BadRequest(
                "Your SOP must be at least 50 words for a meaningful review.".to_string(),
            ));
        }
        if word_count > 3000 {
            return Err(AppError::BadRequest(
                "Please submit a maximum of 3,000 words. Split into sections if needed."
                    .to_string(),
            ));
        }

        let prompt = build_prompt(req);

        let gemini_req = GeminiRequest {
            contents: vec![GeminiContent {
                parts: vec![GeminiPart { text: prompt }],
            }],
            generation_config: GeminiGenerationConfig {
                temperature: 0.3,        // low temp = consistent structured output
                max_output_tokens: 1024, // caps cost; enough for the schema above
                response_mime_type: "application/json".to_string(),
            },
        };

        // Gemini 1.5 Flash — fast + cheap; tunable to Pro via env var if needed
        let url = format!(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={}",
            self.api_key
        );

        // ── Structured AI request trace ───────────────────────────────────────
        let started_at = std::time::Instant::now();
        tracing::info!(
            sop.word_count = word_count,
            sop.country = req.country.as_deref().unwrap_or("unset"),
            sop.degree = req
                .degree
                .as_ref()
                .map(DegreeLevel::label)
                .unwrap_or("unset"),
            "AI SOP review requested"
        );

        let resp = self.client
            .post(&url)
            .json(&gemini_req)
            .send()
            .await
            .map_err(|e| {
                // Distinguish timeout from other network failures for alerting.
                if e.is_timeout() {
                    tracing::error!(
                        sop.word_count = word_count,
                        error          = "timeout",
                        "Gemini API timed out after 30s"
                    );
                    AppError::InternalServerError(
                        "The AI service is taking too long to respond. Please try again in a moment.".to_string(),
                    )
                } else {
                    tracing::error!(
                        sop.word_count = word_count,
                        error          = %e,
                        "Gemini API network error"
                    );
                    AppError::InternalServerError(format!("AI API request failed: {e}"))
                }
            })?;

        if !resp.status().is_success() {
            let status = resp.status();
            let body = resp.text().await.unwrap_or_default();
            tracing::error!(
                sop.word_count = word_count,
                gemini.status  = status.as_u16(),
                gemini.body    = %body,
                "Gemini API returned non-2xx response"
            );
            return Err(AppError::InternalServerError(
                "AI service returned an error. Please try again shortly.".to_string(),
            ));
        }

        let gemini_resp: GeminiResponse = resp.json().await.map_err(|e| {
            AppError::InternalServerError(format!("Failed to parse AI response: {e}"))
        })?;

        let tokens_used = gemini_resp
            .usage_metadata
            .as_ref()
            .and_then(|u| u.total_token_count);

        let raw_json = gemini_resp
            .candidates
            .into_iter()
            .next()
            .and_then(|c| c.content.parts.into_iter().next())
            .map(|p| p.text)
            .ok_or_else(|| AppError::InternalServerError("Empty AI response".to_string()))?;

        let mut result: SopReviewResult = serde_json::from_str(&raw_json).map_err(|e| {
            tracing::error!(
                sop.word_count = word_count,
                parse_error    = %e,
                raw_json       = %raw_json,
                "Failed to parse Gemini JSON output into SopReviewResult"
            );
            AppError::InternalServerError(
                "AI returned an unexpected format. Please try again.".to_string(),
            )
        })?;

        // Clamp score to valid range and attach token count
        result.overall_score = result.overall_score.min(100);
        result.word_count = word_count;
        result.tokens_used = tokens_used;

        // ── Success telemetry ─────────────────────────────────────────────────
        let elapsed_ms = started_at.elapsed().as_millis();
        tracing::info!(
            sop.word_count = word_count,
            sop.overall_score = result.overall_score,
            gemini.tokens = tokens_used.unwrap_or(0),
            gemini.request_ms = elapsed_ms,
            // Approximate cost: $0.075/1M input + $0.30/1M output tokens
            // ~$0.0003 per typical review — logged for budget monitoring.
            gemini.est_cost_usd = tokens_used
                .map(|t| format!("{:.5}", t as f64 * 0.0000003))
                .unwrap_or_else(|| "unknown".to_string()),
            "AI SOP review completed"
        );

        Ok(result)
    }
}
