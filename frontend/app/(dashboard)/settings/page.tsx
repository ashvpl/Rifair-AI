"use client";

import { useUser, useSessionList, useSession, useClerk } from "@clerk/nextjs";
import { useSubscription } from "@/hooks/useSubscription";
import { useBackendToken } from "@/hooks/useBackendToken";
import { CheckoutButton } from "@/components/pricing/CheckoutButton";
import { PLANS } from "@/lib/pricing/plans";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { BillingCycle, PlanId } from "@/lib/pricing/types";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Loader2,
  CreditCard,
  ArrowRight,
  TrendingUp,
  ExternalLink,
  AlertCircle,
  User,
  BarChart3,
  Lock,
  Bell,
  Sliders,
  HelpCircle,
  AlertTriangle,
  Check,
  Laptop,
  Smartphone,
  Trash2,
  Download,
  Upload,
  Globe,
  Briefcase,
  Key,
  Clock,
  Send,
  CheckCircle2,
  Sparkles,
  ShieldAlert
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Custom LinkedIn SVG Icon since brand icons were deprecated in modern lucide-react versions
function Linkedin(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

type CurrencyKey = 'inr' | 'usd';

function detectCurrency(): CurrencyKey {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta') return 'inr';
  } catch {}
  return 'usd';
}

const CURRENCY_CONFIG: Record<CurrencyKey, { symbol: string; locale: string }> = {
  inr: { symbol: '₹', locale: 'en-IN' },
  usd: { symbol: '$', locale: 'en-US' },
};

const PLAN_ORDER: PlanId[] = ["free", "lite", "starter", "growth", "enterprise", "internal_qa_plan"];

