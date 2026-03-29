const { ClerkExpressRequireAuth } = require("@clerk/clerk-sdk-node");

const requireAuth = ClerkExpressRequireAuth();

const authErrorHandler = (err, req, res, next) => {
  if (err.message === "Unauthenticated") {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next(err);
};

module.exports = { requireAuth, authErrorHandler };
