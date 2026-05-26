"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, AlertTriangle, Flag, Info } from "lucide-react";
import { useState } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { FeatureGate } from "@/components/pricing/FeatureGate";
import { BiasScoreRing } from "./BiasScoreRing";
import { BlurredRewritePreview } from "./BlurredRewritePreview";
import { LawViolationBadge } from "./LawViolationBadge";
import { cn } from "@/lib/utils";

interface Question {
  original: string;
  bias_score: number;
  bias_level?: string;
  bias_types?: string[];
  flags?: { category: string; severity: string }[];
  explanation?: string;
  improved_question?: string;
  highlighted?: string;
  detectionMethod?: string;
  primary_issue?: string | null;
  competency_being_assessed?: string | null;
  law_violation?: string | null;
  rewrite_rationale?: string | null;
  india_analysis?: {
    india_bias_score: number;
    verdict?: string;
    categories?: string[];
    explanation?: string;
    indian_law_violation?: string;
    confidence?: string;
  } | null;
  india_specific_flags?: string[];
  signals?: string[];
}

interface SpectralBiasReportProps {
  questions: Question[];
}

const TYPE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  high:   { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200' },
  medium: { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200' },
  low:    { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200' },
  neutral:{ bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
};

export function SpectralBiasReport({ questions }: SpectralBiasReportProps) {
  const [expanded, setExpanded] = useState<number | null>(1);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const { canUse } = useSubscription();

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(idx);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {questions.map((q, idx) => {
          const score      = q.bias_score ?? 0;
          const isNeutral  = score <= 20 && (q.flags?.length || 0) === 0;
          const hasHigh    = q.flags?.some((f) => f.severity === "high");
          const biasLevel  = isNeutral ? "neutral" : (hasHigh || score >= 55) ? "high" : score >= 25 ? "medium" : "low";
          const lawText    = q.india_analysis?.indian_law_violation || q.law_violation;
          const signals    = q.signals || [];
          
          const typeStyle = TYPE_STYLES[biasLevel] ?? TYPE_STYLES.neutral;
          const questionId = idx + 1;
          const isExpanded = expanded === questionId;

          return (
            <motion.div
              key={questionId}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={cn(
                "bg-white border border-black rounded-xl overflow-hidden transition-all duration-300",
                isExpanded
                  ? "shadow-none translate-x-0.5 translate-y-0.5"
                  : "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
              )}
            >
              {/* Question header */}
              <button
                onClick={() => setExpanded(isExpanded ? null : questionId)}
                className="w-full text-left p-2 sm:p-2.5 lg:p-4 xl:p-5 cursor-pointer"
              >
                <div className="flex items-start gap-2 lg:gap-3">
                  {/* Number badge */}
                  <div className={cn(
                    "w-5 h-5 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-md flex items-center justify-center text-[9px] sm:text-xs lg:text-sm font-black flex-shrink-0 mt-0.5 transition-all duration-300 border border-black",
                    isExpanded
                      ? "bg-[#dc2626] text-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                      : "bg-white text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                  )}>
                    {questionId}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Tags row */}
                    <div className="flex items-center gap-1 lg:gap-2 mb-0.5 flex-wrap">
                      <span className={cn(
                        "text-[7px] sm:text-[9px] lg:text-[10px] font-black px-1.5 py-0.5 rounded border uppercase tracking-wider flex items-center gap-1",
                        typeStyle.bg, typeStyle.text, typeStyle.border
                      )}>
                        {isNeutral ? <ShieldCheck className="h-2 w-2 lg:h-2.5 lg:w-2.5" /> : <AlertTriangle className="h-2 w-2 lg:h-2.5 lg:w-2.5" />}
                        {isNeutral ? "Neutral" : biasLevel}
                      </span>
                      {!isNeutral && (
                        <span className="text-[7px] sm:text-[9px] lg:text-[10px] text-[#86868B] font-medium flex items-center gap-1">
                          Score: <span className={cn("font-bold", typeStyle.text)}>{score}</span>
                        </span>
                      )}
                      {q.detectionMethod && (
                        <span className="hidden sm:inline text-[7px] sm:text-[9px] lg:text-[10px] text-[#86868B] font-medium">
                          · {q.detectionMethod === "full" ? "AI Detected" : "Rule Detected"}
                        </span>
                      )}
                      {q.flags && q.flags.length > 0 && (
                        <div className="hidden sm:flex flex-wrap gap-1">
                          <span className="text-[7px] sm:text-[9px] lg:text-[10px] text-[#86868B] font-medium">·</span>
                          {q.flags.map((f, fi) => (
                            <span key={fi} className="text-[7px] sm:text-[9px] lg:text-[10px] text-[#86868B] font-medium uppercase tracking-wider">
                              {f.category}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Question text */}
                    <p className="text-[10px] sm:text-xs md:text-sm lg:text-base xl:text-lg font-semibold text-[#1D1D1F] leading-snug tracking-tight highlight-container mt-0.5" dangerouslySetInnerHTML={{ __html: q.highlighted || q.original }} />
                  </div>

                  {/* Expand icon */}
                  <span className={cn(
                    "text-[#86868B] flex-shrink-0 transition-transform duration-300 text-xs lg:text-sm mt-1",
                    isExpanded ? "rotate-180" : ""
                  )}>
                    ↓
                  </span>
                </div>
              </button>

              {/* Expanded content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden bg-[#dc2626]/[0.01]"
                  >
                    <div className="p-2 sm:p-2.5 lg:p-4 xl:p-5 space-y-1.5 lg:space-y-3 xl:space-y-4 border-t border-black/[0.04]">
                      {isNeutral ? (
                        <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-2 sm:p-2.5 lg:p-5 xl:p-6 text-center shadow-[2px_2px_0px_0px_rgba(16,185,129,0.06)]">
                          <ShieldCheck className="w-5 h-5 lg:w-7 lg:h-7 text-emerald-500 mx-auto mb-1" />
                          <p className="text-[9px] lg:text-xs font-black text-emerald-700 uppercase tracking-widest">Compliance Verified</p>
                          <p className="text-[9px] lg:text-xs text-emerald-600/80 font-medium mt-0.5">This question passed our fairness checks. No significant bias detected.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5 sm:gap-2.5 lg:gap-4 xl:gap-5">
                          {/* Left: Issues & Rationale */}
                          <div className="space-y-1.5 lg:space-y-3">
                            {/* Primary issue badge */}
                            {q.primary_issue && (
                              <div className="bg-red-50 border border-red-100 rounded-lg p-1.5 lg:p-3 flex items-center gap-1.5 lg:gap-3">
                                <div className="w-5 h-5 lg:w-7 lg:h-7 rounded-md bg-red-100 border border-red-200 flex items-center justify-center flex-shrink-0">
                                  <AlertTriangle className="w-2.5 h-2.5 lg:w-3.5 lg:h-3.5 text-red-600" />
                                </div>
                                <div>
                                  <p className="text-[7px] lg:text-[9px] font-black text-red-600 uppercase tracking-widest">Primary Violation</p>
                                  <p className="text-[9px] sm:text-[10px] lg:text-xs xl:text-sm font-bold text-red-900 leading-tight">{q.primary_issue}</p>
                                </div>
                              </div>
                            )}

                            {/* Detailed rationale card */}
                            <div className="bg-white border border-black rounded-lg p-1.5 lg:p-3 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,0.02)]">
                              <div className="flex items-center gap-1 mb-0.5">
                                <Info className="w-2.5 h-2.5 lg:w-3.5 lg:h-3.5 text-indigo-600" />
                                <p className="text-[7px] lg:text-[9px] font-black text-indigo-600 uppercase tracking-widest">Bias Rationale</p>
                              </div>
                              <p className="text-[9.5px] sm:text-[10.5px] lg:text-xs xl:text-sm text-[#1D1D1F] font-medium leading-snug italic">
                                "{q.explanation || "This question contains potential bias markers that may inadvertently exclude qualified candidates based on non-essential criteria."}"
                              </p>
                            </div>

                            {/* Law Violation */}
                            {(lawText || score > 40) && (
                              <LawViolationBadge
                                violation={q.law_violation}
                                indiaLawViolation={q.india_analysis?.indian_law_violation}
                              />
                            )}

                            {/* India Analysis (Industrial Card) */}
                            {q.india_analysis && q.india_analysis.india_bias_score > 0 && (
                              <FeatureGate
                                feature="india_bias_flags"
                                requiredPlan="starter"
                                customPrompt="Unlock India-specific bias flags: caste signalling, regional discrimination, institution elitism, and colorism."
                              >
                                <div className="bg-white border border-black rounded-xl p-2 lg:p-4 shadow-[2.5px_2.5px_0px_0px_rgba(249,115,22,0.06)] space-y-1.5 lg:space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                      <Flag className="h-3 w-3 lg:h-4 lg:w-4 text-orange-600" />
                                      <span className="text-[7px] lg:text-[9px] font-black text-orange-600 uppercase tracking-widest">
                                        India-Specific Context
                                      </span>
                                    </div>
                                    {q.india_analysis.verdict && (
                                      <span className={cn(
                                        "text-[7px] lg:text-[9px] font-black px-1.5 py-0.5 rounded border uppercase tracking-wider",
                                        q.india_analysis.verdict === "SEVERELY_BIASED" ? "bg-red-50 text-red-700 border-red-200" :
                                        "bg-orange-50 text-orange-700 border-orange-200"
                                      )}>
                                        {q.india_analysis.verdict.replace("_", " ")}
                                      </span>
                                    )}
                                  </div>
                                  
                                  <div className="flex flex-wrap gap-1 lg:gap-2">
                                    {q.india_analysis.categories?.map((cat, ci) => (
                                      <span key={ci} className="text-[7px] lg:text-[9px] px-1.5 py-0.5 rounded border border-black bg-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] uppercase tracking-tight font-black">
                                        {cat.replace(/_/g, " ")}
                                      </span>
                                    ))}
                                  </div>

                                  {q.india_analysis.explanation && (
                                    <p className="text-[9px] lg:text-xs xl:text-sm text-slate-600 font-medium leading-relaxed border-l-2 border-orange-200 pl-2">
                                      {q.india_analysis.explanation}
                                    </p>
                                  )}
                                </div>
                              </FeatureGate>
                            )}
                          </div>

                          {/* Right: Recommended Rewrite */}
                          <div className="space-y-1.5 lg:space-y-3">
                            <div className="bg-white border border-black rounded-xl overflow-hidden shadow-[2px_2px_0px_0px_rgba(16,185,129,0.03)]">
                              <div className="p-1.5 lg:p-3 border-b border-black/[0.04] bg-emerald-50/[0.3]">
                                <div className="flex items-center gap-1">
                                  <ShieldCheck className="w-2.5 h-2.5 lg:w-3.5 lg:h-3.5 text-emerald-600" />
                                  <p className="text-[7px] lg:text-[9px] font-black text-emerald-600 uppercase tracking-widest">Fairness Reconstruction</p>
                                </div>
                              </div>
                              <BlurredRewritePreview
                                rewrittenQuestion={q.improved_question}
                                originalQuestion={q.original}
                                questionIndex={idx}
                                onCopy={handleCopy}
                                copiedId={copiedId}
                              />
                            </div>

                            {/* Signals / Tags */}
                            {signals.length > 0 && (
                              <div className="flex flex-wrap gap-1 lg:gap-2">
                                {signals.map((sig, si) => (
                                  <span key={si} className="text-[7px] lg:text-[9px] font-black px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded uppercase tracking-wider">
                                    # {sig}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
