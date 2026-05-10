
import { secrets } from '../secrets/secretManager';

/**
 * ProviderRegistry — Legacy Adapter
 *
 * This file is kept for backward compatibility with any direct callers
 * that import `providerRegistry` or `AIProvider`.
 *
 * NEW CODE should use AIGateway directly:
 *   import { AIGateway } from '../core/ai/aiGateway';
 *
 * This registry now reads from the 5-slot provider chain defined
 * in SecretManager, which in turn reads from env.ts.
 */

export interface AIProvider {
  name: string;
  apiKey: string;
  priority: number;
  requestsThisMinute: number;
  lastMinuteReset: number;
  isBlocked: boolean;
  blockedUntil: number;
}

export const RATE_LIMITS: Record<string, number> = {
  GROQ_PRIMARY:     28,
  GROQ_SECONDARY:   28,
  GROQ_TERTIARY:    28,
  GEMINI_PRIMARY:   13,
  GEMINI_SECONDARY: 13,
  // Legacy names (backward compat)
  groq:     28,
  gemini_1: 13,
  gemini_2: 13,
  gemini_3: 13,
  openai:   50,
  claude:   50,
};

class ProviderRegistry {
  private providers: AIProvider[] = [];

  constructor() {
    const chain = secrets.getProviderChain();
    chain.forEach((slot, idx) => {
      this.providers.push({
        name:               slot.name,
        apiKey:             slot.key,
        priority:           idx + 1,
        requestsThisMinute: 0,
        lastMinuteReset:    Date.now(),
        isBlocked:          false,
        blockedUntil:       0,
      });
    });

    // Legacy openai / claude slots (optional)
    // Legacy openai / claude slots (optional)
    const openaiKey = secrets.get('OPENAI_API_KEY');
    const claudeKey = secrets.get('ANTHROPIC_API_KEY');

    if (openaiKey) {
      this.providers.push({
        name: 'openai', apiKey: openaiKey, priority: 6,
        requestsThisMinute: 0, lastMinuteReset: Date.now(),
        isBlocked: false, blockedUntil: 0,
      });
    }
    if (claudeKey) {
      this.providers.push({
        name: 'claude', apiKey: claudeKey, priority: 7,
        requestsThisMinute: 0, lastMinuteReset: Date.now(),
        isBlocked: false, blockedUntil: 0,
      });
    }
  }

  getNext(): AIProvider | null {
    const now = Date.now();
    const sorted = [...this.providers].sort((a, b) => a.priority - b.priority);

    for (const p of sorted) {
      if (p.isBlocked) {
        if (now > p.blockedUntil) {
          p.isBlocked = false;
          p.requestsThisMinute = 0;
        } else {
          continue;
        }
      }

      if (now - p.lastMinuteReset > 60_000) {
        p.requestsThisMinute = 0;
        p.lastMinuteReset = now;
      }

      const limit = RATE_LIMITS[p.name] ?? 10;
      if (p.requestsThisMinute >= limit) continue;

      return p;
    }
    return null;
  }

  block(provider: AIProvider, durationMs: number): void {
    provider.isBlocked = true;
    provider.blockedUntil = Date.now() + durationMs;
  }

  record(provider: AIProvider): void {
    provider.requestsThisMinute++;
  }

  getProviders(): AIProvider[] {
    return this.providers;
  }
}

export const providerRegistry = new ProviderRegistry();
