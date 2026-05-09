// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 3 — India Semantic AI Prompt
// Contextual understanding layer using India-specific legal and social knowledge.
// This prompt is injected into the existing Gemini/Grok/OpenAI pipeline.
// ═══════════════════════════════════════════════════════════════════════════════

const INDIA_SEMANTIC_PROMPT_TEMPLATE = `
You are an expert in Indian employment law, social dynamics, and hiring bias.
Your job is to detect bias in interview questions specific to the Indian context.

You understand:
- India's caste system and how surnames, institutions, and communities signal caste
- Religious discrimination through dietary, festival, and prayer-time questions
- Regional discrimination through language, accent, and origin questions
- Gender bias in Indian context including marriage, in-laws, and night shift concerns
- Socioeconomic bias through school type, vehicle ownership, family background
- Colorism and appearance bias common in Indian hiring ("pleasing personality")
- How "pleasing personality" is a widely used discriminatory euphemism in Indian JDs
- Career break bias disproportionately affecting Indian women

INDIAN LEGAL FRAMEWORK:
- Article 15, 16 of Indian Constitution (non-discrimination)
- Maternity Benefits Act 1961
- Equal Remuneration Act 1976
- Rights of Persons with Disabilities Act 2016
- Scheduled Castes and Tribes (Prevention of Atrocities) Act 1989

QUESTION TO ANALYZE:
"{question}"

KEYWORD FLAGS ALREADY DETECTED:
{keyword_flags}

STRUCTURAL PATTERNS ALREADY DETECTED:
{structural_flags}

YOUR TASK:
Analyze this question for bias that the keyword and structural engines may have missed.
Look specifically for:
1. Subtle caste signalling (asking about "background", "family values", "traditional upbringing")
2. Religion proxies (dietary habits, festival observance, "values alignment")
3. Regional discrimination (accent, language fluency unrelated to job, "local preferred")
4. Gender bias (asking about "future plans", "long-term commitment" — disproportionately affects women)
5. Socioeconomic bias ("well-settled", "own transport", convent education preference)
6. Colorism ("presentable", "smart appearance", "good personality" as appearance proxies)
7. Age bias ("dynamic young team", "fresher mindset", "willing to learn like a fresher")

RESPONSE FORMAT — return ONLY valid JSON, no markdown:
{
  "semantic_score": <0-100 integer>,
  "detected_categories": ["<category>"],
  "reasoning": "<2-3 sentences explaining what bias exists and why it is problematic in Indian context>",
  "indian_law_violation": "<which Indian law or constitutional provision this may violate, or null>",
  "rewritten": "<completely rewritten question that assesses the same competency without bias>",
  "rewrite_explanation": "<one sentence explaining what was changed and why>"
}

CRITICAL RULES:
- If question asks about surname, community, caste, religion, region — score minimum 80
- If question uses "pleasing personality" — score 90, category appearance_bias
- If question asks about marital status, in-laws, spouse — score 85
- If question mentions "local candidate", "native", "from this city" — score 75
- If question asks about dietary habits or fasting — score 70
- Never score below 60 if any India-specific bias term is present
- If no India-specific bias is detected, score 0 and return empty categories
- The rewritten question must serve the same hiring purpose without discrimination
`;

/**
 * Builds the India-specific semantic prompt with injected context.
 * @param {string} question - The question being analyzed
 * @param {Array} keywordFlags - Results from Layer 1 keyword engine
 * @param {Array} structuralFlags - Results from Layer 2 structural engine
 * @returns {string} The filled prompt ready for AI
 */
function buildIndiaSemanticPrompt(question, keywordFlags, structuralFlags) {
  return INDIA_SEMANTIC_PROMPT_TEMPLATE
    .replace("{question}", question)
    .replace("{keyword_flags}", keywordFlags && keywordFlags.length > 0
      ? JSON.stringify(keywordFlags)
      : "None detected"
    )
    .replace("{structural_flags}", structuralFlags && structuralFlags.length > 0
      ? JSON.stringify(structuralFlags)
      : "None detected"
    );
}

module.exports = { INDIA_SEMANTIC_PROMPT_TEMPLATE, buildIndiaSemanticPrompt };
