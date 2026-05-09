const express = require("express");
const router  = express.Router();
const { getBiasDna } = require("../controllers/biasDnaController");
const { requireAuth, authErrorHandler } = require("../middleware/auth");

router.get("/", requireAuth, getBiasDna, authErrorHandler);

module.exports = router;
