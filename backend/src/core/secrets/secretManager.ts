import 'server-only';
import { env, type Env } from '../config/env';

// ─── Types ───────────────────────────────────────────────────────────────────

type SecretKey = keyof Env;

// ─── Secret Manager ──────────────────────────────────────────────────────────

/**
 * Enterprise Secret Manager — Zero-Trust Edition
 *
 * THE ONLY place in the entire codebase allowed to access process.env.
 * No other file may directly read process.env.
 *
 * Guarantees:
 *   - Immutable secret store (Object.freeze)
 *   - Runtime-validated via Zod on import
 *   - Automatic masking for logs
 *   - Fail-fast startup (delegated to env.ts)
 *   - server-only: build fails if imported in any client component
 */
class SecretManager {
  private readonly _secrets: Readonly<Env>;

  constructor() {
    this._secrets = Object.freeze({ ...env });
  }

  /**
   * Get a validated, typed secret by key.
   * This is the only authorised access path.
   */
  get<K extends SecretKey>(key: K): Env[K] {
    return this._secrets[key];
  }

  /**
   * Returns a masked version of a secret safe for logging.
   * e.g. "gsk_abc123xyz" → "gsk_****3xyz"
   */
  mask(key: SecretKey): string {
    const value = String(this._secrets[key] ?? '');
    if (value.length === 0) return '<unset>';
    if (value.length <= 8) return '********';
    return `${value.slice(0, 4)}****${value.slice(-4)}`;
  }

  /**
   * Mask any arbitrary string — useful for sanitising log lines.
   */
  maskValue(value: string): string {
    if (!value || value.length <= 8) return '********';
    return `${value.slice(0, 4)}****${value.slice(-4)}`;
  }

  /** Environment awareness */
  isProduction(): boolean {
    return this._secrets.NODE_ENV === 'production';
  }

  isDevelopment(): boolean {
    return this._secrets.NODE_ENV === 'development';
  }

  /**
   * Returns the full 5-slot provider chain in priority order.
   * Used exclusively by ProviderRouter — no other caller needs this.
   */
  getProviderChain(): { name: string; key: string }[] {
    const s = this._secrets;
    const chain: { name: string; key: string }[] = [];

    // GROQ slots (priority 1-3)
    if (s.GROQ_API_KEY_PRIMARY)   chain.push({ name: 'GROQ_PRIMARY',   key: s.GROQ_API_KEY_PRIMARY });
    if (s.GROQ_API_KEY_SECONDARY) chain.push({ name: 'GROQ_SECONDARY', key: s.GROQ_API_KEY_SECONDARY });
    if (s.GROQ_API_KEY_TERTIARY)  chain.push({ name: 'GROQ_TERTIARY',  key: s.GROQ_API_KEY_TERTIARY });

    // GEMINI slots (priority 4-5)
    if (s.GEMINI_API_KEY_PRIMARY)   chain.push({ name: 'GEMINI_PRIMARY',   key: s.GEMINI_API_KEY_PRIMARY });
    if (s.GEMINI_API_KEY_SECONDARY) chain.push({ name: 'GEMINI_SECONDARY', key: s.GEMINI_API_KEY_SECONDARY });

    return chain;
  }

  /**
   * Get legacy Gemini keys (for backward compat with aiService.js).
   * Returns validated, non-empty keys only.
   */
  getLegacyGeminiKeys(): string[] {
    const s = this._secrets;
    return [
      s.GEMINI_API_KEY_PRIMARY,
      s.GEMINI_API_KEY_SECONDARY,
      s.GEMINI_API_KEY_1,
      s.GEMINI_API_KEY_2,
      s.GEMINI_API_KEY_3,
    ].filter((k): k is string => typeof k === 'string' && k.length > 0);
  }

  /**
   * Startup health check — logs masked key presence.
   * Call once from server.ts bootstrap.
   */
  logStartupSummary(): void {
    const chain = this.getProviderChain();
    console.log(`🔐 SecretManager initialised — ${chain.length} provider(s) active`);
    chain.forEach((p, i) => {
      console.log(`   [${i + 1}] ${p.name}: ${this.maskValue(p.key)}`);
    });
    if (this.isProduction()) {
      console.log('   🔒 Production mode — all secrets verified');
    }
  }
}

// ─── Singleton Export ─────────────────────────────────────────────────────────

export const secrets = new SecretManager();
export default secrets;
