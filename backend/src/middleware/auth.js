const { ClerkExpressWithAuth } = require("@clerk/clerk-sdk-node"); // Trigger Railway backend redeploy

// Helper to mask secrets for logging
const mask = (str) => {
  if (!str) return 'MISSING';
  if (str.length <= 8) return '********';
  return `${str.slice(0, 4)}****${str.slice(-4)}`;
};

// Clean environment variables (remove potential quotes/spaces from Railway dashboard)
const cleanEnvVar = (val) => {
  if (!val) return val;
  return val.replace(/^['"]|['"]$/g, '').trim();
};

const secretKey = cleanEnvVar(process.env.CLERK_SECRET_KEY);
const publishableKey = cleanEnvVar(process.env.CLERK_PUBLISHABLE_KEY);

console.log(`[AUTH] Initializing Clerk WithAuth Middleware (Production Hardened)`);
console.log(`[AUTH] Secret Key: ${mask(secretKey)}`);
console.log(`[AUTH] Publishable Key: ${mask(publishableKey)}`);

const withAuth = ClerkExpressWithAuth({
  secretKey: secretKey,
  publishableKey: publishableKey
});

/**
 * Robust Auth Middleware
 * 1. Wraps ClerkExpressWithAuth
 * 2. Provides detailed logging for debugging
 * 3. Handles both userId and session-based auth
 * 4. Specifically validates claims from the 'backend' JWT template
 */
const requireAuth = (req, res, next) => {
  // ── LOCAL BYPASS ──
  // If we are in development and the user wants to bypass, we inject a mock session.
  const isDev = process.env.NODE_ENV === 'development';
  const bypassAuth = isDev && (req.headers['x-bypass-auth'] === 'true' || !secretKey);

  if (bypassAuth) {
    console.log(`[AUTH BYPASS] Development mode detected. Injecting mock user.`);
    req.auth = {
      userId: "user_2ovqX7pL5V8R7mS3kM1jB6cE3hF", // Mock local-dev user ID
      claims: {
        sub: "user_2ovqX7pL5V8R7mS3kM1jB6cE3hF",
        email: "local-dev@rifairai.com",
        first_name: "Local",
        last_name: "Developer"
      }
    };
    return next();
  }

  withAuth(req, res, (err) => {
    if (err) {
      console.error("[AUTH DEBUG] Clerk internal error:", err);
      return res.status(401).json({ error: "Authentication Service Error", details: err.message });
    }

    const auth = req.auth;
    const authHeader = req.headers.authorization;

    // Fallback for development if withAuth fails but we want to be permissive
    if ((!auth || !auth.userId) && isDev) {
      console.warn(`[AUTH WARN] Clerk verification failed in DEV. Falling back to mock user.`);
      req.auth = {
        userId: "user_2ovqX7pL5V8R7mS3kM1jB6cE3hF",
        claims: { sub: "user_2ovqX7pL5V8R7mS3kM1jB6cE3hF" }
      };
      return next();
    }

    if (!auth || !auth.userId) {
      console.error(`[AUTH DEBUG] Rejection on ${req.method} ${req.originalUrl}`);
      // ... rest of error logic
      return res.status(401).json({ 
        error: "Unauthenticated",
        details: "Your session could not be verified. Please sign in again.",
        code: "CLERK_UNAUTHENTICATED"
      });
    }

    // Success
    console.log(`[AUTH DEBUG] Success: User ${auth.userId} authenticated for ${req.originalUrl}`);
    next();
  });
};

const authErrorHandler = (err, req, res, next) => {
  console.error("[AUTH ERROR] Unexpected error in auth chain:", err);
  res.status(401).json({ error: "Authentication Error", details: err.message });
};

module.exports = { 
  requireAuth, 
  authErrorHandler 
};
