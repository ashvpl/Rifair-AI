/**
 * aiPipeline.js
 *
 * AIGenerationPipeline — wraps AI calls with quality gating and auto-retry.
 * Also contains:
 *   - _parseJson()             robust JSON parser for AI output quirks
 *   - _applyPlanGates()        strips premium fields for lower-tier plans
 *   - _applyKitPlanGates()     same for kit results
 */

"use strict";

const { OutputQualityGate } = require("./outputValidator");

const MAX_RETRIES = 2;

class AIGenerationPipeline {
  /**
   * @param {Function} generateFn  - async fn(prompt, options) → raw string
   */
  constructor(generateFn) {
    this.generate  = generateFn;
    this.validator = new OutputQualityGate();
  }

  // ─── Analysis ──────────────────────────────────────────────────────────────

  /**
   * Generate and validate an analysis result.
   *
   * @param {string}   prompt   - Full analysis prompt (already built)
   * @param {string}   planId   - User plan: "free"|"starter"|"growth"|"enterprise"
   * @param {object}   options  - Model options { temperature, maxTokens }
   * @returns {object}          - Validated (and plan-gated) analysis result
   */
  async generateAnalysis(prompt, planId = "free", options = {}) {
    const temperature = options.temperature ?? 0.1;
    const maxTokens   = options.maxTokens   ?? 4000;

    let currentPrompt = prompt;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      let raw;
      try {
        raw = await this.generate(currentPrompt, { temperature, maxTokens });
      } catch (err) {
        if (attempt === MAX_RETRIES) throw err;
        continue;
      }

      let result;
      try {
        result = this._parseJson(raw);
      } catch (parseErr) {
        if (attempt === MAX_RETRIES) {
          throw new Error(`JSON parse failed after ${MAX_RETRIES + 1} attempts: ${parseErr.message}`);
        }
        // Bad JSON — retry with explicit instruction
        currentPrompt = prompt +
          `\n\nPREVIOUS RESPONSE WAS NOT VALID JSON. Return ONLY a raw JSON object with no markdown fences or extra text.`;
        continue;
      }

      const [isValid, issues] = this.validator.validateAnalysis(result);

      if (isValid) {
        return this._applyPlanGates(result, planId);
      }

      if (attempt < MAX_RETRIES) {
        console.warn(`[PIPELINE] Analysis quality issues (attempt ${attempt + 1}):`, issues);
        currentPrompt = prompt +
          `\n\nPREVIOUS ATTEMPT HAD THESE QUALITY ISSUES — FIX ALL OF THEM:\n` +
          issues.map((i) => `- ${i}`).join("\n") +
          `\n\nRegenerate with ALL issues fixed. Return ONLY valid JSON.`;
        continue;
      }

      // Max retries hit — return best effort with quality warning
      console.warn(`[PIPELINE] Analysis quality gate failed after ${MAX_RETRIES + 1} attempts. Serving with warning.`);
      result.quality_warning = issues;
      return this._applyPlanGates(result, planId);
    }
  }

  // ─── Kit ───────────────────────────────────────────────────────────────────

  /**
   * Generate and validate a kit result.
   *
   * @param {string}   prompt   - Full kit prompt (already built)
   * @param {string}   planId   - User plan
   * @param {object}   options  - Model options { temperature, maxTokens }
   * @returns {object}          - Validated (and plan-gated) kit
   */
  async generateKit(prompt, planId = "free", options = {}) {
    const temperature = options.temperature ?? 0.3;
    const maxTokens   = options.maxTokens   ?? 6000;

    let currentPrompt = prompt;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      let raw;
      try {
        raw = await this.generate(currentPrompt, { temperature, maxTokens });
      } catch (err) {
        if (attempt === MAX_RETRIES) throw err;
        continue;
      }

      let kit;
      try {
        kit = this._parseJson(raw);
      } catch (parseErr) {
        if (attempt === MAX_RETRIES) {
          throw new Error(`Kit JSON parse failed after ${MAX_RETRIES + 1} attempts: ${parseErr.message}`);
        }
        currentPrompt = prompt +
          `\n\nPREVIOUS RESPONSE WAS NOT VALID JSON. Return ONLY a raw JSON object with no markdown fences or extra text.`;
        continue;
      }

      const [isValid, issues] = this.validator.validateKit(kit);

      if (isValid) {
        return this._applyKitPlanGates(kit, planId);
      }

      if (attempt < MAX_RETRIES) {
        console.warn(`[PIPELINE] Kit quality issues (attempt ${attempt + 1}):`, issues);
        currentPrompt = prompt +
          `\n\nQUALITY ISSUES TO FIX IN THIS REGENERATION:\n` +
          issues.map((i) => `- ${i}`).join("\n") +
          `\n\nFix ALL issues above. Pay special attention to:
- Every question needs exactly 2 follow_up_probes
- Every question needs a complete 4-level scoring_guide
- No generic questions allowed
- All scorecard weights must sum to 100
Return ONLY valid JSON.`;
        continue;
      }

      console.warn(`[PIPELINE] Kit quality gate failed after ${MAX_RETRIES + 1} attempts. Serving with warning.`);
      kit.quality_warning = issues;
      return this._applyKitPlanGates(kit, planId);
    }
  }

  // ─── Plan Gating ───────────────────────────────────────────────────────────

  _applyPlanGates(result, planId) {
    const isPaid   = ["starter", "growth", "enterprise"].includes(planId);
    const isGrowth = ["growth", "enterprise"].includes(planId);

    const clone = JSON.parse(JSON.stringify(result)); // deep copy

    (clone.questions || []).forEach((q) => {
      if (!isPaid) {
        q.detailed_explanation  = null;
        q.legal_risk            = null;
        q.psychological_impact  = null;
        q.india_specific_flags  = null;
      }
      if (!isGrowth) {
        q.competency_being_assessed = null;
      }
    });

    if (!isGrowth) {
      clone.hiring_health_report = null;
    }

    return clone;
  }

  _applyKitPlanGates(kit, planId) {
    const isPaid   = ["starter", "growth", "enterprise"].includes(planId);
    const isGrowth = ["growth", "enterprise"].includes(planId);

    const clone = JSON.parse(JSON.stringify(kit)); // deep copy

    (clone.questions || []).forEach((q) => {
      if (!isPaid) {
        q.why_asked             = null;
        q.what_good_looks_like  = null;
        q.what_poor_looks_like  = null;
      }
      if (!isGrowth) {
        q.scoring_guide    = null;
        q.follow_up_probes = null;
      }
    });

    if (!isGrowth) {
      clone.scorecard               = null;
      clone.interviewer_instructions = null;
    }

    return clone;
  }

  // ─── JSON Parser ───────────────────────────────────────────────────────────

  /**
   * Robust JSON parser that handles common AI output quirks.
   * @private
   */
  _parseJson(rawResponse) {
    let text = (rawResponse || "").trim();

    // Strip markdown code fences
    if (text.includes("```json")) {
      text = text.split("```json")[1].split("```")[0];
    } else if (text.includes("```")) {
      // handle ```\n{...}\n```
      const parts = text.split("```");
      // Take the part most likely to be JSON (longest segment between fences)
      text = parts.reduce((a, b) => (b.length > a.length ? b : a), "");
    }

    // Strip any text before the first { and after the last }
    const start = text.indexOf("{");
    const end   = text.lastIndexOf("}") + 1;
    if (start !== -1 && end > start) {
      text = text.slice(start, end);
    }

    try {
      return JSON.parse(text);
    } catch {
      // Fix trailing commas (common AI mistake)
      const fixed = text
        .replace(/,\s*}/g, "}")
        .replace(/,\s*]/g, "]");
      return JSON.parse(fixed);
    }
  }
}

module.exports = { AIGenerationPipeline };
