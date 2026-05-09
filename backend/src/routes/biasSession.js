const express = require("express");
const router  = express.Router();
const { getBiasSession } = require("../controllers/biasSessionController");
const { requireAuth, authErrorHandler } = require("../middleware/auth");

router.get("/", requireAuth, getBiasSession, authErrorHandler);

module.exports = router;
