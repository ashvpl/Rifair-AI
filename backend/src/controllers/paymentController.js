const paymentService = require("../services/paymentService");
const subscriptionService = require("../services/subscriptionService");
const { PLANS } = require("../config/plans");
const { secrets } = require("../core/secrets/secretManager");

async function createOrder(req, res) {
  try {
    const userId = req.auth?.userId || req.auth?.claims?.sub;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    
    const { planId, billingCycle, currency = "inr" } = req.body;

    const plan = PLANS[planId];
    if (!plan) return res.status(400).json({ error: "Invalid plan" });

    // --- ADMIN SECURITY CHECK ---
    if (plan.internal) {
      const isUserAdmin = await subscriptionService.isAdminUser(userId);
      if (!isUserAdmin) {
        console.warn(`[SECURITY] Unauthorized attempt to access internal plan ${planId} by user ${userId}`);
        return res.status(403).json({ error: "Forbidden: Admin access required for this plan" });
      }
    }

    // Resolve the correct currency prices
    const currencyKey = currency === "usd" ? "usd" : "inr";
    const prices = plan[currencyKey];
    if (!prices) return res.status(400).json({ error: "Invalid currency" });

    // Razorpay expects amount in smallest unit (paise for INR, cents for USD)
    const unitPrice = billingCycle === "annual" ? prices.annual : prices.monthly;
    const amount = billingCycle === "annual"
      ? unitPrice * 12 * 100
      : unitPrice * 100;

    const razorpayCurrency = currencyKey === "usd" ? "USD" : "INR";

    const shortUserId = userId.replace("user_", "").substring(0, 8);
    const receipt = `rcpt_${shortUserId}_${Date.now()}`.substring(0, 40);

    const order = await paymentService.createOrder(
      amount,
      razorpayCurrency,
      receipt,
      { 
        userId, 
        planId, 
        billingCycle, 
        currency: razorpayCurrency,
        internal: plan.internal ? "true" : "false",
        testPlan: plan.testPlan ? "true" : "false"
      }
    );

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: secrets.get('RAZORPAY_KEY_ID'),
    });
  } catch (err) {
    console.error("Payment Order Error:", err);
    res.status(500).json({ error: err.error?.description || err.message || "Failed to create Razorpay order" });
  }
}

async function verifyPayment(req, res) {
  try {
    const userId = req.auth?.userId || req.auth?.claims?.sub;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
      billingCycle,
      currency = "inr"
    } = req.body;

    const isValid = paymentService.verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) return res.status(400).json({ error: "Invalid signature" });

    const plan = PLANS[planId];
    if (!plan) return res.status(400).json({ error: "Invalid plan" });

    // --- ADMIN SECURITY CHECK ---
    if (plan.internal) {
      const isUserAdmin = await subscriptionService.isAdminUser(userId);
      if (!isUserAdmin) {
        console.warn(`[SECURITY] Unauthorized attempt to verify internal plan ${planId} by user ${userId}`);
        return res.status(403).json({ error: "Forbidden: Admin access required" });
      }
    }

    if (plan.isAddon) {
      await subscriptionService.applyAddon(userId, plan);
    } else {
      // Activate subscription
      await subscriptionService.updateSubscription(userId, {
        planId,
        billingCycle,
      });
    }

    // Log payment
    const currencyKey = currency === "usd" ? "usd" : "inr";
    const prices = plan[currencyKey];
    const unitPrice = billingCycle === "annual" ? prices.annual : prices.monthly;
    const amount = billingCycle === "annual" ? unitPrice * 12 * 100 : unitPrice * 100;
    
    await subscriptionService.logPayment(userId, {
      planId,
      amount,
      currency: currencyKey === "usd" ? "usd" : "inr",
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      billingCycle,
      internal: plan.internal
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  createOrder,
  verifyPayment,
};
