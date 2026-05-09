import 'server-only';
import { secrets } from '../../secrets/secretManager';
import { providerHealth } from '../health/providerHealth';
import { AI_ERRORS } from '../../../constants/errors';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AICallOptions {
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
  timeoutMs?: number;
}

export interface ProviderSlot {
  name: string;
  key: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_TIMEOUT_MS = 15_000;

/** Cooldown durations after failure types */
const COOLDOWNS = {
  RATE_LIMIT:  60_000,       // 1 min — wait for quota window reset
  AUTH_ERROR:  86_400_000,   // 24 h  — invalid key, rotate immediately
  TIMEOUT:     20_000,       // 20 s  — transient, short cooldown
  GENERIC:     30_000,       // 30 s  — transient error
} as const;

// ─── Request with AbortController timeout ────────────────────────────────────

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err: unknown) {
    clearTimeout(timer);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('PROVIDER_TIMEOUT');
    }
    throw err;
  }
}

// ─── Provider Callers ────────────────────────────────────────────────────────

async function callGroq(
  key: string,
  prompt: string,
  temp: number,
  tokens: number,
  json: boolean,
  timeoutMs: number
): Promise<string> {
  const res = await fetchWithTimeout(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: temp,
        max_tokens: tokens,
        ...(json ? { response_format: { type: 'json_object' } } : {}),
      }),
    },
    timeoutMs
  );

  if (!res.ok) {
    const body = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status}: ${body}`);
  }

  const data = await res.json() as { choices: { message: { content: string } }[] };
  return data.choices[0].message.content;
}

async function callGemini(
  key: string,
  prompt: string,
  temp: number,
  tokens: number,
  json: boolean,
  timeoutMs: number
): Promise<string> {
  const res = await fetchWithTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: temp,
          maxOutputTokens: tokens,
          ...(json ? { responseMimeType: 'application/json' } : { responseMimeType: 'text/plain' }),
        },
      }),
    },
    timeoutMs
  );

  if (!res.ok) {
    const body = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status}: ${body}`);
  }

  const data = await res.json() as {
    candidates: { content: { parts: { text: string }[] } }[];
  };
  return data.candidates[0].content.parts[0].text;
}

// ─── Error → Cooldown Classifier ─────────────────────────────────────────────

function classifyError(err: Error): {
  code: string;
  cooldownMs: number;
  isTimeout: boolean;
} {
  const msg = err.message ?? '';

  if (msg === 'PROVIDER_TIMEOUT' || msg.toLowerCase().includes('timed out')) {
    return { code: AI_ERRORS.PROVIDER_TIMEOUT, cooldownMs: COOLDOWNS.TIMEOUT, isTimeout: true };
  }
  if (msg.startsWith('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('limit')) {
    return { code: AI_ERRORS.RATE_LIMITED, cooldownMs: COOLDOWNS.RATE_LIMIT, isTimeout: false };
  }
  if (msg.startsWith('401') || msg.startsWith('403')) {
    return { code: AI_ERRORS.AI_UNAVAILABLE, cooldownMs: COOLDOWNS.AUTH_ERROR, isTimeout: false };
  }
  return { code: AI_ERRORS.AI_UNAVAILABLE, cooldownMs: COOLDOWNS.GENERIC, isTimeout: false };
}

// ─── Provider Router ─────────────────────────────────────────────────────────

/**
 * Provider Router — Core of the AI Gateway
 *
 * Attempts providers in exact priority order:
 *   1. GROQ_PRIMARY
 *   2. GROQ_SECONDARY
 *   3. GROQ_TERTIARY
 *   4. GEMINI_PRIMARY
 *   5. GEMINI_SECONDARY
 *
 * Features:
 *   - AbortController timeout on every request
 *   - Per-provider health tracking
 *   - Cooldown-based circuit breaking
 *   - Rate-limit detection and backoff
 *   - Auth error → 24h block
 *   - Safe error codes only — never exposes provider internals
 */
export class ProviderRouter {
  /**
   * Execute a prompt through the provider chain.
   * Throws AI_ERRORS.AI_UNAVAILABLE if all providers fail.
   */
  static async call(prompt: string, options: AICallOptions = {}): Promise<string> {
    const temperature = options.temperature ?? 0.3;
    const maxTokens   = options.maxTokens   ?? 6000;
    const jsonMode    = options.jsonMode     ?? false;
    const timeoutMs   = options.timeoutMs    ?? DEFAULT_TIMEOUT_MS;

    const chain = secrets.getProviderChain();

    if (chain.length === 0) {
      throw new Error(AI_ERRORS.AI_UNAVAILABLE);
    }

    for (const slot of chain) {
      // Skip blocked providers
      if (providerHealth.isBlocked(slot.name)) {
        continue;
      }

      const start = Date.now();

      try {
        let result: string;

        if (slot.name.startsWith('GROQ')) {
          result = await callGroq(slot.key, prompt, temperature, maxTokens, jsonMode, timeoutMs);
        } else if (slot.name.startsWith('GEMINI')) {
          result = await callGemini(slot.key, prompt, temperature, maxTokens, jsonMode, timeoutMs);
        } else {
          // Unknown provider type — skip
          continue;
        }

        providerHealth.recordSuccess(slot.name, Date.now() - start);
        return result;

      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        const { cooldownMs, isTimeout } = classifyError(error);

        if (isTimeout) {
          providerHealth.recordTimeout(slot.name);
        } else if (error.message.startsWith('429') || error.message.includes('quota')) {
          providerHealth.recordRateLimit(slot.name);
        } else {
          providerHealth.recordFailure(slot.name);
        }

        providerHealth.block(slot.name, cooldownMs);

        // Log masked — never log the error message raw (may contain key hints)
        console.error(`[ProviderRouter] ${slot.name} failed — blocked for ${cooldownMs / 1000}s`);
      }
    }

    // All providers exhausted
    throw new Error(AI_ERRORS.AI_UNAVAILABLE);
  }

  /** Returns the current health summary (safe for internal monitoring) */
  static getHealthSummary(): Record<string, object> {
    return providerHealth.getSummary();
  }
}

export default ProviderRouter;
