/**
 * lib/intelligence/personalisation-engine.ts
 *
 * Layer 3 — Personalisation Engine.
 *
 * Reads the user_intelligence profile and returns a compact set of
 * prompt adjustments. These are forwarded to the Express backend
 * via the X-Personalisation header and silently appended to the AI prompt.
 *
 * Server-side only — called from Next.js API route handlers.
 */

import { supabaseAdmin } from '@/lib/supabase-admin'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PromptAdjustments {
  explanation_depth?:     string
  explanation_instruction?: string
  bias_focus?:            string
  industry_context?:      string
  role_context?:          string
  experience_context?:    string
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Fetches the user's intelligence profile and derives prompt adjustments.
 * Returns an empty object if no profile exists yet (new users).
 * Never throws — falls back to {} on any error.
 */
export async function getPersonalisedPromptAdjustments(
  userId: string
): Promise<PromptAdjustments> {
  if (!userId) return {}

  try {
    const { data: profile, error } = await supabaseAdmin
      .from('user_intelligence')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error || !profile) return {}

    const adjustments: PromptAdjustments = {}

    // ── Explanation depth ─────────────────────────────────────────────────
    if (profile.prefers_detailed_explanations) {
      adjustments.explanation_depth = 'comprehensive'
      adjustments.explanation_instruction =
        'This user consistently expands explanations and spends significant time reading them. ' +
        'Provide thorough, detailed explanations with concrete examples.'
    } else if (profile.total_sessions > 2) {
      // Only apply concise preference once we have enough signal
      adjustments.explanation_depth = 'concise'
      adjustments.explanation_instruction =
        'This user prefers quick, actionable insights. ' +
        'Keep explanations under 2 sentences. Lead with the most important point.'
    }

    // ── Dominant bias type context ────────────────────────────────────────
    const topBias = (profile.most_common_bias_types as string[])?.[0]
    if (topBias) {
      adjustments.bias_focus =
        `This user's questions frequently contain ${topBias.replace('_', ' ')} bias. ` +
        `Be especially thorough in detecting and explaining this bias type. ` +
        `Their team may have an unconscious pattern of ${topBias.replace('_', ' ')} bias.`
    }

    // ── Industry expertise context ────────────────────────────────────────
    const topIndustry = (profile.dominant_industries as string[])?.[0]
    if (topIndustry && topIndustry !== 'general') {
      adjustments.industry_context =
        `This user consistently hires for ${topIndustry} roles. ` +
        `Use ${topIndustry} industry-specific examples and terminology in your explanations and rewrites.`
    }

    // ── Role expertise context ────────────────────────────────────────────
    const topRoles = (profile.dominant_role_types as string[])?.slice(0, 3)
    if (topRoles && topRoles.length > 0) {
      adjustments.role_context =
        `This user frequently interviews for: ${topRoles.join(', ')}. ` +
        `Tailor competency assessments and rewrites to these role contexts where relevant.`
    }

    // ── Experience level context ──────────────────────────────────────────
    if (profile.avg_experience_level) {
      adjustments.experience_context =
        `This user typically interviews ${profile.avg_experience_level} candidates. ` +
        `Calibrate question difficulty and expectations accordingly.`
    }

    return adjustments
  } catch (err) {
    console.error('[personalisation-engine] getPersonalisedPromptAdjustments failed:', err)
    return {}
  }
}

/**
 * Serialises adjustments to a compact JSON string safe to pass as an HTTP header.
 * Returns null if no adjustments to avoid unnecessary header overhead.
 */
export function serialiseAdjustments(adjustments: PromptAdjustments): string | null {
  if (Object.keys(adjustments).length === 0) return null
  try {
    return JSON.stringify(adjustments)
  } catch {
    return null
  }
}
