// ─── Load .env FIRST — must be before any import that reads process.env ────────────
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env } from './core/config/env';
import { secrets } from './core/secrets/secretManager';
import aiRouter from './routes/ai';

// ─── Crash protection — log uncaught errors without exposing internals ────────
process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught Exception — restarting:', err.message);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('[FATAL] Unhandled Rejection:', reason instanceof Error ? reason.message : String(reason));
  process.exit(1);
});

// ─── Boot ─────────────────────────────────────────────────────────────────────
secrets.logStartupSummary();

const app = express();

// ─── Proxy trust — REQUIRED for Railway / any reverse-proxy deployment ────────
// Tells Express to trust the first hop's X-Forwarded-For header.
// Without this, express-rate-limit v7+ throws ERR_ERL_UNEXPECTED_X_FORWARDED_FOR
// and Clerk cannot verify the client IP, causing 401 Unauthenticated errors.
app.set('trust proxy', 1);

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [env.FRONTEND_URL, 'http://localhost:3000'].filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (server-to-server, curl)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('CORS: origin not allowed'));
  },
  methods: ['GET', 'POST', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));

// ─── Global rate limiter ──────────────────────────────────────────────────────
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  // Disable strict X-Forwarded-For validation — trust proxy (above) handles it
  validate: { xForwardedForHeader: false },
  message: { error: 'Too many requests. Please try again later.' },
}));

// ─── Dedicated AI rate limiter (tighter) ─────────────────────────────────────
const aiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: { error: 'AI generation limit reached. Please wait 1 minute.' },
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── AI Gateway Routes (TypeScript) ──────────────────────────────────────────
app.use('/api/ai', aiRateLimit, aiRouter);

// ─── Legacy Routes (JS controllers) ──────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { moderationMiddleware } = require('./middleware/moderationMiddleware');

app.use('/api/analyze',            moderationMiddleware, aiRateLimit, require('./routes/analyze'));
app.use('/api/analyze/batch',      moderationMiddleware, aiRateLimit, require('./routes/batchAnalyze'));
app.use('/api/generate-kit',       moderationMiddleware, aiRateLimit, require('./routes/generateKit'));
app.use('/api/reports',            require('./routes/reports'));
app.use('/api/payments',           require('./routes/payments'));
app.use('/api/subscriptions',      require('./routes/subscriptions'));
app.use('/api/evaluate-candidate', moderationMiddleware, aiRateLimit, require('./routes/evaluate'));
app.use('/api/analyze/jd',         moderationMiddleware, aiRateLimit, require('./routes/jdAnalyzer'));
app.use('/api/generate-jd',        moderationMiddleware, aiRateLimit, require('./routes/jdGenerator'));

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ─── Global error handler — NEVER expose internals to client ─────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // Log the real error server-side only
  console.error('[ERROR]', err.message);

  // Safe CORS error
  if (err.message.startsWith('CORS:')) {
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }

  // Never leak stack traces, provider names, or SDK errors
  res.status(500).json({
    success: false,
    error: 'AI temporarily unavailable. Please try again.',
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = parseInt(env.PORT, 10) || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Rifair backend running on port ${PORT} [${env.NODE_ENV}]`);
});
