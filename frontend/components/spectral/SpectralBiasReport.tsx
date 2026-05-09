"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, AlertTriangle, Flag } from "lucide-react";
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
    <div className="space-y-3">
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
                "bg-white border rounded-2xl overflow-hidden transition-all duration-200",
                isExpanded
                  ? "border-[#dc2626]/30 shadow-[0_2px_20px_rgba(220,38,38,0.06)]"
                  : "border-black/[0.05] hover:border-black/[0.1]"
              )}
            >
              {/* Question header */}
              <button
                onClick={() => setExpanded(isExpanded ? null : questionId)}
                className="w-full text-left p-5 md:p-6 cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  {/* Number badge */}
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5 transition-all duration-200",
                    isExpanded
                      ? "bg-[#dc2626] text-white shadow-lg"
                      : "bg-[#dc2626]/5 text-[#dc2626]"
                  )}>
                    {questionId}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Tags row */}
                    <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                      <span className={cn(
                        "text-[10px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wide flex items-center gap-1",
                        typeStyle.bg, typeStyle.text, typeStyle.border
                      )}>
                        {isNeutral ? <ShieldCheck className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                        {isNeutral ? "Neutral" : biasLevel}
                      </span>
                      {!isNeutral && (
                        <span className="text-[11px] text-[#86868B] font-medium flex items-center gap-1">
                          Score: <span className={cn("font-bold", typeStyle.text)}>{score}</span>
                        </span>
                      )}
                      {q.detectionMethod && (
                        <span className="hidden sm:inline text-[11px] text-[#86868B] font-medium">
                          · {q.detectionMethod === "full" ? "AI Detected" : "Rule Detected"}
                        </span>
                      )}
                      {q.flags && q.flags.length > 0 && (
                        <div className="hidden sm:flex flex-wrap gap-1">
                          <span className="text-[11px] text-[#86868B] font-medium">·</span>
                          {q.flags.map((f, fi) => (
                            <span key={fi} className="text-[10px] text-[#86868B] font-medium uppercase tracking-wider">
                              {f.category}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Question text */}
                    <p className="text-[15px] font-semibold text-[#1D1D1F] leading-relaxed tracking-[-0.01em] highlight-container" dangerouslySetInnerHTML={{ __html: q.highlighted || q.original }} />
                  </div>

                  {/* Expand icon */}
                  <span className={cn(
                    "text-[#86868B] flex-shrink-0 transition-transform duration-300 text-lg",
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
                    {isNeutral ? (
                       <div className="px-5 md:px-6 pb-6 space-y-4 border-t border-black/[0.04] pt-5">
                          <div className="p-4 bg-emerald-50/50 border border-emerald-100/60 rounded-xl">
                            <p className="text-[13px] text-emerald-800 leading-relaxed font-medium flex items-center gap-2">
                              <ShieldCheck className="h-4 w-4 text-emerald-600" />
                              This question passed our fairness checks. No significant bias detected.
                            </p>
                          </div>
                       </div>
                    ) : (
                      <div className="px-5 md:px-6 pb-6 space-y-6 border-t border-black/[0.04] pt-5">
                        
                        {/* Issues Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-6">
                            
                            {/* Primary issue */}
                            {q.primary_issue && (
                              <div className="bg-red-50/70 border border-red-100 rounded-xl p-3.5">
                                <p className="text-[10px] font-bold text-red-500 uppercase tracking-[0.1em] mb-1">
                                  Primary Issue
                                </p>
                                <p className="text-[13px] text-red-700 leading-relaxed">
                                  {q.primary_issue}
                                </p>
                              </div>
                            )}

                            {/* Full 3-layer explanation (Starter) */}
                            <FeatureGate
                              feature="explanation_full"
                              requiredPlan="starter"
                              customPrompt="Unlock the full 3-layer bias explanation — what it is, who it harms, and what assumption it makes."
                            >
                              {q.explanation && (
                                <div>
                                  <p className="text-[10px] font-bold text-[#86868B] uppercase tracking-[0.1em] mb-1.5">
                                    Why This Is Biased
                                  </p>
                                  <p className="text-[13px] text-[#424245] leading-relaxed italic">
                                    {q.explanation}
                                  </p>
                                </div>
                              )}
                            </FeatureGate>

                            {/* Indian law violation badge (Starter) */}
                            {(lawText || score > 30) && (
                              <LawViolationBadge
                                violation={q.law_violation}
                                indiaLawViolation={q.india_analysis?.indian_law_violation}
                              />
                            )}

                            {/* India-specific bias flags (Starter) */}
                            {q.india_analysis && q.india_analysis.india_bias_score > 0 && (
                              <FeatureGate
                                feature="india_bias_flags"
                                requiredPlan="starter"
                                customPrompt="Unlock India-specific bias flags: caste signalling, regional discrimination, institution elitism, and colorism."
                              >
                                <div className="p-3.5 bg-gradient-to-br from-orange-50/80 to-green-50/80 rounded-2xl border border-orange-200/40 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Flag className="h-3.5 w-3.5 text-orange-600" />
                                    <span className="text-[10px] font-black text-orange-700 uppercase tracking-[0.15em]">
                                      🇮🇳 India-Specific Bias
                                    </span>
                                    {q.india_analysis.verdict && (
                                      <span className={cn(
                                        "text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ml-auto",
                                        q.india_analysis.verdict === "SEVERELY_BIASED" ? "bg-red-100 text-red-700" :
                                        q.india_analysis.verdict === "BIASED"          ? "bg-orange-100 text-orange-700" :
                                        q.india_analysis.verdict === "MILD_BIAS"       ? "bg-amber-100 text-amber-700" :
                                        "bg-green-100 text-green-700"
                                      )}>
                                        {q.india_analysis.verdict.replace("_", " ")}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {q.india_analysis.categories?.map((cat, ci) => (
                                      <span key={ci} className="text-[9px] px-2.5 py-1 rounded-full font-bold border bg-orange-50 text-orange-700 border-orange-200/60 capitalize">
                                        {cat.replace(/_/g, " ")}
                                      </span>
                                    ))}
                                  </div>
                                  {q.india_analysis.explanation && (
                                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                      {q.india_analysis.explanation}
                                    </p>
                                  )}
                                </div>
                              </FeatureGate>
                            )}

                            {/* Removed KeywordHighlighter to prevent duplicating the question text */}
                          </div>

                          <div className="space-y-6 flex flex-col">
                            {/* Blurred / full rewrite */}
                            <div className="flex-1">
                              <p className="text-[10px] font-bold text-[#86868B] uppercase tracking-[0.1em] mb-2">
                                Recommended Rewrite
                              </p>
                              <BlurredRewritePreview
                                rewrittenQuestion={q.improved_question}
                                originalQuestion={q.original}
                                questionIndex={idx}
                                onCopy={handleCopy}
                                copiedId={copiedId}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
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
