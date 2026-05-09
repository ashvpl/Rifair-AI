"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { generateKit, getReportById } from "@/lib/api";
import { useSearchParams, useRouter } from "next/navigation";
import { UsageLimitBanner } from "@/components/pricing/FeatureGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { AlertCircle, ArrowRight, Zap, ClipboardCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { KitFeatureCards } from "@/components/kit-generator/KitFeatureCards";
import { LoadingState } from "@/components/LoadingState";
import { KitDisplay } from "@/components/kit-generator/KitDisplay";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { useContentModeration } from "@/hooks/useContentModeration";
import { ContentWarning } from "@/components/moderation/ContentWarning";
import KitAuditUploader from "@/components/kit-generator/KitAuditUploader";
import ExportButton from "@/components/pdf/ExportButton";
import { useSubscription } from "@/hooks/useSubscription";


type ActiveTab = "generate" | "audit";

export default function KitGeneratorPage() {
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>("generate");
  const [formData, setFormData] = useState({
    role: "Senior Frontend Engineer",
    experience_level: "5+ years",
    company_type: "Fast-growing tech startup",
    diversity_goals: "Ensure questions are accessible to non-traditional backgrounds"
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [kit, setKit] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState("");
  const { planId } = useSubscription();
  const router = useRouter();
  const searchParams = useSearchParams();
  const reportId = searchParams.get("reportId");

  useEffect(() => {
    const fetchReport = async () => {
      if (!reportId) return;
      setIsLoading(true);
      try {
        const token = await getToken();
        const data = await getReportById(reportId, token);
        let fetchedReport = data.report;

        // Supabase sometimes returns JSONB as string
        if (fetchedReport && typeof fetchedReport.categories === "string") {
          try {
            fetchedReport.categories = JSON.parse(fetchedReport.categories);
          } catch (e) {
            console.error("Failed to parse report categories", e);
          }
        }

        if (fetchedReport && fetchedReport.categories && fetchedReport.categories.kit_data) {
          setKit(fetchedReport.categories.kit_data);
          if (fetchedReport.categories.inputs) {
            setFormData(prev => ({
              ...prev,
              ...fetchedReport.categories.inputs,
            }));
          }
        } else if (fetchedReport && fetchedReport.categories) {
          setKit(fetchedReport.categories);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load report");
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
  }, [reportId, getToken]);

  const kitModeration = useContentModeration('kit');

  const handleGenerate = async () => {
    const combinedInput = `${formData.role} ${formData.experience_level} ${formData.company_type} ${formData.diversity_goals}`;
    const isClean = await kitModeration.checkContent(combinedInput);
    if (!isClean) return;

    setIsLoading(true);
    setError(null);
    setErrorCode(null);
    setKit(null);

    try {
      const token = await getToken();
      const data = await generateKit(formData, token);
      const kitData = data.kit || {};
      if (data.reportId) {
        router.push(`/kit?reportId=${data.reportId}`);
        return;
      }
      setKit(kitData);
    } catch (err: any) {
      if (err.code === 'limit_reached') {
        setShowUpgradeModal(true);
        setUpgradeReason(err.message || "Monthly kit limit reached");
        return;
      }
      setErrorCode(err.code || null);
      setError(err.message || "AI service temporarily unavailable");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewKit = () => {
    setKit(null);
    setError(null);
    setErrorCode(null);
  };

  return (
    <div className="kit-page-wrapper">
      <div className="relative max-w-6xl mx-auto space-y-6 pt-6 pb-16 px-0">
        {isLoading && <LoadingState text="Generating" />}
      
      {/* Header section */}
      <div className="relative">
        <div className="space-y-1">
          <h1 className={cn(
            "text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight",
            searchParams.get("evaluate") === "true" ? "text-[#1e1b4b]" : "text-[#062c21]"
          )}>
            {searchParams.get("evaluate") === "true" ? "Candidate Evaluation" : "Interview Kits"}
          </h1>
          <p className="text-[#86868B] max-w-2xl text-base md:text-lg font-medium">
            {searchParams.get("evaluate") === "true" 
              ? "Precision scoring to ensure accurate, merit-based hiring while detecting subtle interview biases."
              : "Generate role-specific kits or audit your existing questions for bias."}
          </p>
        </div>
      </div>

      {/* ── Tab Switcher (only shown outside evaluate mode) ─────────────── */}
      {searchParams.get("evaluate") !== "true" && (
        <div className="flex bg-[#F5F5F7]/80 rounded-2xl p-1 max-w-sm border border-black/[0.04]">
          <button
            onClick={() => setActiveTab("generate")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              activeTab === "generate"
                ? "bg-[#10b981] text-white shadow-md"
                : "text-[#86868B] hover:text-[#10b981]"
            )}
          >
            <Zap className="w-3.5 h-3.5" />
            Generate
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              activeTab === "audit"
                ? "bg-[#10b981] text-white shadow-md"
                : "text-[#86868B] hover:text-[#10b981]"
            )}
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            Audit My Kit
          </button>
        </div>
      )}

      {/* ── Audit Tab ──────────────────────────────────────────────────── */}
      {activeTab === "audit" && searchParams.get("evaluate") !== "true" && (
        <AnimatePresence mode="wait">
          <motion.div
            key="audit-tab"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <KitAuditUploader />
          </motion.div>
        </AnimatePresence>
      )}

      {/* ── Generate Tab (existing content) ────────────────────────────── */}
      {(activeTab === "generate" || searchParams.get("evaluate") === "true") && (
        <>
      <UsageLimitBanner type="kits" />

      <AnimatePresence mode="wait">
        {kit ? (
          /* ── Kit Results — Full Width ─────────────────────────────────── */
          <motion.div
            key="kit-results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          >
            {/* Action bar - hide when evaluating */}
            {searchParams.get("evaluate") !== "true" && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div>
                  <p className="text-xs font-bold text-[#86868B] uppercase tracking-[0.1em]">
                    Generated Kit
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {reportId && (
                    <>
                      <ExportButton 
                        type="kit" 
                        id={reportId} 
                        planTier={planId || 'free'} 
                        label="Export Kit"
                        variant="secondary"
                        className="w-auto"
                      />
                      <ExportButton 
                        type="audit" 
                        id={reportId} 
                        planTier={planId || 'free'} 
                        label="Audit Report"
                        variant="primary"
                        className="w-auto"
                      />
                    </>
                  )}
                  <Button
                    onClick={handleNewKit}
                    variant="outline"
                    className="bg-white hover:bg-[#F5F5F7] border-black/[0.06] rounded-xl font-bold text-[10px] uppercase tracking-widest px-6"
                  >
                    New Kit
                  </Button>
                </div>
              </div>
            )}

            <KitDisplay kit={kit} />
          </motion.div>
        ) : (
          /* ── Form + How It Works Side by Side ─────────────────────────── */
          <motion.div 
            key="interface-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch"
          >
            {/* Form Section - Left */}
            <div className="lg:col-span-1 h-full">
              <div className="bg-white border border-black/[0.05] p-6 sm:p-8 md:p-12 h-full min-h-[500px] md:min-h-[700px] rounded-[2rem] md:rounded-[3.5rem] shadow-[0_4px_24px_rgba(0,0,0,0.02)] relative overflow-hidden transition-all duration-500 hover:shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex flex-col">
                <div className="mb-6 md:mb-10">
                  <h2 className="text-xl md:text-2xl font-extrabold text-foreground tracking-tight">Role Definitions</h2>
                  <p className="text-xs md:text-sm font-medium text-[#86868B] mt-1">Prime the engine for localized expertise.</p>
                </div>
                
                <div className="space-y-6 flex-1 flex flex-col">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.1em] ml-1">Job Role</Label>
                    <Input 
                      value={formData.role} 
                      onChange={(e) => setFormData({...formData, role: e.target.value})} 
                      placeholder="e.g. Lead Machine Learning Engineer"
                      className="bg-[#F5F5F7]/30 border-black/[0.05] focus:border-black/[0.1] focus:ring-4 focus:ring-black/5 h-12 rounded-2xl transition-all font-semibold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.1em] ml-1">Experience</Label>
                    <Input 
                      value={formData.experience_level} 
                      onChange={(e) => setFormData({...formData, experience_level: e.target.value})} 
                      placeholder="e.g. Tier 4, 7-10 years" 
                      className="bg-[#F5F5F7]/30 border-black/[0.05] focus:border-black/[0.1] focus:ring-4 focus:ring-black/5 h-12 rounded-2xl transition-all font-semibold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.1em] ml-1">Company type</Label>
                    <Input 
                      value={formData.company_type} 
                      onChange={(e) => setFormData({...formData, company_type: e.target.value})} 
                      placeholder="e.g. Series B High-Growth" 
                      className="bg-[#F5F5F7]/30 border-black/[0.05] focus:border-black/[0.1] focus:ring-4 focus:ring-black/5 h-12 rounded-2xl transition-all font-semibold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.1em] ml-1">additional requirement</Label>
                    <Textarea 
                      value={formData.diversity_goals} 
                      onChange={(e) => setFormData({...formData, diversity_goals: e.target.value})} 
                      placeholder="e.g. Eliminate domain-specific linguistic barriers..."
                      className="resize-none bg-[#F5F5F7]/30 border-black/[0.05] focus:border-black/[0.1] focus:ring-4 focus:ring-black/5 min-h-[100px] rounded-2xl transition-all font-semibold p-4"
                    />
                  </div>
                  
                  <ContentWarning
                    warning={kitModeration.warning}
                    severity={kitModeration.severity}
                    category={kitModeration.category}
                    isChecking={kitModeration.isChecking}
                  />
                  
                  <Button 
                    onClick={handleGenerate}
                    disabled={isLoading || !formData.role || kitModeration.isBlocked || kitModeration.isChecking}
                    className={cn(
                      "w-full relative p-0.5 inline-flex overflow-hidden rounded-2xl group shadow-xl transition-all h-auto mt-auto active:scale-95 text-white",
                      searchParams.get("evaluate") === "true" ? "bg-[#3b82f6] hover:bg-[#2563eb]" : "bg-[#10b981] hover:bg-[#059669]"
                    )}
                  >
                    <span className="inline-flex size-full items-center justify-center rounded-2xl px-6 py-4 font-semibold transition-all">
                      <span className="font-black text-xs tracking-widest relative z-10 uppercase">
                        {kitModeration.isBlocked ? 'Fix content to continue' : 'Generate Kit'}
                      </span>
                    </span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Side Content */}
            <div className="lg:col-span-1 h-full">
              <div className="h-full min-h-[500px] md:min-h-[700px] bg-white border border-black/[0.05] flex flex-col items-stretch p-6 sm:p-8 md:p-12 text-foreground rounded-[2rem] md:rounded-[3.5rem] shadow-[0_8px_48px_rgba(0,0,0,0.02)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-black/[0.01] rounded-full blur-[120px] -mr-32 -mt-32 md:-mr-48 md:-mt-48" />
                <div className="relative z-10 flex flex-col items-center justify-center flex-1 py-10">
                  {error ? (
                    errorCode === 'api_quota_exceeded' ? (
                      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center max-w-sm mx-auto">
                        <div className="text-3xl mb-3">⏳</div>
                        <h3 className="text-sm font-semibold text-amber-900 mb-2">
                          AI is cooling down
                        </h3>
                        <p className="text-xs text-amber-700 mb-4">
                          Our AI quota resets every hour. 
                          Your kit generation will work again shortly.
                        </p>
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={handleGenerate}
                            className="text-xs font-medium bg-amber-600 text-white px-4 py-2 rounded-full hover:bg-amber-700 transition"
                          >
                            Try again
                          </button>
                          <button
                            onClick={() => router.push('/pricing')}
                            className="text-xs font-medium border border-amber-300 text-amber-700 px-4 py-2 rounded-full hover:bg-amber-100 transition"
                          >
                            Upgrade for more quota →
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-4 max-w-sm mx-auto">
                        <div className="bg-destructive/10 text-destructive p-4 rounded-2xl border border-destructive/20 mb-4">
                          <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <h3 className="font-black text-xs uppercase tracking-widest mb-1">Generation Error</h3>
                          <p className="text-xs font-bold opacity-80">{error}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          onClick={handleGenerate}
                          className="bg-white hover:bg-[#F5F5F7] border-black/[0.05] rounded-xl font-black text-[10px] uppercase tracking-widest px-8"
                        >
                          Retry Generation
                        </Button>
                      </div>
                    )
                  ) : (
                    <>
                      <div className="text-center mb-12 space-y-3">
                        <h3 className="text-4xl font-extrabold text-[#1D1D1F] tracking-tight uppercase">How it works</h3>
                        <p className="text-[#86868B] font-bold max-w-sm mx-auto leading-relaxed uppercase text-[11px] tracking-widest">Explore the core capabilities of the Rifair interview engine.</p>
                      </div>
                      <KitFeatureCards />
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
        </>
      )}
      <BottomSheet
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Monthly limit reached"
      >
        <div className="space-y-5">
          <div className="flex justify-center">
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100">
              <span className="text-3xl">⚡</span>
            </div>
          </div>
          <p className="text-center text-sm font-medium text-[#86868B] leading-relaxed">
            {upgradeReason} Upgrade to continue generating without interruption.
          </p>
          <div className="space-y-2.5">
            <button
              onClick={() => router.push('/pricing')}
              className="w-full bg-[#10b981] text-white py-4 rounded-2xl text-sm font-bold hover:bg-[#059669] transition-colors shadow-md active:scale-[0.98] flex items-center justify-center gap-2 min-h-[52px]"
            >
              View upgrade options <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="w-full text-[#86868B] py-3 text-sm hover:text-[#424245] transition-colors font-medium min-h-[44px]"
            >
              Maybe later
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  </div>
);
}
