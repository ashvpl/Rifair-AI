const express = require("express");
const router = express.Router();
const { generateKit } = require("../controllers/kitController");
const { requireAuth, authErrorHandler } = require("../middleware/auth");

router.post("/", requireAuth, generateKit, authErrorHandler);

// Optional: redirect from /api/kit to /api/generate-kit if needed, 
// but since this is mounted at /generate-kit, the entry point will handle it.

module.exports = router;
