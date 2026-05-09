const { ClerkExpressRequireAuth } = require("@clerk/clerk-sdk-node");

const requireAuth = ClerkExpressRequireAuth();

const authErrorHandler = (err, req, res, next) => {
  if (err.message === "Unauthenticated") {
    console.error("Auth Middleware Rejected Request:", err);
    return res.status(401).json({ error: "Backend Auth Middleware: Unauthorized" });
  }
  next(err);
};

module.exports = { requireAuth, authErrorHandler };
