const subscriptionService = require("../services/subscriptionService");
const usageService = require("../services/usageService");
const { resolveUsagePeriod } = require("../utils/usagePeriod");

async function getDetails(req, res) {
  try {
    const userId = req.auth?.userId || req.auth?.claims?.sub;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    
    const [subscription, usage, payments] = await Promise.all([
      subscriptionService.getSubscription(userId),
      usageService.getUsage(userId),
      subscriptionService.getPaymentHistory(userId)
    ]);

    const periodMeta = resolveUsagePeriod(subscription);
    const usageMeta = usage?._usageMeta || periodMeta;

    res.json({
      subscription: subscription ? {
        id: subscription.id,
        userId: subscription.user_id,
        plan_id: subscription.plan_id,
        planId: subscription.plan_id,
        status: subscription.status,
        billingCycle: subscription.billing_cycle,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        trialEndsAt: subscription.trial_ends_at,
        razorpaySubscriptionId: subscription.razorpay_subscription_id,
        cancelledAt: subscription.cancelled_at,
      } : null,
      usage: usage ? {
        analysesUsed: usage.analyses_used || 0,
        kitsUsed: usage.kits_used || 0,
        jdAnalysesUsed: usage.jd_analyses_used || 0,
        evaluationsUsed: usage.evaluations_used || 0,
        apiCallsUsed: usage.api_calls_used || 0,
        month: usage.month,
        periodKey: usageMeta.periodKey || usage.month,
        resetsAt: usageMeta.resetsAt || null,
        resetsOnUpgradeOnly: usageMeta.resetsOnUpgradeOnly ?? periodMeta.resetsOnUpgradeOnly,
        billingCycle: usageMeta.billingCycle || periodMeta.billingCycle,
      } : null,
      payments: (payments || []).map(p => ({
        id: p.id,
        planId: p.plan_id,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        paymentProvider: p.payment_provider,
        billingCycle: p.billing_cycle,
        createdAt: p.created_at,
      })),
    });
  } catch (err) {
    const fs = require("fs");
    const errorLog = `\n[${new Date().toISOString()}] SUBSCRIPTION ERROR: ${err.message}\nStack: ${err.stack}\n`;
    try { fs.appendFileSync("error_logs.txt", errorLog); } catch (e) {}
    console.error("SUBSCRIPTION ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}

async function cancel(req, res) {
  try {
    const userId = req.auth?.userId || req.auth?.claims?.sub;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    
    await subscriptionService.cancelSubscription(userId);
    res.json({ success: true });
  } catch (err) {
    const fs = require("fs");
    const errorLog = `\n[${new Date().toISOString()}] SUBSCRIPTION CANCEL ERROR: ${err.message}\nStack: ${err.stack}\n`;
    try { fs.appendFileSync("error_logs.txt", errorLog); } catch (e) {}
    console.error("SUBSCRIPTION CANCEL ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getDetails,
  cancel,
};
