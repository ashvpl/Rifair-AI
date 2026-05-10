const { ClerkExpressWithAuth } = require("@clerk/clerk-sdk-node");

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

console.log(`[AUTH] Initializing Clerk WithAuth Middleware`);
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
 */
const requireAuth = (req, res, next) => {
  withAuth(req, res, (err) => {
    if (err) {
      console.error("[AUTH DEBUG] Clerk internal error:", err);
      return res.status(401).json({ error: "Authentication Service Error", details: err.message });
    }

    const auth = req.auth;
    const authHeader = req.headers.authorization;

    if (!auth || !auth.userId) {
      console.error(`[AUTH DEBUG] Rejection on ${req.method} ${req.originalUrl}`);
      console.log(`[AUTH DEBUG] Auth Header Present: ${!!authHeader}`);
      
      if (authHeader) {
        console.error("[AUTH DEBUG] Token present but verification failed. Possible reasons:");
        console.error("  1. Secret Key mismatch (Frontend/Backend Clerk instance mismatch)");
        console.error("  2. Token expired (Check server clock)");
        console.error("  3. Token malformed or wrong audience");
      } else {
        console.error("[AUTH DEBUG] Missing Authorization header");
      }

      return res.status(401).json({ 
        error: "Unauthenticated",
        details: "Your session could not be verified. Please sign in again.",
        code: "CLERK_UNAUTHENTICATED"
      });
    }

    // Success
    console.log(`[AUTH DEBUG] Success: User ${auth.userId} authenticated for ${req.originalUrl}`);
    
    // Log custom claims from the 'backend' template if present
    if (auth.claims) {
      const { email, first_name, last_name } = auth.claims;
      if (email || first_name || last_name) {
        console.log(`[AUTH DEBUG] Template 'backend' detected. Identity: ${first_name || ''} ${last_name || ''} <${email || 'no-email'}>`);
      }
    }

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
