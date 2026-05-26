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
import { safeParseReport, cn } from "@/lib/utils";
import { useSubscription } from "@/hooks/useSubscription";
import { BottomSheet } from "@/components/ui/BottomSheet";
import ExportButton from "@/components/pdf/ExportButton";
import { useBackendToken } from "@/hooks/useBackendToken";


interface SessionState {
  funnelState: 1 | 2 | 3;
  sessionFairnessScore: number | null;
  biasedUnrewrittenCount: number;
  planId: string;
}

export default function AnalyzePage() {
  const { getAuthToken } = useBackendToken();
  const { planId, canUse } = useSubscription();
  const [isLoading, setIsLoading]     = useState(false);
  const [report, setReport]           = useState<Record<string, any> | null>(null);
  const [error, setError]             = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState("Analyzing questions...");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason]       = useState("");
  const [teaserData, setTeaserData] = useState<{issuesCount: number, score: number} | null>(null);
  const [sessionState, setSessionState] = useState<SessionState>({
    funnelState: 1,
    sessionFairnessScore: null,
    biasedUnrewrittenCount: 0,
    planId: "free",
  });
  const [activeAlertIdx, setActiveAlertIdx] = useState(0);
  const [showSessionBanner, setShowSessionBanner] = useState(false);
  const router      = useRouter();
  const searchParams = useSearchParams();
  const reportId    = searchParams.get("reportId");
  const resultsRef  = useRef<HTMLDivElement>(null);

  // Fetch session state for the conversion funnel
  const refreshSessionState = useCallback(async () => {
    try {
      const token = await getAuthToken();
      if (!token) return;
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
  }, [getAuthToken]);

  useEffect(() => {
    refreshSessionState();
  }, [refreshSessionState]);

  // Alert rotation timer
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveAlertIdx((prev) => (prev + 1) % 8);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Load report by ID if URL has reportId
  useEffect(() => {
    const fetchReport = async () => {
      if (!reportId) return;
      setIsLoading(true);
      setLoadingText("Retrieving analysis...");
      setError(null);
      try {
        const token = await getAuthToken();
        if (!token) throw new Error("Authentication required");
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
  }, [reportId, getAuthToken]);

  const handleAnalyze = async (text: string, name: string) => {
    setIsLoading(true);
    setLoadingText("Analyzing questions...");
    setError(null);
    setReport(null);
    setShowSessionBanner(false);

    try {
      const token = await getAuthToken();
      if (!token) throw new Error("Authentication required");
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

  const renderHeroCard = () => (
    <div className="bg-[#dc2626] border-2 border-black rounded-xl lg:rounded-2xl p-3 sm:p-5 lg:p-6 xl:p-8 text-white relative overflow-visible shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] lg:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-colors duration-500">
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col gap-2 lg:gap-3">
        {/* Top Section: Title & Description */}
        <div className="flex flex-row justify-between items-start gap-3">
          <div className="space-y-1 lg:space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-2 lg:gap-3.5">
              <div className="w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-lg bg-white/10 flex items-center justify-center border border-white/10 backdrop-blur-md flex-shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xs sm:text-lg lg:text-2xl xl:text-3xl font-black text-white tracking-tight break-words leading-tight">
                  Bias Analysis Report
                </h1>
                <p className="text-[8px] lg:text-[10px] font-black text-white/60 uppercase tracking-widest flex items-center gap-1">
                  <Layers className="w-2.5 h-2.5" />
                  Spectral Intelligence Audit
                </p>
              </div>
            </div>

            <p className="text-[9px] sm:text-xs lg:text-sm text-white/80 leading-snug font-medium line-clamp-2 lg:line-clamp-none">
              Our AI has scanned your interview content for unconscious bias, exclusionary language, and legal risks.
            </p>
          </div>

          {/* Desktop Metrics */}
          <div className="hidden sm:flex items-center gap-3 lg:gap-4 shrink-0">
            <div className="text-right">
              <div className="text-[9px] lg:text-[10px] font-black text-white/60 uppercase tracking-widest">Bias Points</div>
              <div className="text-2xl lg:text-3xl xl:text-4xl font-black text-white tracking-tighter leading-none">
                {questions.filter((q: any) => (q.bias_score ?? 0) >= 30).length}<span className="text-xs lg:text-sm text-white/40">pts</span>
              </div>
            </div>
            <div className="px-2.5 lg:px-3 py-1.5 lg:py-2 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] lg:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center text-center bg-white text-black min-w-[60px] lg:min-w-[80px]">
              <span className="text-[7px] lg:text-[9px] font-black uppercase tracking-widest opacity-60">Fairness</span>
              <span className={cn(
                "text-xs lg:text-xl font-black uppercase tracking-widest",
                overallScore >= 70 ? "text-emerald-600" :
                overallScore >= 40 ? "text-amber-600" :
                "text-red-600"
              )}>{overallScore}</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar: mobile metrics + export button */}
        <div className="flex flex-row justify-between items-center border-t border-white/10 pt-2 gap-2">
          <div className="flex items-center gap-2">
            {/* Mobile Metrics (Visible only on mobile) */}
            <div className="flex sm:hidden items-center gap-2">
              <div className="text-left">
                <div className="text-[7px] font-black text-white/60 uppercase tracking-widest">Bias Pts</div>
                <div className="text-sm font-black text-white leading-none">
                  {questions.filter((q: any) => (q.bias_score ?? 0) >= 30).length}pts
                </div>
              </div>
              <div className="h-5 w-[1px] bg-white/20" />
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg border border-white/20 bg-white/5">
                <span className="text-[7px] font-black uppercase tracking-widest text-white/60">Score</span>
                <span className={cn(
                  "text-[10px] font-black uppercase",
                  overallScore >= 70 ? "text-emerald-400" :
                  overallScore >= 40 ? "text-amber-400" :
                  "text-red-400"
                )}>{overallScore}</span>
              </div>
            </div>

            {/* Desktop Metadata (Hidden on mobile) */}
            <div className="hidden sm:flex items-center gap-3 text-white/60 text-[9px] font-bold uppercase tracking-widest">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-white/80" />
                Compliance
              </div>
              <div className="flex items-center gap-1">
                <Layers className="w-3 h-3 text-white/80" />
                {questions.length} Analyzed
              </div>
            </div>
          </div>

          {/* Export button - outside overflow so tooltip shows */}
          <div className="w-24 xs:w-28 sm:w-36 shrink-0 relative z-50">
            <ExportButton
              type="analysis"
              id={reportId || ""}
              planTier={planId}
              variant="secondary"
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderBiasIndexCard = (ringSize: "md" | "lg" = "lg") => (
    <div className="bg-white border-2 border-black rounded-xl lg:rounded-2xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] lg:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      {/* Horizontal compact layout for mobile, vertical for desktop sidebar */}
      <div className="flex items-center gap-3 p-3 sm:flex-col sm:items-center sm:p-4 lg:p-6 xl:p-8">
        {/* Score ring */}
        <div className="flex-shrink-0">
          <BiasScoreRing score={overallScore} size={ringSize} showLabel />
        </div>
        {/* Label + Session Score */}
        <div className="flex-1 sm:text-center sm:w-full sm:border-t sm:border-black/[0.04] sm:pt-3 sm:mt-1">
          <p className="text-[8px] lg:text-[10px] font-black text-black/30 uppercase tracking-[0.25em] mb-0.5 sm:mb-2">
            Bias Index
          </p>
          {sessionState.sessionFairnessScore !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex items-center gap-2 sm:flex-col sm:gap-0"
            >
              <p className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">Session</p>
              <p className={`text-base sm:text-2xl lg:text-3xl font-black ${
                sessionState.sessionFairnessScore >= 70 ? "text-emerald-600" :
                sessionState.sessionFairnessScore >= 40 ? "text-amber-600" :
                "text-red-500"
              }`}>
                {sessionState.sessionFairnessScore}<span className="text-xs lg:text-sm text-slate-400">/100</span>
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );

  const renderCategoryBreakdown = () => {
    if (Object.keys(categoryBreakdown).length === 0) return null;
    return (
      <div className="bg-white border-2 border-black p-4 sm:p-5 lg:p-6 xl:p-8 rounded-xl lg:rounded-2xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] lg:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3 lg:space-y-5">
        <span className="text-[10px] lg:text-xs font-black text-black/30 uppercase tracking-[0.3em] block">
          Detection Clusters
        </span>
        <div className="space-y-3 sm:space-y-4">
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
    );
  };

  return (
    <div className="relative space-y-3 animate-in fade-in duration-1000 pb-4 pt-0">
      {isLoading && <LoadingState text={loadingText} />}

      {/* Page header - hide when viewing history */}
      {!reportId && (
        <>
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black text-[#dc2626] tracking-tight">
              Bias analysis
            </h2>
            <p className="text-[#86868B] max-w-2xl text-xs sm:text-sm lg:text-sm xl:text-base font-medium">
              AI-powered hiring intelligence — detect, explain, and fix bias before your next interview.
            </p>
          </div>

          <div className="mb-6">
            <UsageLimitBanner type="analyses" />
          </div>
        </>
      )}

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

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="p-5 bg-red-50 border border-red-200/60 text-red-700 rounded-2xl flex items-center gap-4 shadow-sm">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-bold tracking-tight">{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!reportId && !report && (
        <div className="space-y-5 md:space-y-8 max-w-4xl">
          <QuestionInput
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
            initialText=""
            initialName=""
          />
        </div>
      )}

      {!isLoading && report && questions.length > 0 ? (
        <div ref={resultsRef} className={cn("space-y-3", !reportId && "pt-3")}>
          
          {/* 1. Mobile Flow (Visible on mobile/tablet, hidden on desktop) */}
          <div className="flex flex-col gap-3 lg:hidden">
            {renderHeroCard()}
            {renderBiasIndexCard("md")}
            <SpectralBiasReport questions={questions} />
            <BiasDnaPanel />
            {renderCategoryBreakdown()}
          </div>

          {/* 2. Desktop Flow (Hidden on mobile/tablet, visible on desktop) */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-4 items-start">
            {/* Left Column (spans 2) */}
            <div className="lg:col-span-2 space-y-5">
              {renderHeroCard()}
              <SpectralBiasReport questions={questions} />
            </div>

            {/* Right Column (spans 1) */}
            <div className="space-y-4 lg:sticky lg:top-6">
              {renderBiasIndexCard("lg")}
              {renderCategoryBreakdown()}
              <BiasDnaPanel />
            </div>
          </div>

        </div>
      ) : (
        !isLoading && !report && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
            {/* Landing/Teaser Cards */}
            <div className="lg:col-span-2">
              <motion.div 
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mt-6"
              >
                {[
                  {
                    title: "Protect Your Brand",
                    desc: "Unconscious bias isn't just unethical—it's a legal risk. Every analysis creates a verifiable data trail of your commitment to fair hiring."
                  },
                  {
                    title: "Unlock Better Talent",
                    desc: "Inclusive questions don't just feel better—they yield 25% more high-quality candidates by removing irrelevant barriers."
                  },
                  {
                    title: "Instant Audit Readiness",
                    desc: "Institutionalize fairness as a daily habit. One-click analysis ensures every interview kit meets your organization's highest standards."
                  },
                  {
                    title: "Outcome-Driven Intelligence",
                    desc: "Our AI doesn't just block bias—it rebuilds your questions to be more effective, professional, and impactful."
                  }
                ].map((card, i) => (
                  <motion.div 
                    key={i}
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      show: { opacity: 1, y: 0 }
                    }}
                    className="p-6 lg:p-6 bg-white border-2 border-black rounded-2xl lg:rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] lg:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3 lg:space-y-3 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all duration-300"
                  >
                    <h4 className="text-base lg:text-xl font-black text-black tracking-tight">{card.title}</h4>
                    <p className="text-xs lg:text-sm text-black/60 font-medium leading-relaxed">
                      {card.desc}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Sidebar alerts & Shield info */}
            <div className="space-y-5 lg:sticky lg:top-28">
              <div className="bg-white border-2 border-black rounded-2xl p-6 lg:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] lg:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6 lg:space-y-6">
                <div className="flex items-center gap-2 border-b-2 border-black pb-4">
                  <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                  <span className="text-[10px] lg:text-xs font-black text-black uppercase tracking-[0.3em]">
                    Recent Hiring Updates
                  </span>
                </div>
                
                <div className="min-h-[140px] flex items-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeAlertIdx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-3"
                    >
                      {[
                        {
                          title: "Global Tech Firm Fined $2.4M",
                          desc: "Discriminatory interview questions led to a massive class-action settlement. Bias is a multi-million dollar liability."
                        },
                        {
                          title: "Turnover 40% Higher",
                          desc: "Research shows biased interview questions lead to significantly higher turnover rates within the first 6 months."
                        },
                        {
                          title: "EEOC Audits Increasing",
                          desc: "Regulators now require auditable proof of non-bias in hiring AI. Companies without reports are first to be targeted."
                        },
                        {
                          title: "Viral Bias: Brand Damage",
                          desc: "Social media exposure of a single biased question can destroy your company's hiring reputation overnight."
                        },
                        {
                          title: "12,000 Candidate Lawsuit",
                          desc: "A small 'background' question triggered a massive class-action suit spanning 12,000 rejected candidates."
                        },
                        {
                          title: "Cost of Bad Hires: 1.5x Salary",
                          desc: "Biased questions mask true talent, leading to expensive hiring mistakes that cost 1.5x the employee's annual salary."
                        },
                        {
                          title: "Compliance Deadlines",
                          desc: "New 'Skills-First' mandates are being enforced. Verifiable proof of non-bias is no longer optional for enterprise teams."
                        },
                        {
                          title: "Productivity Boost 25%",
                          desc: "Companies using Rifair AI report an average 25% boost in hiring productivity by focusing on what actually matters."
                        }
                      ].map((alert, i) => (
                        i === activeAlertIdx && (
                          <div key={i} className="space-y-2">
                            <p className="text-sm font-black text-black tracking-tight leading-snug">
                              {alert.title}
                            </p>
                            <p className="text-xs text-black/50 leading-relaxed font-medium">
                              {alert.desc}
                            </p>
                          </div>
                        )
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="pt-6 relative">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-black/20 via-black/5 to-black/20" />
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[9px] font-black text-white bg-black px-2 py-0.5 rounded tracking-tighter">SECURE</span>
                    <p className="text-[10px] font-black text-black uppercase tracking-[0.2em]">
                      Rifair Shield Active
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <p className="text-[11px] font-bold text-black/70">Bulletproof legal compliance records.</p>
                    </div>
                    <div className="flex gap-3">
                      <Layers className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <p className="text-[11px] font-bold text-black/70">Data-backed hiring productivity boost.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      )}

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
