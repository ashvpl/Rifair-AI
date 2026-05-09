const { supabase: supabaseAdmin } = require("../config/supabase");
const { secrets } = require("../core/secrets/secretManager");

// --- Admin Caching and User Verification ---
const adminUserIds = new Set();
const nonAdminUserIds = new Set();
const ADMIN_EMAILS = ["god95448@gmail.com"];

async function isAdminUser(userId) {
  if (!userId || userId === "anonymous") return false;
  
  if (adminUserIds.has(userId)) return true;
  if (nonAdminUserIds.has(userId)) return false;

  try {
    const clerk = require("@clerk/clerk-sdk-node");
    // Fallback to older clerk SDK properties if clerkClient is not available
    const clerkUsers = clerk.clerkClient ? clerk.clerkClient.users : clerk.users;
    
    if (!clerkUsers || typeof clerkUsers.getUser !== 'function') {
      console.warn("⚠️ Cannot resolve Clerk users API.");
      return false;
    }

    const user = await clerkUsers.getUser(userId);
    if (!user) return false;

    const userEmails = (user.emailAddresses || []).map(e => (e.emailAddress || "").toLowerCase());
    const isAdmin = userEmails.some(email => ADMIN_EMAILS.includes(email));

    if (isAdmin) {
      adminUserIds.add(userId);
      return true;
    } else {
      nonAdminUserIds.add(userId);
      return false;
    }
  } catch (error) {
    if (error.status !== 404) {
      console.error("Error fetching user from Clerk to check admin status:", error.message);
    }
    return false;
  }
}


/**
 * Get or create subscription for a user
 */
async function getSubscription(userId) {
  if (await isAdminUser(userId)) {
    return {
      user_id: userId,
      plan_id: "enterprise", // Admins get unlimited plan features
      status: "active",
      billing_cycle: "monthly",
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  let { data: subscription, error } = await supabaseAdmin
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code === "PGRST116") {
    // Auto-create free subscription if none exists
    const { data: newSub, error: insertError } = await supabaseAdmin
      .from("subscriptions")
      .upsert({
        user_id: userId,
        plan_id: "free",
        status: "active",
        billing_cycle: "monthly",
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString(),
      }, { onConflict: "user_id" })
      .select()
      .single();

    if (insertError) throw insertError;
    return newSub;
  }

  if (error) throw error;
  return subscription;
}

/**
 * Get or create usage for a user for current month
 */
async function getUsage(userId) {
  const currentMonth = new Date().toISOString().slice(0, 7);

  if (await isAdminUser(userId)) {
    return {
      user_id: userId,
      month: currentMonth,
      analyses_used: 0,
      kits_used: 0,
      jd_analyses_used: 0,
      evaluations_used: 0,
      api_calls_used: 0,
    };
  }

  let { data: usage, error } = await supabaseAdmin
    .from("usage")
    .select("*")
    .eq("user_id", userId)
    .eq("month", currentMonth)
    .single();

  if (!usage || (error && error.code === "PGRST116")) {
    const { data: newUsage, error: insertError } = await supabaseAdmin
      .from("usage")
      .upsert({
        user_id: userId,
        month: currentMonth,
        analyses_used: 0,
        kits_used: 0,
        jd_analyses_used: 0,
        evaluations_used: 0,
        api_calls_used: 0,
      }, { onConflict: "user_id,month" })
      .select()
      .single();

    if (insertError) {
      console.error("[getUsage] Upsert failed:", insertError.message);
      // Fallback to mock object if DB fails entirely
      return { analyses_used: 0, kits_used: 0, jd_analyses_used: 0, evaluations_used: 0, api_calls_used: 0 };
    }
    return newUsage;
  }

  if (error) {
    console.warn("[getUsage] Fetch error (non-404):", error.message);
    return { analyses_used: 0, kits_used: 0, jd_analyses_used: 0, evaluations_used: 0, api_calls_used: 0 };
  }

  return usage || { analyses_used: 0, kits_used: 0, jd_analyses_used: 0, evaluations_used: 0, api_calls_used: 0 };
}

/**
 * Update subscription after successful payment
 */
async function updateSubscription(userId, { planId, billingCycle, orderId, paymentId }) {
  const now = new Date();
  const periodEnd = new Date(now);
  if (billingCycle === "annual") {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  }

  const { data, error } = await supabaseAdmin
    .from("subscriptions")
    .upsert({
      user_id: userId,
      plan_id: planId,
      status: "active",
      billing_cycle: billingCycle,
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      cancelled_at: null,
      updated_at: now.toISOString(),
    }, { onConflict: "user_id" })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Log a payment record
 */
async function logPayment(userId, paymentData) {
  const { error } = await supabaseAdmin.from("payments").insert({
    user_id: userId,
    plan_id: paymentData.planId,
    amount: paymentData.amount,
    currency: paymentData.currency || "INR",
    status: "success",
    payment_provider: "razorpay",
    provider_payment_id: paymentData.paymentId,
    provider_order_id: paymentData.orderId,
    billing_cycle: paymentData.billingCycle,
  });

  if (error) throw error;
}

/**
 * Cancel subscription
 */
async function cancelSubscription(userId) {
  const { error } = await supabaseAdmin
    .from("subscriptions")
    .update({
      plan_id: "free",
      status: "active",
      billing_cycle: "monthly",
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString(),
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) throw error;
}

/**
 * Get payment history
 */
async function getPaymentHistory(userId) {
  const { data, error } = await supabaseAdmin
    .from("payments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) throw error;
  return data || [];
}

/**
 * Apply an addon by reducing current month's usage
 */
async function applyAddon(userId, addonConfig) {
  const currentMonth = new Date().toISOString().slice(0, 7);

  // Ensure usage row exists first
  await getUsage(userId);

  const { type, amount } = addonConfig;
  const columnToReduce = type === 'analyses' ? 'analyses_used' : type === 'kits' ? 'kits_used' : type === 'jd_analyses' ? 'jd_analyses_used' : null;
  
  if (!columnToReduce || !amount) return;

  const { data: usage } = await supabaseAdmin
    .from("usage")
    .select(columnToReduce)
    .eq("user_id", userId)
    .eq("month", currentMonth)
    .single();

  const currentVal = usage ? usage[columnToReduce] : 0;
  // Reduce usage to give extra quota (can go negative, which means extra buffer)
  const newVal = currentVal - amount;

  await supabaseAdmin
    .from("usage")
    .update({ [columnToReduce]: newVal })
    .eq("user_id", userId)
    .eq("month", currentMonth);
}

module.exports = {
  getSubscription,
  getUsage,
  updateSubscription,
  logPayment,
  applyAddon,
  cancelSubscription,
  getPaymentHistory,
};
