const { callAI } = require("./aiService");

/**
 * STEP 3: Strong Classifier Prompt
 * - Sends FULL question (no compression)
 * - Forces structured thinking before scoring
 */
async function classify(processed) {
  const systemPrompt = `You are an expert Diversity & Inclusion (D&I) Compliance Officer at Rifair AI. 
  Your mission is to detect hidden, subtle, and overt biases in interview questions. 
  
  BIAS CATEGORIES:
  - Gender: Stereotypes, marital status, family planning.
  - Age: "Fresh grads only", "digital natives", "too seasoned".
  - Cultural: "Culture fit", "our kind of people", background inquiries.
  - Work-Life: Late nights, weekend expectations, 24/7 availability.
  - Socioeconomic: Elite colleges, "pedigree", salary history.
  - Tone: Aggressive, exclusionary, or intimidating language.

  SCORING RUBRIC (BE STRICT):
  0-20: Neutral. Strictly skill-based.
  21-50: Subtle Bias. Microaggressions, personal life mentions, or soft exclusion.
  51-80: Moderate to High Bias. Direct personal questions, culture-fit demands.
  81-100: Illegal or Extreme Bias. Discriminatory, harassing, or strictly illegal.

  Analyze thoroughly. Even "innocent" questions about "personal life" or "handling pressure" can be biased if they imply lack of work-life balance or exclude certain demographics.`;

  const userPrompt =
`INTERVIEW QUESTION:
"${processed.original_text}"

THOROUGH ANALYSIS:
1. Identify specific biased phrases or linguistic patterns.
2. Determine the impact on diversity.
3. Assign a strict severity score.

Return ONLY this JSON:
{
  "reasoning": "<detailed analysis path>",
  "bias_types": ["age"|"gender"|"cultural"|"work_life"|"socioeconomic"|"health"|"harassment"|"tone"],
  "severity": <number 0-100>,
  "explanation": "<one high-impact sentence for the user>"
}`;

  try {
    const result = await callAI(systemPrompt, userPrompt, true);

    let aiSeverity = 0;
    if (typeof result.severity === 'number') aiSeverity = result.severity;
    else if (typeof result.score === 'number') aiSeverity = result.score;
    else aiSeverity = Number(result.severity || result.score) || 0;

    // STEP 4: Merge AI severity with hard rule boost
    const finalSeverity = Math.min(100, Math.max(aiSeverity, processed.rule_boost));

    return {
      bias_types: Array.isArray(result.bias_types) ? result.bias_types : processed.signals,
      severity: finalSeverity,
      explanation: result.explanation || "Bias detected based on keyword analysis.",
    };
  } catch (error) {
    console.warn("[CLASSIFY] AI failed, using rule-based fallback:", error.message);
    // Pure rule-based fallback: use hard boost + signal count
    const fallbackSeverity = Math.max(
      processed.rule_boost,
      processed.signals.length > 0 ? 40 : 0
    );
    return {
      bias_types: processed.signals,
      severity: fallbackSeverity,
      explanation: "Bias detected based on rule-based linguistic analysis.",
    };
  }
}

module.exports = { classify };
