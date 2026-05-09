const express = require("express");
const router  = express.Router();
const { analyzeJd } = require("../controllers/jdAnalyzerController");
const { requireAuth, authErrorHandler } = require("../middleware/auth");

router.post("/", requireAuth, analyzeJd, authErrorHandler);

module.exports = router;
