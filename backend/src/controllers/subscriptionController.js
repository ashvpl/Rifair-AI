const subscriptionService = require("../services/subscriptionService");
const { supabase } = require("../config/supabase");

async function getDetails(req, res) {
  try {
    const userId = req.auth?.userId || req.auth?.claims?.sub;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    
    if (typeof subscriptionService === 'undefined') {
       throw new Error("subscriptionService is not defined inside getDetails");
    }

    const subscription = await subscriptionService.getSubscription(userId);
    const usage = await subscriptionService.getUsage(userId);
    const payments = await subscriptionService.getPaymentHistory(userId);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const startOfMonthISO = startOfMonth.toISOString();

    // ── Dynamic Usage Computation ──────────────────────────────────────────
    // We compute usage dynamically from source-of-truth tables to avoid
    // discrepancies caused by failed manual increments or race conditions.
    
    let dynamicAnalysesUsed = usage?.analyses_used || 0;
    let dynamicKitsUsed = usage?.kits_used || 0;
    let dynamicJdUsed = usage?.jd_analyses_used || 0;
    let dynamicEvalsUsed = usage?.evaluations_used || 0;

    if (typeof supabase !== 'undefined') {
      try {
        // 1. Count Candidate Evaluations
        const { count: evalsCount, error: evalsError } = await supabase
          .from('candidate_evaluations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('created_at', startOfMonthISO);
        
        if (evalsError) {
          console.error(`[getDetails] Dynamic count evals error:`, evalsError);
        } else if (evalsCount !== null) {
          dynamicEvalsUsed = evalsCount;
        }

        // 2. Count Analysis Reports (Analyses, Kits, JD operations, Evaluations)
        const { data: reports, error: reportsError } = await supabase
          .from('analysis_reports')
          .select('categories')
          .eq('user_id', userId)
          .gte('created_at', startOfMonthISO);

        if (reportsError) {
          console.error(`[getDetails] Dynamic count reports error:`, reportsError);
        } else if (reports) {
          dynamicAnalysesUsed = reports.filter(r => 
            !r.categories?.analysis_type || r.categories?.analysis_type === 'analysis'
          ).length;

          dynamicKitsUsed = reports.filter(r => 
            r.categories?.analysis_type === 'kit'
          ).length;

          dynamicJdUsed = reports.filter(r => 
            r.categories?.analysis_type === 'jd_analysis' || 
            r.categories?.analysis_type === 'jd_generated'
          ).length;
          
          // Optionally also count evaluations from analysis_reports if candidate_evaluations query failed or returned 0
          const evaluationReportsCount = reports.filter(r => r.categories?.analysis_type === 'evaluation').length;
          if (evalsError || dynamicEvalsUsed === 0) {
             dynamicEvalsUsed = Math.max(dynamicEvalsUsed, evaluationReportsCount);
          }
        }

        console.log(`[getDetails] Dynamic counts for ${userId}: Analyses=${dynamicAnalysesUsed}, Kits=${dynamicKitsUsed}, JD=${dynamicJdUsed}, Evals=${dynamicEvalsUsed}`);
      } catch (countError) {
        console.error(`[getDetails] Dynamic count error:`, countError.message);
        // Fallback to static usage from the 'usage' table
      }
    }

    res.json({
      subscription: subscription ? {
        id: subscription.id,
        userId: subscription.user_id,
        plan_id: subscription.plan_id, // Legacy support
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
        analysesUsed: dynamicAnalysesUsed,
        kitsUsed: dynamicKitsUsed,
        jdAnalysesUsed: dynamicJdUsed,
        evaluationsUsed: dynamicEvalsUsed,
        apiCallsUsed: usage.api_calls_used,
        month: usage.month,
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
