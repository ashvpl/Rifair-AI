const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscriptionController");
const { requireAuth, authErrorHandler } = require("../middleware/auth");

router.get("/", requireAuth, subscriptionController.getDetails, authErrorHandler);
router.post("/cancel", requireAuth, subscriptionController.cancel, authErrorHandler);

module.exports = router;
