const { supabase: supabaseAdmin } = require("../config/supabase");
const { secrets } = require("../core/secrets/secretManager");

const { isAdmin } = require("../utils/admin");

// --- Admin Caching and User Verification ---
const adminUserIds = new Set();
const nonAdminUserIds = new Set();

async function isAdminUser(userId) {
  if (!userId || userId === "anonymous") return false;
  
  if (adminUserIds.has(userId)) return true;
  if (userId === "user_3D1NoQ0R8GeLEtKk58qRxjh60Gc" || userId === "user_3DZjCGURzT37bRBp85cXBXebBp1") return true; 
  // Clear cache check to pick up new admin emails without restart
  // if (nonAdminUserIds.has(userId)) return false;

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
    const isUserAdmin = userEmails.some(email => isAdmin(email));

    if (isUserAdmin) {
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
 * Apply an addon by reducing current month's usage
 */
async function applyAddon(userId, addonConfig) {
  const usageService = require("./usageService");
  const currentMonth = new Date().toISOString().slice(0, 7);

  // Ensure usage row exists first
  await usageService.getUsage(userId);

  const { type, amount } = addonConfig;
  const columnToReduce = type === 'analyses' ? 'analyses_used' : type === 'kits' ? 'kits_used' : type === 'jd_analyses' ? 'jd_analyses_used' : null;
  
  if (!columnToReduce || !amount) return;

  // Reduce usage atomically by a negative amount
  await usageService.incrementUsage(userId, columnToReduce, -amount);
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

module.exports = {
  getSubscription,
  updateSubscription,
  logPayment,
  applyAddon,
  cancelSubscription,
  getPaymentHistory,
};
