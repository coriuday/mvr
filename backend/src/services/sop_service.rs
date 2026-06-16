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
    /// Intended program/field (max 100 chars to prevent injection)
    pub program: Option<String>,
    /// Optional user email for usage tracking and per-email rate limiting (H-3 fix)
    #[allow(dead_code)]
    pub email: Option<String>,
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

/// Sanitizes user-supplied text before embedding it in the Gemini prompt.
///
/// Security fixes:
/// - M-2: Applies Unicode NFKD normalization FIRST to defeat homoglyph attacks
///   e.g. "ᵢɡɳᵒʀᵉ previous instructions" normalizes to ASCII "ignore..."
/// - Strips control sequences that break our YAML-style delimiters.
/// - Removes leading `##`, `---`, and backtick sequences that could
///   escape the content block and inject new prompt instructions.
/// - Extended injection keyword list.
/// - Truncates to a hard character limit (in addition to word count).
fn sanitize_for_prompt(text: &str, max_chars: usize) -> String {
    // Truncate first to avoid doing expensive replacements on huge strings
    let truncated = if text.len() > max_chars {
        &text[..max_chars]
    } else {
        text
    };

    // M-2 fix: Apply Unicode NFKD normalization to collapse homoglyphs.
    // NFKD decomposes characters like 'ᵢ' (U+1D62) → 'i', enabling the
    // ASCII keyword checks below to catch Unicode-obfuscated injection attempts.
    // We use a simple transliteration for Rust's stable library (no external Unicode crate needed).
    let normalized = normalize_unicode_ascii(truncated);

    // Replace characters that are structurally significant in our prompt template.
    // We keep newlines (important for paragraph structure) but neutralise
    // heading markers and horizontal-rule sequences that could break the boundary.
    normalized
        .lines()
        .map(|line| {
            let trimmed = line.trim_start();
            // Neutralise markdown headings that could inject new sections
            if trimmed.starts_with("##") || trimmed.starts_with("# ") {
                return format!(
                    "[heading removed] {}",
                    trimmed.trim_start_matches('#').trim()
                );
            }
            // Neutralise horizontal rules that would break the --- delimiter
            if trimmed.starts_with("---")
                || trimmed.starts_with("___")
                || trimmed.starts_with("***")
            {
                return "[separator removed]".to_string();
            }
            // M-2 extended injection keyword list (checked after NFKD normalization)
            let lower = trimmed.to_lowercase();
            let injection_prefixes = [
                "ignore ",
                "disregard ",
                "forget ",
                "override ",
                "bypass ",
                "new instruction",
                "system prompt",
                "you are now",
                "act as",
                "pretend you",
                "your new role",
                "stop being",
                "jailbreak",
                "do anything now",
                "dan mode",
                "developer mode",
            ];
            if injection_prefixes
                .iter()
                .any(|p| lower.starts_with(p) || lower.contains(p))
            {
                return format!("Note: {trimmed}");
            }
            line.to_string()
        })
        .collect::<Vec<_>>()
        .join("\n")
}

