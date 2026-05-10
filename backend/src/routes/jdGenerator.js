const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const { generateJd } = require("../controllers/jdGeneratorController");

router.post("/", requireAuth, generateJd);

module.exports = router;
