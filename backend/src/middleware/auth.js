const { ClerkExpressRequireAuth } = require("@clerk/clerk-sdk-node");

// Wrapper to log incoming headers before Clerk processes them
const logAuthHeaders = (req, res, next) => {
  console.log(`[AUTH DEBUG] Request to ${req.originalUrl}`);
  console.log(`[AUTH DEBUG] Authorization header: ${req.headers.authorization ? 'Present (length: ' + req.headers.authorization.length + ')' : 'MISSING'}`);
  if (req.headers.authorization) {
    console.log(`[AUTH DEBUG] Header prefix: ${req.headers.authorization.substring(0, 15)}...`);
  }
  next();
};

const requireAuth = ClerkExpressRequireAuth();

const authErrorHandler = (err, req, res, next) => {
  if (err.message === "Unauthenticated") {
    console.error("Auth Middleware Rejected Request:", err);
    return res.status(401).json({ error: "Backend Auth Middleware: Unauthorized" });
  }
  next(err);
};

module.exports = { 
  requireAuth: [logAuthHeaders, requireAuth], 
  authErrorHandler 
};
