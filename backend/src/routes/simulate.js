const express = require("express");
const router = express.Router();
const { simulate } = require("../controllers/simulateController");
const { requireAuth, authErrorHandler } = require("../middleware/auth");

router.post("/", requireAuth, simulate, authErrorHandler);

module.exports = router;
