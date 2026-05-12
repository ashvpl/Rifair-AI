"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { analyzeQuestions, getReportById, getBiasSession } from "@/lib/api";
import { useSearchParams, useRouter } from "next/navigation";
import { FeatureGate, UsageLimitBanner } from "@/components/pricing/FeatureGate";
import { QuestionInput } from "@/components/QuestionInput";
import { LoadingState } from "@/components/LoadingState";
import { BiasScoreRing } from "@/components/spectral/BiasScoreRing";
import { SpectralBiasReport } from "@/components/spectral/SpectralBiasReport";
import { SessionScoreBanner } from "@/components/spectral/SessionScoreBanner";
import { BiasDnaPanel } from "@/components/spectral/BiasDnaPanel";
import { AlertTriangle, ShieldCheck, FileDown, Layers, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { safeParseReport } from "@/lib/utils";
import { useSubscription } from "@/hooks/useSubscription";
import { BottomSheet } from "@/components/ui/BottomSheet";
import ExportButton from "@/components/pdf/ExportButton";


interface SessionState {
  funnelState: 1 | 2 | 3;
  sessionFairnessScore: number | null;
  biasedUnrewrittenCount: number;
  planId: string;
}

export default function AnalyzePage() {
  const { getToken } = useAuth();
  const { planId, canUse } = useSubscription();
  const [isLoading, setIsLoading]     = useState(false);
  const [report, setReport]           = useState<Record<string, any> | null>(null);
  const [error, setError]             = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason]       = useState("");
  const [teaserData, setTeaserData] = useState<{issuesCount: number, score: number} | null>(null);
  const [sessionState, setSessionState] = useState<SessionState>({
    funnelState: 1,
    sessionFairnessScore: null,
    biasedUnrewrittenCount: 0,
    planId: "free",
  });
  const [showSessionBanner, setShowSessionBanner] = useState(false);
  const router      = useRouter();
  const searchParams = useSearchParams();
  const reportId    = searchParams.get("reportId");
  const resultsRef  = useRef<HTMLDivElement>(null);

  // Fetch session state for the conversion funnel
  const refreshSessionState = useCallback(async () => {
    try {
      const token = await getToken({ template: "backend" }).catch(() => getToken()).catch(() => getToken());
      const data = await getBiasSession(token);
      setSessionState({
        funnelState: (data.funnel_state as 1 | 2 | 3) || 1,
        sessionFairnessScore: data.session_fairness_score,
        biasedUnrewrittenCount: data.biased_unrewritten_count || 0,
        planId: data.plan_id || "free",
      });
    } catch (_) {
      // Non-critical — fail silently
    }
  }, [getToken]);

  useEffect(() => {
    refreshSessionState();
  }, [refreshSessionState]);

  // Load report by ID if URL has reportId
  useEffect(() => {
    const fetchReport = async () => {
      if (!reportId) return;
      setIsLoading(true);
      setError(null);
      try {
        const token = await getToken({ template: "backend" }).catch(() => getToken()).catch(() => getToken());
        const data = await getReportById(reportId, token);
        const fetchedReport = safeParseReport(data.report);
        if (!fetchedReport) throw new Error("Report data missing");
        setReport(fetchedReport);
      } catch (err: any) {
        setError(err.message || "Failed to load report");
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
  }, [reportId, getToken]);

  const handleAnalyze = async (text: string, name: string) => {
    setIsLoading(true);
    setError(null);
    setReport(null);
    setShowSessionBanner(false);

    try {
      const token = await getToken({ template: "backend" }).catch(() => getToken()).catch(() => getToken());
      const data = await analyzeQuestions(text, token, name);
      const reportData = safeParseReport(data.report);
      
      // Refresh session state after analysis to update funnel
      await refreshSessionState();

      if (data.report?.id) {
        router.push(`/analyze?reportId=${data.report.id}`);
        return;
      }
      
      setReport(reportData);
      setShowSessionBanner(true);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    } catch (err: any) {
      if (err.code === "limit_reached") {
        setShowUpgradeModal(true);
        setUpgradeReason(err.message || "Monthly limit reached");
        if (err.teaser) {
          setTeaserData(err.teaser);
        } else {
          setTeaserData(null);
        }
        return;
      }
      setError(err instanceof Error ? err.message : "AI service temporarily unavailable");
    } finally {
      setIsLoading(false);
    }
  };

  const questions = report?.categories?.questions || [];
  const overallScore = report?.bias_score ?? report?.categories?.overall_bias_score ?? 0;
  const categoryBreakdown = report?.categories?.categoryBreakdown ?? {};

  return (
    <div className="relative space-y-4 md:space-y-6 animate-in fade-in duration-1000 pb-4 pt-0">
      {isLoading && <LoadingState text="Analysing" />}

      {/* Page header */}
      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#dc2626] tracking-tight">
          Bias analysis
        </h2>
        <p className="text-[#86868B] max-w-2xl text-sm sm:text-base md:text-lg font-medium">
          AI-powered hiring intelligence — detect, explain, and fix bias before your next interview.
        </p>
      </div>

      <div className="mb-6">
        <UsageLimitBanner type="analyses" />
      </div>

      {/* Session score conversion banner (shown after each analysis) */}
      <AnimatePresence>
        {showSessionBanner && (
          <SessionScoreBanner
            funnelState={sessionState.funnelState}
            sessionFairnessScore={sessionState.sessionFairnessScore}
            biasedUnrewrittenCount={sessionState.biasedUnrewrittenCount}
            planId={sessionState.planId}
          />
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">

        {/* ── Main column ── */}
        <div className="lg:col-span-2 space-y-5 md:space-y-8">

          <QuestionInput
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
            initialText={
              report?.categories?.original_input ||
              (report?.input_text?.startsWith("Analysis -") ? "" : report?.input_text) ||
              ""
            }
            initialName={
              report?.input_text?.startsWith("Analysis - '")
                ? report.input_text.replace(/^Analysis - '(.*)'$/, "$1")
                : ""
            }
          />

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-5 bg-red-50 border border-red-200/60 text-red-700 rounded-2xl flex items-center gap-4 shadow-sm">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-bold tracking-tight">{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>


          {!isLoading && report && questions.length > 0 && (
            <div ref={resultsRef} className="pt-6 md:pt-10 border-t border-black/[0.05] mt-6 md:mt-10 space-y-6">

              {/* Results header */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-[#dc2626]/10 rounded-xl flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5 text-[#dc2626]" />
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold text-[#dc2626] tracking-tight">
                    Bias Analysis Results
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <FeatureGate feature="batch_analysis" requiredPlan="growth" showUpgradePrompt={false}>
                    <button className="text-sm font-bold bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-full transition-colors hidden sm:flex items-center gap-2">
                      <Layers className="h-3.5 w-3.5" />
                      Batch analyze
                    </button>
                  </FeatureGate>
                  <FeatureGate feature="pdf_reports" requiredPlan="growth" showUpgradePrompt={false}>
                    <ExportButton 
                      type="analysis" 
                      id={reportId || ""} 
                      planTier={planId} 
                    />
                  </FeatureGate>
                </div>
              </div>

              {/* Spectral question cards */}
              <SpectralBiasReport questions={questions} />
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-5 md:space-y-6">
          <AnimatePresence mode="wait">
            {report && (
              <motion.div
                key="sidebar"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-5 md:space-y-6 lg:sticky lg:top-28"
              >
                {/* Overall score ring */}
                <div className="bg-white border border-black/[0.05] rounded-[2rem] p-6 md:p-8 flex flex-col items-center shadow-[0_4px_32px_rgba(0,0,0,0.02)]">
                  <p className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.2em] mb-6 text-center">
                    Bias Index
                  </p>
                  <BiasScoreRing score={overallScore} size="lg" showLabel />

                  {/* Session fairness score (if available) */}
                  {sessionState.sessionFairnessScore !== null && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.5 }}
                      className="mt-5 text-center w-full pt-4 border-t border-black/[0.04]"
                    >
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        Session Fairness
                      </p>
                      <p className={`text-2xl font-black ${
                        sessionState.sessionFairnessScore >= 70 ? "text-emerald-600" :
                        sessionState.sessionFairnessScore >= 40 ? "text-amber-600" :
                        "text-red-500"
                      }`}>
                        {sessionState.sessionFairnessScore}<span className="text-sm text-slate-400">/100</span>
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Category breakdown */}
                {Object.keys(categoryBreakdown).length > 0 && (
                  <div className="bg-white border border-black/[0.05] p-6 md:p-8 rounded-[2rem] shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-6">
                    <span className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.2em] block">
                      Detection Clusters
                    </span>
                    <div className="space-y-4">
                      {Object.entries(categoryBreakdown).map(([cat, count]: [any, any]) => {
                        const pct = Math.min((count / 5) * 100, 100);
                        return (
                          <div key={cat} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold tracking-tight">
                              <span className="capitalize text-foreground/70">{cat}</span>
                              <span className="text-foreground">{count}</span>
                            </div>
                            <div className="h-2 w-full bg-[#F5F5F7] rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 1.5, ease: "circOut" }}
                                className="h-full bg-[#dc2626] rounded-full"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Bias DNA panel (Growth) */}
                <BiasDnaPanel />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Upgrade bottom sheet (limit reached) ───────────────────── */}
      <BottomSheet
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title={teaserData ? "Bias Detected" : "Monthly limit reached"}
      >
        {teaserData ? (
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-center">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-red-800 font-bold text-lg mb-1">
                {teaserData.issuesCount} bias {teaserData.issuesCount === 1 ? 'issue' : 'issues'} found
              </h3>
              <p className="text-red-600/80 text-sm font-medium">
                You've used 5/5 free analyses this month.
              </p>
            </div>

            <div className="relative border border-dashed border-black/[0.1] rounded-xl overflow-hidden min-h-[160px] flex items-center justify-center group bg-white">
              {/* Blurred Preview Background */}
              <div className="absolute inset-0 z-0 opacity-60">
                <img 
                  src="/premium-preview.png" 
                  alt="Blurred Rewrite" 
                  className="w-full h-full object-cover blur-[2px] scale-105"
                />
              </div>
              
              <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-1" />

              <div className="relative z-10 p-5 text-center w-full max-w-[280px] mx-auto">
                <div className="bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-xl border border-black/5">
                  <div className="w-8 h-8 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-2 text-sm">
                    🔒
                  </div>
                  <p className="text-xs font-bold text-[#1D1D1F] mb-1">
                    AI Rewrite Locked
                  </p>
                  <p className="text-[10px] text-[#86868B] font-medium">
                    Upgrade to see the neutral, unbiased version of this question.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => router.push("/pricing")}
                className="w-full bg-[#3b82f6] text-white py-4 rounded-2xl text-sm font-bold uppercase tracking-widest shadow-[0_4px_14px_rgba(59,130,246,0.3)] hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 min-h-[52px]"
              >
                Unlock rewrite + 40 more analyses <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="w-full text-[#86868B] py-3 text-sm hover:text-[#424245] transition-colors font-medium min-h-[44px]"
              >
                Maybe later
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex justify-center">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100">
                <span className="text-3xl">⚡</span>
              </div>
            </div>
            <p className="text-center text-sm font-medium text-[#86868B] leading-relaxed">
              {upgradeReason} Upgrade to continue detecting bias without interruption.
            </p>
            <div className="space-y-2.5">
              <button
                onClick={() => router.push("/pricing")}
                className="w-full bg-[#dc2626] text-white py-4 rounded-2xl text-sm font-bold hover:bg-red-700 transition-colors shadow-md active:scale-[0.98] flex items-center justify-center gap-2 min-h-[52px]"
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
        )}
      </BottomSheet>
    </div>
  );
}
