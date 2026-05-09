"use client";

import { UserProfile } from "@clerk/nextjs";
import { useSubscription } from "@/hooks/useSubscription";
import { CheckoutButton } from "@/components/pricing/CheckoutButton";
import { PLANS } from "@/lib/pricing/plans";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { BillingCycle, PlanId } from "@/lib/pricing/types";
import { motion } from "framer-motion";

type CurrencyKey = 'inr' | 'usd'

function detectCurrency(): CurrencyKey {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta') return 'inr'
  } catch {}
  return 'usd'
}

const CURRENCY_CONFIG: Record<CurrencyKey, { symbol: string; locale: string }> = {
  inr: { symbol: '₹', locale: 'en-IN' },
  usd: { symbol: '$', locale: 'en-US' },
}
import {
  Loader2,
  CreditCard,
  ArrowRight,
  TrendingUp,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PLAN_ORDER: PlanId[] = ["free", "lite", "starter", "growth", "enterprise"];

export default function SettingsPage() {
  const {
    subscription,
    usage,
    payments,
    planId,
    usagePercent,
    isLoading,
  } = useSubscription();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [currency, setCurrency] = useState<CurrencyKey>('usd');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setCurrency(detectCurrency());
  }, []);

  const currentPlan = PLANS.find((p) => p.id === planId)!;
  const analysesPercent = usagePercent("analyses");
  const kitsPercent = usagePercent("kits");

  const nextPlans = PLANS.filter(
    (p) => PLAN_ORDER.indexOf(p.id) > PLAN_ORDER.indexOf(planId)
  );

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-10 animate-in fade-in duration-1000 pb-4 pt-0">
      {/* Header section */}
      <div className="relative">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
            System Settings
          </h1>
          <p className="text-[#86868B] max-w-2xl text-sm md:text-lg font-medium">
            Manage your professional identity, subscription, and platform
            preferences.
          </p>
        </div>
      </div>

      <div className="grid gap-8">
        {/* ═══════════════════════════════════════════════ */}
        {/* SUBSCRIPTION & BILLING SECTION                 */}
        {/* ═══════════════════════════════════════════════ */}

        {/* Current Plan Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-black/[0.05] rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-all duration-500 hover:shadow-[0_8px_48px_rgba(0,0,0,0.04)]"
        >
          <div className="p-6 md:p-10">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-[#86868B]" />
              </div>
            ) : (
              <>
                {/* Plan header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.2em] mb-1.5">
                      Current plan
                    </p>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl md:text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
                        {currentPlan.name}
                      </h2>
                      <PlanBadge planId={planId} />
                    </div>
                    {subscription?.status === "trialing" &&
                      subscription.trialEndsAt && (
                        <span className="text-xs bg-amber-50 text-amber-700 px-3 py-1 rounded-full mt-2 inline-block font-bold border border-amber-100">
                          Trial ends{" "}
                          {new Date(
                            subscription.trialEndsAt
                          ).toLocaleDateString("en-IN")}
                        </span>
                      )}
                  </div>

                </div>

                {/* Renewal date */}
                {subscription?.currentPeriodEnd && planId !== "free" && (
                  <p className="text-xs text-[#86868B] font-medium mb-6">
                    {subscription.status === "cancelled"
                      ? "Access until "
                      : "Renews on "}
                    {new Date(
                      subscription.currentPeriodEnd
                    ).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                )}

                {/* Usage meters */}
                <div className="space-y-4 mb-6">
                  <UsageMeter
                    label="Analyses used this month"
                    used={usage?.analysesUsed ?? 0}
                    limit={currentPlan.analysesLimit}
                    percent={analysesPercent}
                  />
                  <UsageMeter
                    label="Kits generated this month"
                    used={usage?.kitsUsed ?? 0}
                    limit={currentPlan.kitLimit}
                    percent={kitsPercent}
                  />
                  <UsageMeter
                    label="Evaluations this month"
                    used={usage?.evaluationsUsed ?? 0}
                    limit={currentPlan.evaluationsLimit}
                    percent={usagePercent("evaluations")}
                  />
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => router.push("/pricing")}
                    className="flex-1 min-w-[200px] text-sm font-bold border-2 border-black/10 text-[#1D1D1F] py-3 rounded-full hover:bg-black/[0.03] transition-all active:scale-[0.97] flex items-center justify-center gap-2"
                  >
                    View all plans <ExternalLink className="w-4 h-4" />
                  </button>
                  {planId !== "free" &&
                    subscription?.status !== "cancelled" && (
                      <button
                        onClick={() => setShowCancelModal(true)}
                        className="text-sm text-[#86868B] hover:text-red-500 px-5 py-3 font-bold transition-colors"
                      >
                        Cancel plan
                      </button>
                    )}
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Upgrade Section — only show if not enterprise or growth */}
        {!isLoading && planId !== "enterprise" && planId !== "growth" && nextPlans.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-black/[0.05] rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.02)]"
          >
            <div className="p-6 md:p-10">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                <h3 className="text-lg font-extrabold text-[#1D1D1F] tracking-tight">
                  Upgrade your plan
                </h3>
              </div>
              <p className="text-xs text-[#86868B] font-medium mb-6">
                Unlock more analyses, India-specific detection, and compliance
                tools
              </p>

              {/* Billing toggle */}
              <div className="flex items-center gap-3 mb-6">
                <span
                  className={cn(
                    "text-xs font-bold transition-colors",
                    billingCycle === "monthly"
                      ? "text-[#1D1D1F]"
                      : "text-[#86868B]"
                  )}
                >
                  Monthly
                </span>
                <button
                  onClick={() =>
                    setBillingCycle((c) =>
                      c === "monthly" ? "annual" : "monthly"
                    )
                  }
                  className={cn(
                    "w-10 h-5 rounded-full transition-colors relative",
                    billingCycle === "annual" ? "bg-[#1D1D1F]" : "bg-gray-200"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm",
                      billingCycle === "annual"
                        ? "translate-x-5"
                        : "translate-x-0.5"
                    )}
                  />
                </button>
                <span
                  className={cn(
                    "text-xs font-bold transition-colors",
                    billingCycle === "annual"
                      ? "text-[#1D1D1F]"
                      : "text-[#86868B]"
                  )}
                >
                  Annual
                  <span className="ml-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                    Save 20%
                  </span>
                </span>
              </div>

              {/* Next plan cards */}
              <div className="space-y-3">
                {nextPlans
                  .filter((p) => p.id !== "free")
                  .map((plan) => (
                    <div
                      key={plan.id}
                      className={cn(
                        "border rounded-2xl p-5 flex items-center justify-between gap-4 transition-all",
                        plan.isFeatured
                          ? "border-[#1D1D1F] bg-[#FAFAFA] shadow-md"
                          : "border-black/[0.06] hover:border-black/[0.12]"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-extrabold text-[#1D1D1F]">
                            {plan.name}
                          </span>
                          {plan.badge && (
                            <span className="text-[9px] bg-[#1D1D1F] text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                              {plan.badge}
                            </span>
                          )}
                        </div>
                        {plan.id !== "enterprise" && (
                          <p className="text-xs text-[#86868B] font-bold">
                            {CURRENCY_CONFIG[currency].symbol}
                            {plan.price[currency][billingCycle].toLocaleString(CURRENCY_CONFIG[currency].locale)}
                            /mo
                            {billingCycle === "annual" && (
                              <span className="line-through text-gray-300 ml-1.5">
                                {CURRENCY_CONFIG[currency].symbol}
                                {plan.price[currency].monthly.toLocaleString(CURRENCY_CONFIG[currency].locale)}
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                      <CheckoutButton
                        planId={plan.id}
                        billingCycle={billingCycle}
                        className={cn(
                          "text-xs font-bold px-5 py-2.5 rounded-full whitespace-nowrap flex-shrink-0 transition-all active:scale-[0.97]",
                          plan.isFeatured
                            ? "bg-[#1D1D1F] text-white hover:bg-black/80 shadow-md"
                            : "border-2 border-black/10 text-[#1D1D1F] hover:bg-black/[0.03]"
                        )}
                      >
                        {plan.id === "enterprise" ? (
                          <span className="flex items-center gap-1">
                            Contact sales <ExternalLink className="w-3 h-3" />
                          </span>
                        ) : (
                          `Upgrade to ${plan.name}`
                        )}
                      </CheckoutButton>
                    </div>
                  ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Billing History */}
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border border-black/[0.05] rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.02)]"
          >
            <div className="p-6 md:p-10">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard className="w-5 h-5 text-[#86868B]" />
                <h3 className="text-lg font-extrabold text-[#1D1D1F] tracking-tight">
                  Billing history
                </h3>
              </div>

              {payments.length > 0 ? (
                <div className="space-y-2">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between py-4 px-4 rounded-xl hover:bg-[#F5F5F7] transition-colors"
                    >
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-[#1D1D1F] capitalize">
                          {payment.planId} plan — {payment.billingCycle}
                        </p>
                        <p className="text-xs text-[#86868B] font-medium">
                          {new Date(payment.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )}{" "}
                          · {payment.paymentProvider}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-extrabold text-[#1D1D1F]">
                          ₹{(payment.amount / 100).toLocaleString("en-IN")}
                        </p>
                        <span
                          className={cn(
                            "text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full",
                            payment.status === "success"
                              ? "bg-emerald-50 text-emerald-600"
                              : payment.status === "failed"
                              ? "bg-red-50 text-red-600"
                              : "bg-gray-50 text-gray-500"
                          )}
                        >
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center bg-[#F5F5F7] rounded-2xl border border-dashed border-black/[0.06]">
                  <CreditCard className="w-8 h-8 text-[#86868B]/40 mx-auto mb-3" />
                  <p className="text-sm text-[#86868B] font-bold">
                    No payments yet
                  </p>
                  <p className="text-xs text-[#86868B]/60 font-medium mt-1">
                    Your invoices will appear here after your first payment.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════ */}
        {/* ACCOUNT PROFILE SECTION (existing Clerk)       */}
        {/* ═══════════════════════════════════════════════ */}
        <div className="bg-white border border-black/[0.05] rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-all duration-500 hover:shadow-[0_8px_48px_rgba(0,0,0,0.04)] hover:border-black/[0.08]">
          <div className="p-2 sm:p-4 md:p-10 overflow-hidden bg-white">
            <div className="max-w-full rounded-[1.5rem] md:rounded-[2rem] overflow-x-auto border border-black/[0.03] bg-[#F5F5F7]/10 p-1 sm:p-2 md:p-6 shadow-inner">
              <UserProfile
                routing="hash"
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "shadow-none border-none p-0 w-full bg-transparent mx-auto",
                    navbar:
                      "hidden md:flex bg-white border-r border-black/[0.03] rounded-l-[1.5rem] shadow-sm",
                    scrollBox: "shadow-none bg-transparent",
                    pageScrollBox: "pt-8 px-10 pb-12",
                    headerTitle:
                      "text-2xl font-extrabold tracking-tight text-foreground",
                    headerSubtitle: "text-[#86868B] font-medium text-sm",
                    navbarMobileMenuButton: "text-primary",
                    breadcrumbsItem:
                      "text-[#86868B] font-bold text-[10px] uppercase tracking-widest",
                    breadcrumbsSeparator: "text-black/10",
                    badge:
                      "bg-primary/5 text-primary border border-primary/10 font-bold",
                    profileSectionTitleText:
                      "text-foreground font-black uppercase tracking-[0.15em] text-[10px] mt-6 mb-4 pb-2 border-b border-black/[0.03]",
                    avatarBox:
                      "border-4 border-white shadow-xl w-24 h-24 rounded-3xl",
                    userPreviewMainIdentifier:
                      "text-foreground font-extrabold text-lg",
                    userPreviewSecondaryIdentifier:
                      "text-[#86868B] font-medium",
                    formButtonPrimary:
                      "bg-black hover:bg-black/90 text-white font-heavy h-12 px-8 rounded-full shadow-lg transition-all active:scale-95",
                    formFieldLabel:
                      "text-[#86868B] font-black text-[10px] uppercase tracking-[0.15em] mb-2",
                    formFieldInput:
                      "bg-white border-black/[0.06] text-foreground rounded-2xl h-14 px-5 focus:ring-4 focus:ring-black/5 focus:border-black/10 transition-all font-medium",
                    footerActionText: "text-[#86868B] font-medium",
                    footerActionLink:
                      "text-primary font-bold hover:underline",
                    identityPreviewText: "text-foreground font-bold",
                    formFieldInputGroup: "gap-4",
                    dividerRow: "border-black/[0.03]",
                    profileSection: "mb-12",
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Premium Cancellation Modal */}
    <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
        <div className="bg-[#1D1D1F] p-8 text-white text-center relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-500/10 blur-[100px]" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mb-6 border border-red-500/30">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <DialogTitle className="text-2xl font-black mb-2 tracking-tight">
              Cancel your plan?
            </DialogTitle>
            <DialogDescription className="text-white/60 text-sm font-medium leading-relaxed">
              We're sorry to see you go. You'll keep all your premium features until the end of your current billing period.
            </DialogDescription>
          </div>
        </div>
        
        <div className="p-8 bg-white flex flex-col gap-3">
          <button
            disabled={isCancelling}
            onClick={async () => {
              setIsCancelling(true);
              try {
                await fetch("/api/subscription/cancel", { method: "POST" });
                window.location.reload();
              } catch (err) {
                console.error(err);
                setIsCancelling(false);
              }
            }}
            className="w-full h-14 bg-red-500 hover:bg-red-600 text-white font-black rounded-2xl transition-all shadow-lg shadow-red-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isCancelling ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Yes, cancel my subscription"
            )}
          </button>
          
          <button
            onClick={() => setShowCancelModal(false)}
            className="w-full h-14 bg-[#F5F5F7] hover:bg-[#EBEBEB] text-[#1D1D1F] font-bold rounded-2xl transition-all active:scale-[0.98]"
          >
            Keep my plan
          </button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}

/** Usage meter bar */
function UsageMeter({
  label,
  used,
  limit,
  percent,
}: {
  label: string;
  used: number;
  limit: number | null;
  percent: number;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs text-[#86868B] mb-1.5 font-bold">
        <span>{label}</span>
        <span>
          {used}
          {limit ? ` / ${limit}` : " / ∞"}
        </span>
      </div>
      <div className="h-2 bg-[#F5F5F7] rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            percent >= 90
              ? "bg-red-500"
              : percent >= 70
              ? "bg-amber-500"
              : "bg-emerald-500"
          )}
          style={{ width: limit ? `${percent}%` : "0%" }}
        />
      </div>
    </div>
  );
}

/** Small plan badge */
function PlanBadge({ planId }: { planId: PlanId }) {
  const styles: Record<PlanId, string> = {
    free: "bg-[#F5F5F7] text-[#86868B]",
    lite: "bg-orange-50 text-orange-700",
    starter: "bg-blue-50 text-blue-700",
    growth: "bg-emerald-50 text-emerald-700",
    enterprise: "bg-purple-50 text-purple-700",
  };

  return (
    <span
      className={cn(
        "text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full",
        styles[planId]
      )}
    >
      {planId}
    </span>
  );
}