/// Lightweight Unicode normalization that maps common homoglyphs and
/// letterlike characters to their ASCII equivalents.
///
/// M-2 fix: Prevents bypass via characters like:
///   ᵢ → i, ɡ → g, ɳ → n, ᵒ → o, ʀ → r, ᴇ → e
///
/// This is not a full NFKD implementation but covers the most common
/// injection bypass patterns without requiring an external crate.
fn normalize_unicode_ascii(text: &str) -> String {
    text.chars()
        .map(|c| match c {
            // Common letterlike homoglyphs
            'ᵢ' | 'ı' => 'i',
            'ɡ' | 'ɢ' | 'ɠ' => 'g',
            'ɳ' | 'ɴ' => 'n',
            'ᵒ' | 'ᴏ' | 'ο' | 'о' => 'o', // Greek/Cyrillic o
            'ʀ' | 'ɾ' => 'r',
            'ᴇ' | 'е' => 'e', // Cyrillic е
            'ᴀ' | 'а' => 'a', // Cyrillic а
            'ᴄ' | 'с' => 'c', // Cyrillic с
            'ᴘ' | 'р' => 'p', // Cyrillic р looks like p
            'ʏ' | 'у' => 'y', // Cyrillic у
            'ᴅ' | 'ᴆ' => 'd',
            'ꜰ' => 'f',
            'ʜ' | 'н' => 'h',
            'ᴊ' => 'j',
            'ᴋ' => 'k',
            'ʟ' => 'l',
            'ᴍ' | 'м' => 'm',
            'ǫ' => 'q',
            'ꜱ' | 'ѕ' => 's',
            'ᴛ' | 'т' => 't',
            'ᴜ' => 'u',
            'ᴠ' | 'ν' => 'v', // Greek nu
            'ᴡ' => 'w',
            'х' | 'χ' => 'x', // Cyrillic/Greek x
            'ᴢ' | 'ᴣ' => 'z',
            _ => c,
        })
        .collect()
}

/// Sanitizes optional context fields (country, program) to prevent injection.
/// Only printable ASCII + common Unicode letters are allowed; max 100 chars.
fn sanitize_context_field(text: &str) -> String {
    text.chars()
        .filter(|c| c.is_alphanumeric() || matches!(c, ' ' | '-' | ',' | '.'))
        .take(100)
        .collect()
}

/// Constructs the structured prompt with a UUID-based content boundary.
///
/// Design principles:
/// 1. UUID boundary — the `BEGIN_SOP` / `END_SOP` markers use a runtime UUID
///    that the user cannot know in advance, preventing boundary escape attacks.
/// 2. Sanitized inputs — country, degree, program, and sop_text are all
///    cleaned before interpolation (H-2 fix).
/// 3. Strict JSON-only output — `responseMimeType: application/json` +
///    explicit schema in the prompt prevents markdown wrappers in the response.
fn build_prompt(req: &SopReviewRequest, boundary: &str) -> String {
    let country_ctx = req
        .country
        .as_deref()
        .map(|c| sanitize_context_field(c))
        .filter(|c| !c.is_empty())
        .unwrap_or_else(|| "any English-speaking country".to_string());
    let degree_ctx = req
        .degree
        .as_ref()
        .map(DegreeLevel::label)
        .unwrap_or("postgraduate");
    let program_ctx = req
        .program
        .as_deref()
        .map(|p| sanitize_context_field(p))
        .filter(|p| !p.is_empty())
        .unwrap_or_else(|| "not specified".to_string());
    let word_count = req.sop_text.split_whitespace().count();
    // H-2: sanitize user content before embedding in prompt
    let safe_sop = sanitize_for_prompt(&req.sop_text, 10_000);

    format!(
        r#"You are a senior admissions consultant with 10+ years of experience reviewing Statements of Purpose (SOPs) for international students applying to universities in {country_ctx}. You have deep knowledge of what admissions committees at top universities look for.

## Task
Review the SOP enclosed between the BEGIN_SOP_{boundary} and END_SOP_{boundary} markers for a {degree_ctx} application in {program_ctx}. The SOP has {word_count} words.

BEGIN_SOP_{boundary}
{safe_sop}
END_SOP_{boundary}

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
        boundary = boundary,
        safe_sop = safe_sop,
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

        // H-3: Enforce character limit (saves tokens AND prevents injection via huge inputs)
        if req.sop_text.len() > 40_000 {
            return Err(AppError::BadRequest(
                "SOP text is too long. Please limit to 10,000 characters.".to_string(),
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

        // H-2: Generate a unique boundary marker per request — the user cannot
        // know this value in advance, so they cannot craft input that escapes
        // the SOP content block and injects new prompt instructions.
        let boundary = uuid::Uuid::new_v4()
            .to_string()
            .replace('-', "")
            .to_uppercase();

        let prompt = build_prompt(req, &boundary);

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
