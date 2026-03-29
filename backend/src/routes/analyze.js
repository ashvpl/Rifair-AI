const express = require("express");
const router = express.Router();
const { analyzeText } = require("../controllers/analyzeController");
const { requireAuth, authErrorHandler } = require("../middleware/auth");

router.post("/", requireAuth, analyzeText, authErrorHandler);

module.exports = router;