export default function SettingsPage() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const {
    subscription,
    usage,
    payments,
    planId,
    usagePercent,
    isLoading: isSubscriptionLoading,
  } = useSubscription();

  const [activeTab, setActiveTab] = useState<
    "profile" | "billing" | "usage" | "security" | "notifications" | "preferences" | "support" | "danger"
  >("profile");

  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [currency, setCurrency] = useState<CurrencyKey>('usd');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    setCurrency(detectCurrency());
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!isUserLoaded || isSubscriptionLoading) {
    return <SettingsSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-[#86868B] font-bold">Please sign in to view settings.</p>
      </div>
    );
  }

  const currentPlan = PLANS.find((p) => p.id === planId)!;
  const nextPlans = PLANS.filter(
    (p) => PLAN_ORDER.indexOf(p.id) > PLAN_ORDER.indexOf(planId)
  );

  const tabs = [
    { id: "profile", label: "Profile Details", icon: User },
    { id: "billing", label: "Subscription & Billing", icon: CreditCard },
    { id: "usage", label: "Usage & Credits", icon: BarChart3 },
    { id: "security", label: "Security & Sessions", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "preferences", label: "AI Preferences", icon: Sliders },
    { id: "support", label: "Get Support", icon: HelpCircle },
    { id: "danger", label: "Danger Zone", icon: AlertTriangle },
  ] as const;

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* Header section */}
      <div className="relative">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
            Settings Control Center
          </h1>
          <p className="text-[#86868B] max-w-2xl text-sm md:text-base font-medium">
            Manage your professional identity, subscription parameters, custom AI reasoning styles, and account security.
          </p>
        </div>
      </div>

      {/* Floating Status Notification */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={cn(
              "fixed top-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-2xl shadow-xl font-bold text-xs border backdrop-blur-md",
              message.type === "success" 
                ? "bg-emerald-50/95 border-emerald-200/50 text-emerald-800" 
                : "bg-red-50/95 border-red-200/50 text-red-800"
            )}
          >
            {message.type === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Navigation Sidebar */}
        <aside className="w-full lg:w-64 bg-white border border-black/[0.04] rounded-[2rem] p-4 flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-1.5 shrink-0 no-scrollbar shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs whitespace-nowrap transition-all duration-300 active:scale-[0.98]",
                  isActive
                    ? "bg-black text-white shadow-md shadow-black/5"
                    : "text-black/50 hover:text-black hover:bg-black/[0.02]"
                )}
              >
                <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-white" : "text-black/40")} />
                {tab.label}
              </button>
            );
          })}
        </aside>

        {/* Right Active Tab Content Card */}
        <main className="flex-1 w-full bg-white border border-black/[0.04] rounded-[2rem] p-6 md:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.015)] min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "profile" && <ProfileTab user={user} setMessage={setMessage} />}
              {activeTab === "billing" && (
                <BillingTab
                  subscription={subscription}
                  planId={planId}
                  currentPlan={currentPlan}
                  nextPlans={nextPlans}
                  currency={currency}
                  billingCycle={billingCycle}
                  setBillingCycle={setBillingCycle}
                  setShowCancelModal={setShowCancelModal}
                  payments={payments}
                  router={router}
                />
              )}
              {activeTab === "usage" && (
                <UsageTab
                  usage={usage}
                  currentPlan={currentPlan}
                  usagePercent={usagePercent}
                  planId={planId}
                />
              )}
              {activeTab === "security" && <SecurityTab user={user} setMessage={setMessage} />}
              {activeTab === "notifications" && <NotificationsTab user={user} setMessage={setMessage} />}
              {activeTab === "preferences" && <PreferencesTab user={user} setMessage={setMessage} />}
              {activeTab === "support" && <SupportTab setMessage={setMessage} />}
              {activeTab === "danger" && <DangerZoneTab user={user} setMessage={setMessage} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Premium Cancellation Modal */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
          <div className="bg-[#1D1D1F] p-8 text-white text-center relative overflow-hidden">
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
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SUB-PANELS
   ───────────────────────────────────────────────────────────────── */

/** 1. PROFILE TAB */
function ProfileTab({ user, setMessage }: { user: any; setMessage: any }) {
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [role, setRole] = useState((user?.unsafeMetadata?.role as string) || "");
  const [company, setCompany] = useState((user?.unsafeMetadata?.company as string) || "");
  const [timezone, setTimezone] = useState((user?.unsafeMetadata?.timezone as string) || "Asia/Kolkata");
  const [linkedin, setLinkedin] = useState((user?.unsafeMetadata?.linkedin as string) || "");
  
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await user.update({
        firstName,
        lastName,
        unsafeMetadata: {
          ...user.unsafeMetadata,
          role,
          company,
          timezone,
          linkedin,
        },
      });
      setMessage({ text: "Profile updated successfully", type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to update profile", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      await user.setProfileImage({ file });
      setMessage({ text: "Profile image updated", type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to upload image", type: "error" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-extrabold text-[#1D1D1F] tracking-tight">Profile Details</h2>
        <p className="text-xs text-[#86868B] font-medium">Manage your personal credentials, roles, and professional links.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Photo Upload Card */}
        <div className="bg-[#FAFAFA] border border-black/[0.04] rounded-[2rem] p-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group/avatar cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <img src={user.imageUrl} alt="Avatar" className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-md group-hover:opacity-85 transition-opacity" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity">
              <Upload className="w-5 h-5 text-white" />
            </div>
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/85 rounded-3xl">
                <Loader2 className="w-6 h-6 animate-spin text-black" />
              </div>
            )}
          </div>
          <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
          <div className="text-center sm:text-left space-y-1">
            <h4 className="text-sm font-bold text-[#1D1D1F]">Profile photo</h4>
            <p className="text-xs text-[#86868B] max-w-xs leading-relaxed">Upload a high-resolution PNG or JPG image. Square dimensions work best.</p>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs font-bold text-black border border-black/10 hover:bg-black/[0.03] px-3.5 py-2 rounded-full mt-2 transition-all">
              Change photo
            </button>
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#86868B] uppercase tracking-wider">First Name</label>
            <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full h-12 px-4 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 font-medium text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Last Name</label>
            <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full h-12 px-4 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 font-medium text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Email Address</label>
            <div className="relative flex items-center">
              <input type="email" disabled value={user.primaryEmailAddress?.emailAddress || ""} className="w-full h-12 px-4 border border-black/5 bg-gray-50 text-[#86868B] rounded-xl font-medium text-sm cursor-not-allowed" />
              <span className="absolute right-4 text-[9px] bg-emerald-50 text-emerald-700 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Primary</span>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Professional Role</label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-3.5 w-5 h-5 text-black/30" />
              <input type="text" placeholder="e.g. Talent Acquisition, HR Lead" value={role} onChange={(e) => setRole(e.target.value)} className="w-full h-12 pl-12 pr-4 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 font-medium text-sm" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Company</label>
            <div className="relative">
              <Globe className="absolute left-4 top-3.5 w-5 h-5 text-black/30" />
              <input type="text" placeholder="e.g. Acme Corp" value={company} onChange={(e) => setCompany(e.target.value)} className="w-full h-12 pl-12 pr-4 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 font-medium text-sm" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Timezone</label>
            <div className="relative">
              <Clock className="absolute left-4 top-3.5 w-5 h-5 text-black/30 pointer-events-none" />
              <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full h-12 pl-12 pr-4 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 font-medium text-sm bg-white appearance-none">
                <option value="UTC">UTC (GMT+0)</option>
                <option value="Asia/Kolkata">IST (GMT+5:30) - Asia/Kolkata</option>
                <option value="America/New_York">EST (GMT-5) - America/New_York</option>
                <option value="Europe/London">GMT (GMT+0) - Europe/London</option>
                <option value="Asia/Tokyo">JST (GMT+9) - Asia/Tokyo</option>
                <option value="Australia/Sydney">AEDT (GMT+11) - Australia/Sydney</option>
                <option value="Europe/Paris">CET (GMT+1) - Europe/Paris</option>
              </select>
            </div>
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-bold text-[#86868B] uppercase tracking-wider">LinkedIn URL</label>
            <div className="relative">
              <Linkedin className="absolute left-4 top-3.5 w-5 h-5 text-black/30" />
              <input type="url" placeholder="https://linkedin.com/in/username" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className="w-full h-12 pl-12 pr-4 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 font-medium text-sm" />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={isSaving} className="h-12 px-8 bg-black hover:bg-black/90 text-white font-bold rounded-full transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 text-xs">
            {isSaving ? <Loader2 className="w-4 h-5 animate-spin" /> : <Check className="w-4 h-4" />}
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
}

/** 2. SUBSCRIPTION & BILLING TAB */
interface BillingTabProps {
  subscription: any;
  planId: PlanId;
  currentPlan: any;
  nextPlans: any[];
  currency: CurrencyKey;
  billingCycle: BillingCycle;
  setBillingCycle: (cycle: BillingCycle) => void;
  setShowCancelModal: (show: boolean) => void;
  payments: any[];
  router: any;
}
function BillingTab({
  subscription,
  planId,
  currentPlan,
  nextPlans,
  currency,
  billingCycle,
  setBillingCycle,
  setShowCancelModal,
  payments,
  router
}: BillingTabProps) {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-xl font-extrabold text-[#1D1D1F] tracking-tight">Subscription & Billing</h2>
        <p className="text-xs text-[#86868B] font-medium">Manage your active plans, billing details, and invoice logs.</p>
      </div>

      {/* Active Subscription Overview Card */}
      <div className="bg-[#FAFAFA] border border-black/[0.04] rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.2em] mb-1 block">
            Current plan
          </span>
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-extrabold text-[#1D1D1F] tracking-tight capitalize">
              {currentPlan.name}
            </h3>
            <PlanBadge planId={planId} />
          </div>
          {subscription?.currentPeriodEnd && planId !== "free" && (
            <p className="text-xs text-[#86868B] font-bold mt-2">
              {subscription.status === "cancelled" ? "Access valid until " : "Renews on "}
              {new Date(subscription.currentPeriodEnd).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
        </div>

        {planId !== "free" && subscription?.status !== "cancelled" && (
          <button
            onClick={() => setShowCancelModal(true)}
            className="text-xs font-bold text-red-500 hover:bg-red-50 px-5 py-3 border border-red-200/50 rounded-full transition-all self-start md:self-auto active:scale-95"
          >
            Cancel plan
          </button>
        )}
      </div>

      {/* Pricing comparison / Upgrade panel */}
      {planId !== "enterprise" && planId !== "growth" && nextPlans.length > 0 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-[#1D1D1F]">Available upgrades</h4>
              <p className="text-xs text-[#86868B]">Boost limits, add compliance audits, and unlock premium AI modules.</p>
            </div>
            
            {/* Cycle Toggle */}
            <div className="flex items-center gap-3 shrink-0">
              <span className={cn("text-xs font-bold transition-colors", billingCycle === "monthly" ? "text-[#1D1D1F]" : "text-[#86868B]")}>Monthly</span>
              <button
                onClick={() => setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly")}
                className={cn("w-10 h-5 rounded-full transition-colors relative", billingCycle === "annual" ? "bg-black" : "bg-gray-200")}
              >
                <span className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm", billingCycle === "annual" ? "translate-x-5" : "translate-x-0.5")} />
              </button>
              <span className={cn("text-xs font-bold transition-colors", billingCycle === "annual" ? "text-[#1D1D1F]" : "text-[#86868B]")}>
                Annual <span className="ml-1 bg-emerald-50 text-emerald-700 text-[9px] font-black px-1.5 py-0.5 rounded-full">Save 20%</span>
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {nextPlans
              .filter((p) => p.id !== "free" && !p.internal)
              .map((plan) => (
                <div key={plan.id} className={cn("border rounded-2xl p-5 flex items-center justify-between gap-4 transition-all", plan.isFeatured ? "border-black bg-[#FAFAFA] shadow-sm" : "border-black/[0.06] hover:border-black/[0.12]")}>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-extrabold text-[#1D1D1F]">{plan.name}</span>
                      {plan.badge && (
                        <span className="text-[9px] bg-black text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider">{plan.badge}</span>
                      )}
                    </div>
                    {plan.id !== "enterprise" && (
                      <p className="text-xs text-[#86868B] font-bold">
                        {CURRENCY_CONFIG[currency].symbol}
                        {plan.price[currency][billingCycle].toLocaleString(CURRENCY_CONFIG[currency].locale)} / month
                      </p>
                    )}
                  </div>
                  <CheckoutButton planId={plan.id} billingCycle={billingCycle} className={cn("text-xs font-bold px-5 py-2.5 rounded-full whitespace-nowrap transition-all active:scale-[0.97]", plan.isFeatured ? "bg-black text-white hover:bg-black/90 shadow-md" : "border-2 border-black/10 text-black hover:bg-black/[0.03]")}>
                    {plan.id === "enterprise" ? "Contact sales" : `Upgrade`}
                  </CheckoutButton>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Invoice history */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-[#1D1D1F] ml-1">Payment History</h4>
        {payments.length > 0 ? (
          <div className="space-y-2">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between py-4 px-4 border border-black/[0.04] bg-[#FAFAFA] rounded-2xl">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-[#1D1D1F] capitalize">
                    {payment.planId} plan — {payment.billingCycle}
                  </p>
                  <p className="text-[10px] text-[#86868B] font-medium">
                    {new Date(payment.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })} · {payment.paymentProvider}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-extrabold text-[#1D1D1F]">
                    ₹{(payment.amount / 100).toLocaleString("en-IN")}
                  </p>
                  <span className={cn("text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full", payment.status === "success" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600")}>
                    {payment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center bg-[#FAFAFA] rounded-[2rem] border border-dashed border-black/[0.06] flex flex-col items-center justify-center gap-2">
            <CreditCard className="w-8 h-8 text-[#86868B]/40" />
            <div>
              <p className="text-xs text-[#86868B] font-bold">No payments logged yet</p>
              <p className="text-[10px] text-[#86868B]/60 font-medium">Your subscription receipts will populate here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** 3. USAGE & CREDITS TAB */
interface UsageTabProps {
  usage: any;
  currentPlan: any;
  usagePercent: (key: "analyses" | "kits" | "jdAnalyses" | "evaluations") => number;
  planId: PlanId;
}
function UsageTab({ usage, currentPlan, usagePercent, planId }: UsageTabProps) {
  const analysesPercent = usagePercent("analyses");
  const kitsPercent = usagePercent("kits");
  const jdAnalysesPercent = usagePercent("jdAnalyses");
  const evaluationsPercent = usagePercent("evaluations");

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-xl font-extrabold text-[#1D1D1F] tracking-tight">Usage & Credits</h2>
        <p className="text-xs text-[#86868B] font-medium">Track your platform usage thresholds and credits consumption metrics.</p>
      </div>

      {/* Sparkline chart trend */}
      <UsageTrendChart />

      {/* Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UsageMeterCard
          label="Bias analyses"
          desc="Used in testing interview questions"
          used={usage?.analysesUsed ?? 0}
          limit={currentPlan.analysesLimit}
          percent={analysesPercent}
        />
        <UsageMeterCard
          label="Interview kits"
          desc="Generated custom candidate kits"
          used={usage?.kitsUsed ?? 0}
          limit={currentPlan.kitLimit}
          percent={kitsPercent}
        />
        <UsageMeterCard
          label="Candidate evaluations"
          desc="Structured scorecards evaluated"
          used={usage?.evaluationsUsed ?? 0}
          limit={currentPlan.evaluationsLimit}
          percent={evaluationsPercent}
        />
        {(planId === 'growth' || planId === 'enterprise') && (
          <UsageMeterCard
            label="Job descriptions"
            desc="Scanned and optimized job postings"
            used={usage?.jdAnalysesUsed ?? 0}
            limit={currentPlan.jdAnalysesLimit}
            percent={jdAnalysesPercent}
          />
        )}
      </div>
    </div>
  );
}

/** Real-time SVG Trend Chart — fetches /api/history and groups by day */
function UsageTrendChart() {
  const { getAuthToken } = useBackendToken();
  const [chartData, setChartData] = useState<{ day: string; label: string; count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    async function fetchChartData() {
      try {
        const token = await getAuthToken();
        const res = await fetch("/api/history", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const data = await res.json();
        const reports: { created_at: string }[] = data.history ?? [];

        // Build last-7-days buckets (oldest → newest)
        const days: { day: string; label: string; date: Date; count: number }[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          days.push({
            day: d.toLocaleDateString("en-US", { weekday: "short" }),
            label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
            date: d,
            count: 0,
          });
        }

        // Count reports per day bucket
        for (const r of reports) {
          const createdAt = new Date(r.created_at);
          const bucket = days.find(
            (b) =>
              b.date.getFullYear() === createdAt.getFullYear() &&
              b.date.getMonth() === createdAt.getMonth() &&
              b.date.getDate() === createdAt.getDate()
          );
          if (bucket) bucket.count++;
        }

        setChartData(days.map(({ day, label, count }) => ({ day, label, count })));
      } catch {
        // Graceful fallback: show zeros
        const fallback = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          fallback.push({
            day: d.toLocaleDateString("en-US", { weekday: "short" }),
            label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
            count: 0,
          });
        }
        setChartData(fallback);
      } finally {
        setIsLoading(false);
      }
    }
    fetchChartData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = chartData.reduce((s, d) => s + d.count, 0);
  const velocityLabel = total >= 10 ? "Healthy Velocity" : total >= 3 ? "Growing" : "Low Activity";
  const velocityClass = total >= 10
    ? "bg-emerald-50 text-emerald-700"
    : total >= 3
    ? "bg-amber-50 text-amber-700"
    : "bg-gray-100 text-gray-500";

  const width = 500;
  const height = 150;
  const padding = 20;
  const maxVal = Math.max(...chartData.map((d) => d.count), 1);

  const coords = chartData.map((d, i) => ({
    x: padding + (i * (width - padding * 2)) / Math.max(chartData.length - 1, 1),
    y: height - padding - (d.count / maxVal) * (height - padding * 2),
  }));

  const pathD = coords.length
    ? `M ${coords.map((c) => `${c.x},${c.y}`).join(" L ")}`
    : "";
  const fillD = coords.length
    ? `${pathD} L ${coords[coords.length - 1].x},${height - padding} L ${coords[0].x},${height - padding} Z`
    : "";

  if (isLoading) {
    return (
      <div className="bg-[#FAFAFA] border border-black/[0.04] rounded-[2rem] p-6 space-y-6 animate-pulse">
        <div className="flex justify-between items-start">
          <div className="space-y-1.5">
            <div className="h-4 bg-black/[0.04] rounded w-40" />
            <div className="h-3 bg-black/[0.03] rounded w-64" />
          </div>
          <div className="h-6 bg-black/[0.03] rounded-full w-32" />
        </div>
        <div className="h-40 bg-black/[0.02] rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] border border-black/[0.04] rounded-[2rem] p-6 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-sm font-bold text-[#1D1D1F]">Weekly Analyses Volume</h4>
          <p className="text-xs text-[#86868B]">
            Real-time daily count of analyses performed — last 7 days
          </p>
        </div>
        <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shrink-0", velocityClass)}>
          <Sparkles className="w-3 h-3" /> {velocityLabel}
        </span>
      </div>

      {/* Stat strip */}
      <div className="flex gap-6">
        <div>
          <p className="text-[10px] text-[#86868B] font-medium uppercase tracking-wider">7-day total</p>
          <p className="text-xl font-extrabold text-[#1D1D1F]">{total}</p>
        </div>
        <div>
          <p className="text-[10px] text-[#86868B] font-medium uppercase tracking-wider">Daily avg</p>
          <p className="text-xl font-extrabold text-[#1D1D1F]">{(total / 7).toFixed(1)}</p>
        </div>
        <div>
          <p className="text-[10px] text-[#86868B] font-medium uppercase tracking-wider">Peak day</p>
          <p className="text-xl font-extrabold text-[#1D1D1F]">
            {chartData.length ? chartData.reduce((a, b) => (b.count > a.count ? b : a)).day : "—"}
          </p>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full select-none">
        {/* Tooltip */}
        {hoveredIdx !== null && chartData[hoveredIdx] && (
          <div
            className="absolute z-10 pointer-events-none"
            style={{
              left: `${((coords[hoveredIdx]?.x ?? 0) / width) * 100}%`,
              top: `${((coords[hoveredIdx]?.y ?? 0) / height) * 100}%`,
              transform: "translate(-50%, -120%)",
            }}
          >
            <div className="bg-[#1D1D1F] text-white text-[10px] font-bold px-2.5 py-1.5 rounded-xl shadow-lg whitespace-nowrap">
              {chartData[hoveredIdx].label}
              <span className="ml-1.5 text-emerald-400">{chartData[hoveredIdx].count} analyses</span>
            </div>
            <div className="w-2 h-2 bg-[#1D1D1F] rotate-45 mx-auto -mt-1 rounded-sm" />
          </div>
        )}

        <svg
          className="w-full h-40"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="chartGlowReal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(0,0,0,0.025)" strokeDasharray="4 4" />
          <line x1={padding} y1={(height + padding) / 2} x2={width - padding} y2={(height + padding) / 2} stroke="rgba(0,0,0,0.025)" strokeDasharray="4 4" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(0,0,0,0.05)" />

          {total === 0 ? (
            // Flat baseline when no data
            <line
              x1={padding} y1={height - padding}
              x2={width - padding} y2={height - padding}
              stroke="#e5e7eb" strokeWidth="2.5" strokeDasharray="6 4"
            />
          ) : (
            <>
              <path d={fillD} fill="url(#chartGlowReal)" />
              <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </>
          )}

          {/* Interactive data points */}
          {coords.map((c, i) => (
            <g key={i}>
              {/* Large invisible hit area */}
              <circle
                cx={c.x} cy={c.y} r={18}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
              {/* Visible dot */}
              <circle
                cx={c.x} cy={c.y}
                r={hoveredIdx === i ? 6 : 4}
                fill={hoveredIdx === i ? "#10b981" : "#ffffff"}
                stroke="#10b981"
                strokeWidth="2.5"
                className="transition-all duration-150 pointer-events-none"
              />
              {/* Vertical cursor line on hover */}
              {hoveredIdx === i && (
                <line
                  x1={c.x} y1={c.y + 6}
                  x2={c.x} y2={height - padding}
                  stroke="#10b981" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.4"
                />
              )}
            </g>
          ))}
        </svg>

        {/* Day labels */}
        <div className="flex justify-between px-1 text-[9px] font-bold text-[#86868B] tracking-wider uppercase">
          {chartData.map((d, i) => (
            <span
              key={i}
              className={cn("transition-colors", hoveredIdx === i ? "text-[#1D1D1F]" : "")}
            >
              {d.day}
            </span>
          ))}
        </div>

        {/* Empty state */}
        {total === 0 && (
          <p className="text-center text-[10px] text-[#86868B] font-medium pt-2">
            No analyses performed in the last 7 days yet.
          </p>
        )}
      </div>
    </div>
  );
}

/** Usage meter progress card */
function UsageMeterCard({
  label,
  desc,
  used,
  limit,
  percent,
}: {
  label: string;
  desc: string;
  used: number;
  limit: number | null;
  percent: number;
}) {
  return (
    <div className="bg-[#FAFAFA] border border-black/[0.04] rounded-2xl p-5 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-xs font-bold text-[#1D1D1F] capitalize">{label}</h4>
          <p className="text-[10px] text-[#86868B] font-medium">{desc}</p>
        </div>
        <span className="text-xs font-extrabold text-black shrink-0">
          {used} {limit ? `/ ${limit}` : "/ ∞"}
        </span>
      </div>

      <div className="space-y-1">
        <div className="h-2 bg-black/[0.04] rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              limit && percent >= 90
                ? "bg-red-500"
                : limit && percent >= 75
                ? "bg-amber-500"
                : "bg-emerald-500"
            )}
            style={{ width: limit ? `${percent}%` : "100%" }}
          />
        </div>
        {limit && (
          <div className="flex justify-end">
            <span className={cn("text-[9px] font-bold", percent >= 90 ? "text-red-500" : percent >= 75 ? "text-amber-500" : "text-emerald-600")}>
              {percent}% consumed
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/** 4. SECURITY & SESSIONS TAB */
function SecurityTab({ user, setMessage }: { user: any; setMessage: any }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const { sessions } = useSessionList();
  const { session: activeSession } = useSession();

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ text: "New passwords do not match", type: "error" });
      return;
    }
    setIsChangingPassword(true);
    try {
      await user.updatePassword({ currentPassword, newPassword, signOutOfOtherSessions: true });
      setMessage({ text: "Password changed successfully! Revoked secondary device sessions.", type: "success" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to update password", type: "error" });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    if (deviceType?.toLowerCase() === "mobile") return Smartphone;
    return Laptop;
  };

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-xl font-extrabold text-[#1D1D1F] tracking-tight">Security & Device Sessions</h2>
        <p className="text-xs text-[#86868B] font-medium">Protect your credentials and monitor active browser devices.</p>
      </div>

      {user?.passwordEnabled ? (
        <form onSubmit={handlePasswordChange} className="space-y-6">
          <div className="bg-[#FAFAFA] border border-black/[0.04] rounded-[2rem] p-6 space-y-6">
            <h3 className="text-sm font-bold text-[#1D1D1F]">Change Password</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Current Password</label>
                <input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full h-12 px-4 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 font-medium text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#86868B] uppercase tracking-wider">New Password</label>
                <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full h-12 px-4 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 font-medium text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Confirm Password</label>
                <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full h-12 px-4 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 font-medium text-sm" />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={isChangingPassword} className="h-11 px-6 bg-black hover:bg-black/90 text-white font-bold rounded-full transition-all flex items-center justify-center gap-2 text-xs active:scale-95 disabled:opacity-50">
                {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
                Update password
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="p-6 bg-emerald-50/50 border border-emerald-100/50 rounded-2xl flex items-start gap-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-emerald-800">Connected with social identity</h4>
            <p className="text-xs text-emerald-700/80 mt-0.5 leading-relaxed">Your account uses Single Sign-On (SSO) through Google. Passwords and two-factor configurations are managed securely by your identity provider.</p>
          </div>
        </div>
      )}

      {/* Sessions list */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-[#1D1D1F] ml-1">Active Sessions</h3>
        <div className="space-y-2">
          {sessions?.map((session) => {
            const s = session as any;
            const Icon = getDeviceIcon(s.latestActivity?.deviceType || "desktop");
            const isCurrent = s.id === activeSession?.id;
            return (
              <div key={s.id} className="flex items-center justify-between p-5 border border-black/[0.04] bg-[#FAFAFA] rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-black/[0.03] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-black/50" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[#1D1D1F]">
                        {s.latestActivity?.osName || "Device"} ({s.latestActivity?.browserName || "Browser"})
                      </span>
                      {isCurrent && (
                        <span className="text-[8px] bg-emerald-50 text-emerald-700 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">This device</span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#86868B] font-medium mt-0.5 leading-relaxed">
                      IP: {s.latestActivity?.ipAddress || "Unknown"} · Last active {new Date(s.lastActiveAt).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** 5. NOTIFICATIONS TAB */
function NotificationsTab({ user, setMessage }: { user: any; setMessage: any }) {
  const [notifs, setNotifs] = useState(() => {
    const meta = user?.unsafeMetadata?.notifications as Record<string, boolean>;
    return {
      emailAlerts: meta?.emailAlerts ?? true,
      productUpdates: meta?.productUpdates ?? true,
      subscriptionReminders: meta?.subscriptionReminders ?? true,
      analysisCompletion: meta?.analysisCompletion ?? true,
      securityAlerts: meta?.securityAlerts ?? true,
    };
  });
  const [isSaving, setIsSaving] = useState(false);

  const toggle = (key: keyof typeof notifs) => {
    setNotifs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          notifications: notifs,
        },
      });
      setMessage({ text: "Notification settings updated", type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to save notifications", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const options = [
    { id: "emailAlerts", title: "Email alerts", desc: "Receive direct notification digests for candidate reports." },
    { id: "productUpdates", title: "Product updates", desc: "Stay informed about newly launched features and bias models." },
    { id: "subscriptionReminders", title: "Subscription reminders", desc: "Get notifications before billing cycles renew or end." },
    { id: "analysisCompletion", title: "Analysis completion", desc: "Instantly trigger notifications when long audit kits finish." },
    { id: "securityAlerts", title: "Security alerts", desc: "Get alerted immediately on new device logins and sessions." },
  ] as const;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-extrabold text-[#1D1D1F] tracking-tight">Notifications</h2>
        <p className="text-xs text-[#86868B] font-medium">Control what messages you receive from the Rifair AI engine.</p>
      </div>

      <div className="space-y-3">
        {options.map((opt) => (
          <div key={opt.id} className="flex items-center justify-between p-5 bg-[#FAFAFA] border border-black/[0.04] rounded-2xl gap-4">
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-[#1D1D1F]">{opt.title}</h4>
              <p className="text-xs text-[#86868B] font-medium leading-relaxed">{opt.desc}</p>
            </div>
            <div 
              onClick={() => toggle(opt.id)}
              className={cn(
                "w-14 h-7 rounded-full border relative flex-shrink-0 cursor-pointer p-1 transition-colors duration-200",
                notifs[opt.id] ? "bg-black border-black" : "bg-black/10 border-black/5"
              )}
            >
              <motion.div 
                animate={{ x: notifs[opt.id] ? 28 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={cn(
                  "w-5 h-5 rounded-full shadow-lg",
                  notifs[opt.id] ? "bg-white" : "bg-black"
                )}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <button onClick={handleSave} disabled={isSaving} className="h-12 px-8 bg-black hover:bg-black/90 text-white font-bold rounded-full transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 text-xs">
          {isSaving ? <Loader2 className="w-4 h-5 animate-spin" /> : <Check className="w-4 h-4" />}
          Save preferences
        </button>
      </div>
    </div>
  );
}

/** 6. PREFERENCES TAB */
function PreferencesTab({ user, setMessage }: { user: any; setMessage: any }) {
  const [depth, setDepth] = useState(() => {
    const meta = user?.unsafeMetadata?.preferences as Record<string, string>;
    return meta?.depth ?? "Standard";
  });
  const [style, setStyle] = useState(() => {
    const meta = user?.unsafeMetadata?.preferences as Record<string, string>;
    return meta?.style ?? "Professional";
  });
  const [language, setLanguage] = useState(() => {
    const meta = user?.unsafeMetadata?.preferences as Record<string, string>;
    return meta?.language ?? "English";
  });
  const { theme, setTheme } = useTheme();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          preferences: { depth, style, language },
        },
      });
      setMessage({ text: "AI Preferences updated", type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to save preferences", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-extrabold text-[#1D1D1F] tracking-tight">AI & App Preferences</h2>
        <p className="text-xs text-[#86868B] font-medium">Fine-tune the output styles and platform appearances of the AI engine.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Default Analysis Depth</label>
          <select value={depth} onChange={(e) => setDepth(e.target.value)} className="w-full h-12 px-4 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 font-medium text-sm bg-white appearance-none">
            <option value="Standard">Standard (Fast, targeted bias scan)</option>
            <option value="Deep">Deep (High context reasoning & compliance audit)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-[#86868B] uppercase tracking-wider">AI Tone & Output Style</label>
          <select value={style} onChange={(e) => setStyle(e.target.value)} className="w-full h-12 px-4 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 font-medium text-sm bg-white appearance-none">
            <option value="Professional">Professional (Objective & constructive)</option>
            <option value="Empathetic">Empathetic (Supportive & candidate-first)</option>
            <option value="Direct">Direct (Precise, minimal corrections)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Output Language</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full h-12 px-4 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 font-medium text-sm bg-white appearance-none">
            <option value="English">English</option>
            <option value="Spanish">Español (Spanish)</option>
            <option value="French">Français (French)</option>
            <option value="German">Deutsch (German)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Application Theme</label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setTheme("light")} className={cn("flex-1 h-12 border rounded-xl font-bold transition-all text-xs active:scale-98", theme === "light" ? "border-black bg-black text-white" : "border-black/10 text-black/50 hover:bg-black/[0.02]")}>
              Light Mode
            </button>
            <button type="button" onClick={() => setTheme("dark")} className={cn("flex-1 h-12 border rounded-xl font-bold transition-all text-xs active:scale-98", theme === "dark" ? "border-black bg-[#1D1D1F] text-white" : "border-black/10 text-black/50 hover:bg-black/[0.02]")}>
              Dark Mode
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button onClick={handleSave} disabled={isSaving} className="h-12 px-8 bg-black hover:bg-black/90 text-white font-bold rounded-full transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 text-xs">
          {isSaving ? <Loader2 className="w-4 h-5 animate-spin" /> : <Check className="w-4 h-4" />}
          Save preferences
        </button>
      </div>
    </div>
  );
}

/** 7. SUPPORT TAB */
function SupportTab({ setMessage }: { setMessage: any }) {
  const [form, setForm] = useState({
    full_name: '',
    work_email: '',
    company: '',
    subject: 'Technical Issue',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.work_email || !form.message) {
      setError('Please fill all required fields');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong');
        return;
      }
      setSubmitted(true);
      setMessage({ text: "Support message sent successfully", type: "success" });
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-8 md:p-12 rounded-3xl bg-black/[0.02] border border-black/[0.04] text-center space-y-6 py-20 flex flex-col items-center">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-2">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold tracking-tight text-[#1D1D1F]">Ticket submitted</h2>
          <p className="text-xs text-[#86868B] max-w-sm leading-relaxed">
            We've logged your request. Our support team typically answers within 24 hours.
          </p>
        </div>
        <button onClick={() => setSubmitted(false)} className="text-xs font-bold text-black border border-black/10 hover:bg-black/[0.02] px-5 py-2.5 rounded-full mt-2 transition-all">
          Submit another ticket
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-extrabold text-[#1D1D1F] tracking-tight">Platform Support</h2>
        <p className="text-xs text-[#86868B] font-medium">Have a billing question or bug report? Submit a ticket directly to the core engineering team.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Full Name</label>
            <input type="text" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full h-12 px-4 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 font-medium text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Work Email</label>
            <input type="email" required value={form.work_email} onChange={(e) => setForm({ ...form, work_email: e.target.value })} className="w-full h-12 px-4 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 font-medium text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Company (Optional)</label>
            <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="w-full h-12 px-4 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 font-medium text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Subject</label>
            <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full h-12 px-4 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 font-medium text-sm bg-white appearance-none">
              <option value="Technical Issue">Technical Issue</option>
              <option value="Billing Question">Billing Question</option>
              <option value="Enterprise Inquiry">Enterprise Inquiry</option>
              <option value="Feature Request">Feature Request</option>
              <option value="Bug Report">Bug Report</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Message Description</label>
          <textarea rows={5} required placeholder="Describe your inquiry with as much context as possible..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full p-4 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 font-medium text-sm resize-none" />
        </div>

        {error && <p className="text-xs text-red-500 font-bold ml-1">{error}</p>}

        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="h-12 px-8 bg-black hover:bg-black/90 text-white font-bold rounded-full transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 text-xs">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send ticket
          </button>
        </div>
      </form>
    </div>
  );
}

/** 8. DANGER ZONE TAB */
function DangerZoneTab({ user, setMessage }: { user: any; setMessage: any }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you absolutely sure you want to delete your account? This will delete all interview reports and active subscriptions permanently. This action is irreversible.")) {
      return;
    }
    setIsDeleting(true);
    try {
      await user.deleteSelf();
      window.location.href = "/";
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to delete account", type: "error" });
      setIsDeleting(false);
    }
  };

  const handleExportData = () => {
    setIsExporting(true);
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(user, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `rifair-export-${user.id}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setMessage({ text: "Data exported successfully", type: "success" });
    } catch {
      setMessage({ text: "Failed to export data", type: "error" });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-extrabold text-[#1D1D1F] tracking-tight">Danger Zone</h2>
        <p className="text-xs text-[#86868B] font-medium">Irreversible privacy and deletion parameters.</p>
      </div>

      <div className="space-y-4">
        {/* Export Data */}
        <div className="p-6 border border-black/[0.04] bg-[#FAFAFA] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-[#1D1D1F]">Export Account Data</h4>
            <p className="text-xs text-[#86868B] max-w-md leading-relaxed">Download a copy of your personal credentials and stored metadata in a portable JSON format.</p>
          </div>
          <button onClick={handleExportData} disabled={isExporting} className="h-10 px-5 border border-black/10 hover:bg-black/[0.03] text-black font-bold text-xs rounded-full flex items-center gap-2 transition-all shrink-0 active:scale-95">
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            Export data
          </button>
        </div>

        {/* Delete Account */}
        <div className="p-6 border border-red-100 bg-red-50/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-red-800 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> Delete Account
            </h4>
            <p className="text-xs text-red-700/80 max-w-md leading-relaxed">Permanently wipe your account, cancel all active subscriptions, and delete metadata. This cannot be undone.</p>
          </div>
          <button onClick={handleDeleteAccount} disabled={isDeleting} className="h-10 px-5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-full flex items-center gap-2 transition-all shrink-0 active:scale-95">
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Delete account
          </button>
        </div>
      </div>
    </div>
  );
}

/** SKELETON LOADER */
function SettingsSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-pulse pb-10">
      <div className="space-y-2">
        <div className="h-8 bg-black/[0.03] rounded-lg w-1/4" />
        <div className="h-4 bg-black/[0.03] rounded-lg w-2/5" />
      </div>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-64 space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-10 bg-black/[0.02] rounded-xl" />
          ))}
        </div>
        <div className="flex-1 bg-white border border-black/[0.04] rounded-[2rem] p-10 h-[500px]" />
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
    internal_qa_plan: "bg-red-50 text-red-700",
    analyses_20: "bg-blue-50 text-blue-700",
    kits_5: "bg-blue-50 text-blue-700",
    kits_15: "bg-blue-50 text-blue-700",
  };

  return (
    <span className={cn("text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full", styles[planId])}>
      {planId}
    </span>
  );
}
