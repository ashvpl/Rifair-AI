const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { requireAuth, authErrorHandler } = require("../middleware/auth");

// Public diagnostic endpoint to check pricing logic on the deployed server
router.get("/test-pricing", (req, res) => {
  const { PLANS } = require("../config/plans");
  const starter = PLANS.starter;
  const growth = PLANS.growth;
  
  // Calculate starter annual
  const starterUnitPrice = starter.inr.annual;
  let starterAmount = starterUnitPrice * 100;
  starterAmount = starterAmount * 12;

  // Calculate growth annual
  const growthUnitPrice = growth.inr.annual;
  let growthAmount = growthUnitPrice * 100;
  growthAmount = growthAmount * 12;

  res.json({
    message: "Rifair Backend Pricing Diagnostic",
    version: "1.0.1",
    starterAnnualInrPaise: starterAmount,
    growthAnnualInrPaise: growthAmount
  });
});

router.post("/create-order", requireAuth, paymentController.createOrder, authErrorHandler);
router.post("/verify", requireAuth, paymentController.verifyPayment, authErrorHandler);

module.exports = router;
