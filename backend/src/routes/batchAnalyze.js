const express = require("express");
const router  = express.Router();
const { batchAnalyze } = require("../controllers/batchAnalyzeController");
const { requireAuth, authErrorHandler } = require("../middleware/auth");

router.post("/", requireAuth, batchAnalyze, authErrorHandler);

module.exports = router;
