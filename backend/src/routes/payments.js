const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { requireAuth, authErrorHandler } = require("../middleware/auth");

router.post("/create-order", requireAuth, paymentController.createOrder, authErrorHandler);
router.post("/verify", requireAuth, paymentController.verifyPayment, authErrorHandler);

module.exports = router;
