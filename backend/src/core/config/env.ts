import { z } from 'zod';


// ─── Schema ───────────────────────────────────────────────────────────────────

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5001'),

  // ── Auth ──────────────────────────────────────────────────────────────────
  CLERK_SECRET_KEY: z.string().min(32, 'Clerk secret key must be at least 32 chars'),
  CLERK_PUBLISHABLE_KEY: z.string().min(10, 'Clerk publishable key is required'),

  // ── Database ──────────────────────────────────────────────────────────────
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(40, 'Supabase service role key is too short'),

  // ── AI Providers — 5-slot fallback chain (GROQ x3, GEMINI x2) ────────────
  // At least one Groq key is required
  GROQ_API_KEY_PRIMARY: z.string().startsWith('gsk_', 'Must be a valid Groq key (gsk_...)'),
  GROQ_API_KEY_SECONDARY: z.string().startsWith('gsk_').optional(),
  GROQ_API_KEY_TERTIARY: z.string().startsWith('gsk_').optional(),

  // At least one Gemini key is required
  GEMINI_API_KEY_PRIMARY: z.string().min(20, 'GEMINI_API_KEY_PRIMARY is required'),
  GEMINI_API_KEY_SECONDARY: z.string().min(20).optional(),

  // ── Legacy aliases (kept for aiService.js backward compat) ───────────────
  // These are read-through aliases — map to primary keys in secretManager
  GROQ_API_KEY: z.string().startsWith('gsk_').optional(),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_API_KEY_1: z.string().optional(),
  GEMINI_API_KEY_2: z.string().optional(),
  GEMINI_API_KEY_3: z.string().optional(),
  GEMINI_API_KEY_TERTIARY: z.string().optional(),
  OPENAI_API_KEY: z.string().startsWith('sk-').optional(),
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-').optional(),

  // ── Payments ──────────────────────────────────────────────────────────────
  RAZORPAY_KEY_ID: z.string().startsWith('rzp_', 'Must be a valid Razorpay key'),
  RAZORPAY_KEY_SECRET: z.string().min(16, 'Razorpay secret is too short'),

  // ── URLs ──────────────────────────────────────────────────────────────────
  FRONTEND_URL: z.string().url('FRONTEND_URL must be a valid URL').refine(
    (url) => {
      if (process.env['NODE_ENV'] === 'production' && url.includes('localhost')) return false;
      return true;
    },
    'Localhost URLs are not allowed in production'
  ),

  // ── Internal Secrets ──────────────────────────────────────────────────────
  CRON_SECRET: z.string().min(16, 'CRON_SECRET must be at least 16 characters'),
});

export type Env = z.infer<typeof envSchema>;

// ─── Parse & Fail-Fast ───────────────────────────────────────────────────────

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('\n❌ FATAL: Invalid environment configuration. Server cannot start.\n');
  console.error('Missing or invalid variables:');
  const formatted = result.error.format();
  Object.entries(formatted).forEach(([key, val]) => {
    if (key === '_errors') return;
    const errs = (val as any)?._errors ?? [];
    if (errs.length > 0) {
      console.error(`  ✗ ${key}: ${errs.join(', ')}`);
    }
  });
  console.error('\nCheck your .env file or deployment environment variables.\n');
  process.exit(1);
}

export const env = result.data;
