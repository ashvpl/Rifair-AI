/**
 * outputValidator.js
 *
 * Validates AI output quality before it is served to the user.
 * If validation fails, the caller should append the issues list
 * to the prompt and retry (max 2 attempts).
 */

"use strict";

class OutputQualityGate {
  /**
   * Validate an analysis result from the master analysis prompt.
   *
   * @param {object} result  - Parsed JSON from AI
   * @returns {[boolean, string[]]}  [isValid, issues]
   */
  validateAnalysis(result) {
    const issues = [];
    const questions = result.questions || [];

    if (questions.length === 0) {
      return [false, ["No questions returned in analysis result"]];
    }

    questions.forEach((q, idx) => {
      const id = q.id != null ? q.id : idx + 1;

      // Explanation must be substantive
      const explanation = q.detailed_explanation || "";
      if (explanation.length < 50) {
        issues.push(
          `Q${id}: detailed_explanation too short (${explanation.length} chars, need 50+)`
        );
      }

      // Rewrite must actually differ from original (for biased questions)
      const original  = (q.original  || "").toLowerCase();
      const rewritten = (q.rewritten || "").toLowerCase();
      const biasScore = Number(q.bias_score) || 0;

      if (biasScore > 30) {
        const similarity = this._similarity(original, rewritten);
        if (similarity > 0.7) {
          issues.push(
            `Q${id}: rewrite too similar to original (${Math.round(similarity * 100)}% overlap)`
          );
        }

        // Rewrite must exist for biased questions
        if (!rewritten || rewritten.length < 10) {
          issues.push(`Q${id}: missing rewrite for biased question (score ${biasScore})`);
        }
      }

      // Legal risk must cite specific legislation for highly biased questions
      if (biasScore > 60) {
        const legal = (q.legal_risk || "").toLowerCase();
        if (!legal || legal === "employment law" || legal === "null" || legal === "n/a") {
          issues.push(`Q${id}: legal_risk must cite specific legislation (e.g. "Maternity Benefits Act 1961"), not "${legal}"`);
        }
      }

      // Verdict must be set
      if (!q.verdict) {
        issues.push(`Q${id}: missing verdict field`);
      }
    });

    // Check hiring_health_report exists (structure check only)
    if (!result.hiring_health_report) {
      issues.push("Missing hiring_health_report in response");
    }

    return [issues.length === 0, issues];
  }

  /**
   * Validate a kit result from the master kit prompt.
   *
   * @param {object} kit  - Parsed JSON from AI
   * @returns {[boolean, string[]]}  [isValid, issues]
   */
  validateKit(kit) {
    const issues = [];
    const questions = kit.questions || [];

    if (questions.length === 0) {
      return [false, ["No questions generated in kit"]];
    }

    // Track competency+type combinations to detect duplicates
    const competenciesSeen = {};

    // Generic question phrases that indicate a poor-quality output
    const GENERIC_PHRASES = [
      "tell me about yourself",
      "where do you see yourself in",
      "what are your strengths",
      "what are your weaknesses",
      "why do you want to work here",
    ];

    // Banned structural patterns from Mad Libs-style templates
    const BANNED_PATTERNS = [
      "explain your specific methodology regarding",
      "give a recent example.",
      "specifically in the context of being",
    ];

    const REQUIRED_SCORING_LEVELS = [
      "4_exceptional",
      "3_strong",
      "2_adequate",
      "1_poor",
    ];

    questions.forEach((q) => {
      const qid = q.id != null ? q.id : "?";

      // Must have 2 follow-up probes
      const probes = q.follow_up_probes || [];
      if (probes.length < 2) {
        issues.push(`Q${qid}: needs exactly 2 follow_up_probes (has ${probes.length})`);
      }

      // Must have complete 4-level scoring guide
      const scoring = q.scoring_guide || {};
      REQUIRED_SCORING_LEVELS.forEach((level) => {
        if (!scoring[level] || scoring[level].length < 20) {
          issues.push(`Q${qid}: scoring_guide.${level} missing or too short`);
        }
      });

      // Must not be a generic question
      const questionText = (q.question || "").toLowerCase();
      if (questionText.length < 20) {
        issues.push(`Q${qid}: question text too short (${questionText.length} chars)`);
      }
      GENERIC_PHRASES.forEach((phrase) => {
        if (questionText.includes(phrase)) {
          issues.push(`Q${qid}: contains generic phrase not allowed: "${phrase}"`);
        }
      });

      // Must not contain banned Mad Libs patterns
      BANNED_PATTERNS.forEach((pattern) => {
        if (questionText.includes(pattern)) {
          issues.push(`Q${qid}: contains banned template pattern: "${pattern}"`);
        }
      });

      // why_asked must be meaningful
      const whyAsked = q.why_asked || "";
      if (whyAsked.length < 30) {
        issues.push(`Q${qid}: why_asked too generic or missing (${whyAsked.length} chars)`);
      }

      // Generated questions must themselves have zero bias
      const biasScore = Number(q.bias_score) || 0;
      if (biasScore > 15) {
        issues.push(`Q${qid}: generated question has bias_score ${biasScore} (must be ≤15)`);
      }

      // Competency + type must be unique across the kit
      const competency = (q.competency || "").trim();
      const type       = (q.type || "").trim();
      const key = `${competency}__${type}`;
      if (key !== "__" && competenciesSeen[key] != null) {
        issues.push(
          `Q${qid}: duplicate competency+type combination with Q${competenciesSeen[key]}`
        );
      }
      competenciesSeen[key] = qid;
    });

    // Scorecard weights must sum to 100 (±2 tolerance)
    const scorecard = kit.scorecard || {};
    if (scorecard.competencies && scorecard.competencies.length > 0) {
      const totalWeight = scorecard.competencies.reduce(
        (sum, c) => sum + (Number(c.weight) || 0),
        0
      );
      if (Math.abs(totalWeight - 100) > 2) {
        issues.push(
          `Scorecard competency weights sum to ${totalWeight}, must equal 100`
        );
      }
    }

    return [issues.length === 0, issues];
  }

  /**
   * Simple word-overlap Jaccard similarity between two strings.
   * @private
   */
  _similarity(text1, text2) {
    const words1 = new Set((text1 || "").split(/\s+/).filter(Boolean));
    const words2 = new Set((text2 || "").split(/\s+/).filter(Boolean));
    if (words1.size === 0 || words2.size === 0) return 0;

    let intersectionCount = 0;
    words1.forEach((w) => { if (words2.has(w)) intersectionCount++; });

    return intersectionCount / Math.max(words1.size, words2.size);
  }
}

module.exports = { OutputQualityGate };
