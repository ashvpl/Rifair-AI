"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft, AlertTriangle, CheckCircle, Lock,
  RefreshCw, Check, Download, Activity, Loader2,
  ChevronDown, ChevronUp, Search, Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CandidateEvaluator } from "@/components/evaluation/CandidateEvaluator";
import ExportButton from "@/components/pdf/ExportButton";
import { useBackendToken } from "@/hooks/useBackendToken";


// ── Types ────────────────────────────────────────────────────────────────────

interface BiasItem {
  bias_score: number;
  score?: number;
  tags: string[];
  severity: string;
  oneLiner: string;
  explanation: string;
  type: string;
  competency: string;
}

interface AuditData {
  id: string;
  title: string;
  createdAt: string;
  overallScore: number;
  questionCount: number;
  questions: string[];
  biasBreakdown: BiasItem[];
  typeDistribution: Record<string, number>;
  structuralAnalysis: any;
  competencyGaps: any[] | null;
  redundancyFlags: any[] | null;
  suggestedAdditions: any[] | null;
  planTier: string;
  role?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score > 70) return { 
    pill: "bg-red-100 text-red-700", 
    ring: "border-red-200", 
    circle: "bg-red-100 text-red-700",
    gradient: "from-[#10b981] to-[#059669]", // Branded Green gradient
    text: "text-red-600",
    border: "border-red-100"
  };
  if (score > 40) return { 
    pill: "bg-amber-100 text-amber-700", 
    ring: "border-amber-200", 
    circle: "bg-amber-100 text-amber-700",
    gradient: "from-[#10b981] to-[#059669]", // Branded Green gradient
    text: "text-amber-600",
    border: "border-amber-100"
  };
  return { 
    pill: "bg-emerald-100 text-emerald-700", 
    ring: "border-emerald-200", 
    circle: "bg-emerald-100 text-emerald-700",
    gradient: "from-[#10b981] to-[#059669]",
    text: "text-[#10b981]",
    border: "border-emerald-100"
  };
}

const TYPE_STYLES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  behavioral:  { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',  dot: 'bg-blue-400' },
  technical:   { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-400' },
  situational: { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  dot: 'bg-amber-400' },
  leadership:  { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-400' },
}

// ── QuestionCard ─────────────────────────────────────────────────────────────

function QuestionCard({
  question,
  bias,
  index,
  auditId,
  planTier,
  onUpdateQuestion,
}: {
  question: string;
  bias: BiasItem;
  index: number;
  auditId: string;
  planTier: string;
  onUpdateQuestion?: (index: number, newText: string) => void;
}) {
  const { getAuthToken } = useBackendToken();
  const rawScore  = bias.bias_score ?? bias.score ?? 0;
  const originallyFlagged = rawScore > 20;
  const isPaid    = ["starter", "growth", "enterprise"].includes(planTier);

  const [expanded, setExpanded]       = useState(originallyFlagged);
  const [rewrite, setRewrite]         = useState<string | null>(null);
  const [applied, setApplied]         = useState(false);
  const [displayQ, setDisplayQ]       = useState(question);
  const [loadingRW, setLoadingRW]     = useState(false);
  const [rwError, setRwError]         = useState<string | null>(null);
  const [previousRewrites, setPrevious] = useState<string[]>([]);

  const score  = applied ? 0 : rawScore;
  const colors = scoreColor(score);
  const typeStyle = TYPE_STYLES[bias.type?.toLowerCase()] ?? TYPE_STYLES.behavioral;

  const handleRewrite = async () => {
    setLoadingRW(true);
    setRwError(null);
    try {
      const token = await getAuthToken();
      if (!token) return;
      const res = await fetch(`/api/kit-audit/${auditId}/rewrite`, {
        method:  "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body:    JSON.stringify({ questionIndex: index, previousRewrites }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRwError(data.message || data.error || "Rewrite failed. Try again.");
        return;
      }
      setRewrite(data.rewrite);
      setPrevious((p) => [...p, data.rewrite]);
    } catch {
      setRwError("Something went wrong. Try again.");
    } finally {
      setLoadingRW(false);
    }
  };

  const applyRewrite = () => {
    if (!rewrite) return;
    setDisplayQ(rewrite);
    setApplied(true);
    if (onUpdateQuestion) {
      onUpdateQuestion(index, rewrite);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "bg-white border rounded-2xl overflow-hidden transition-all duration-200",
        expanded
          ? originallyFlagged && !applied ? `border-red-200 shadow-[0_2px_20px_rgba(220,38,38,0.06)]` : "border-[#10b981]/30 shadow-[0_2px_20px_rgba(16,185,129,0.06)]"
          : "border-black/[0.05] hover:border-black/[0.1]",
        applied && "ring-2 ring-emerald-200 border-emerald-300"
      )}
    >
      {/* ── Question header ────────────────────────────────────── */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 md:p-6 cursor-pointer min-h-[72px] active:bg-[#F9F9F9] transition-colors"
      >
        <div className="flex items-start gap-4">
          {/* Index + score badge */}
          <div className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5 transition-all duration-200",
            expanded
              ? "bg-[#10b981] text-white shadow-sm"
              : "bg-[#F5F5F7] text-[#86868B]"
          )}>
            {index + 1}
          </div>

          <div className="flex-1 min-w-0">
            {/* Tags row */}
            <div className="flex items-center gap-2 mb-2.5 flex-wrap">
              <span className={cn(
                "text-[10px] font-bold px-2.5 py-1 rounded-lg border capitalize tracking-wide",
                typeStyle.bg, typeStyle.text, typeStyle.border
              )}>
                {bias.type || 'behavioral'}
              </span>
              
              {applied ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                  <Check className="w-3 h-3" /> Rewritten
                </span>
              ) : originallyFlagged ? (
                <span className={cn("text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider", colors.pill, colors.ring)}>
                  Bias Risk: {score}%
                </span>
              ) : (
                <span className="text-[10px] font-black px-2.5 py-1 rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-700 uppercase tracking-wider">
                  Clean
                </span>
              )}

              {bias.competency && (
                <span className="text-[11px] text-[#86868B] font-medium ml-1">
                  · {bias.competency}
                </span>
              )}
            </div>

            <p className={cn(
              "text-[15px] font-semibold leading-relaxed tracking-[-0.01em]",
              applied ? "text-emerald-900" : "text-[#1D1D1F]"
            )}>
              {displayQ}
            </p>
          </div>

          {/* Expand icon */}
          <span className={cn(
            "text-[#86868B] flex-shrink-0 transition-transform duration-300 text-lg",
            expanded ? "rotate-180" : ""
          )}>
            ↓
          </span>
        </div>
      </button>

      {/* ── Expanded: explanation + rewrite ──────────────────── */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 md:px-6 pb-6 space-y-4 border-t border-black/[0.04] pt-5">
              
              {/* Bias Details for flagged questions */}
              {originallyFlagged && !applied && (
                <div className="space-y-4">
                  <div className="p-4 bg-red-50/60 rounded-2xl border border-red-100">
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5" /> Issue Detected
                    </p>
                    <p className="text-sm text-red-900 leading-relaxed font-medium">
                      {bias.explanation}
                    </p>
                    {bias.tags && bias.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {bias.tags.map(tag => (
                          <span key={tag} className="text-[10px] font-bold uppercase tracking-wider bg-white/50 text-red-700 px-2 py-0.5 rounded-lg border border-red-100/50">
                            {tag.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Rewrite section */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-[#86868B] uppercase tracking-[0.1em] mb-1">
                      AI Recommendation
                    </p>
                    
                    {!isPaid ? (
                      <div className="relative p-6 bg-emerald-50/30 rounded-2xl border border-emerald-100/60 overflow-hidden text-center">
                        <div className="absolute inset-0 backdrop-blur-[2px] bg-white/60 rounded-2xl flex flex-col items-center justify-center gap-3 z-10 p-4">
                          <Lock className="w-6 h-6 text-[#86868B]" />
                          <div>
                            <p className="text-sm font-bold text-[#1D1D1F]">AI Rewrites available in Starter+</p>
                            <p className="text-[11px] text-[#86868B] mt-1">Unlock expert-vetted neutral phrasing.</p>
                          </div>
                          <Link
                            href="/pricing?reason=audit_rewrite"
                            className="px-6 py-2 bg-[#10b981] text-white text-[11px] font-black rounded-xl active:scale-95 transition-transform uppercase tracking-widest"
                          >
                            Upgrade Now →
                          </Link>
                        </div>
                        <div className="space-y-2 opacity-30 select-none">
                          <div className="h-4 bg-emerald-200 rounded-lg w-full" />
                          <div className="h-4 bg-emerald-200 rounded-lg w-3/4 mx-auto" />
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-3">Neutral AI Rewrite</p>

                        {loadingRW ? (
                          <div className="flex items-center gap-3 py-4 justify-center">
                            <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                            <span className="text-sm text-emerald-700 font-bold">Generating expert phrasing…</span>
                          </div>
                        ) : rewrite ? (
                          <p className="text-sm text-emerald-900 font-medium leading-relaxed mb-4">{rewrite}</p>
                        ) : (
                          <p className="text-[13px] text-emerald-700/70 italic mb-4">
                            Need a safer way to ask this? Click below.
                          </p>
                        )}

                        {rwError && (
                          <p className="text-xs text-red-600 font-medium mb-4">{rwError}</p>
                        )}

                        {!applied && (
                          <div className="flex items-center gap-3">
                            {rewrite && (
                              <button
                                onClick={applyRewrite}
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#10b981] text-white text-[11px] font-black rounded-xl active:scale-[0.98] transition-all uppercase tracking-widest shadow-lg shadow-emerald-900/10"
                              >
                                <Check className="w-4 h-4" /> Use this version
                              </button>
                            )}
                            <button
                              onClick={handleRewrite}
                              disabled={loadingRW}
                              className={cn(
                                "flex items-center justify-center gap-2 py-3 px-6 border border-emerald-200 text-emerald-700 text-[11px] font-bold rounded-xl active:bg-emerald-100 transition-colors disabled:opacity-50 uppercase tracking-widest",
                                !rewrite && "flex-1"
                              )}
                            >
                              <RefreshCw className={cn("w-3.5 h-3.5", loadingRW && "animate-spin")} />
                              {rewrite ? "Try another" : "Generate neutral rewrite"}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Success message for clean questions */}
              {!originallyFlagged && (
                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm">
                    ✓
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">High Fairness Score</p>
                    <p className="text-[13px] text-emerald-700 font-medium">This question is structured fairly and avoids common bias triggers.</p>
                  </div>
                </div>
              )}

              {applied && (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
                    ✓
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Issue Resolved</p>
                    <p className="text-[13px] text-emerald-700 font-medium">The question has been updated with the AI-suggested neutral version.</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── KitActions ────────────────────────────────────────────────────────────────

function KitActions({ 
  onEvaluate 
}: { 
  onEvaluate: () => void 
}) {
  return (
    <div className="bg-white border border-black/[0.05] rounded-3xl p-8 text-center shadow-sm relative overflow-hidden mt-12">
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-emerald-50 to-transparent rounded-full blur-[60px]" />
      
      <div className="relative z-10 max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-2 text-2xl border border-emerald-100">
          📋
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#1D1D1F] mb-2">
            Ready to interview?
          </h3>
          <p className="text-sm font-medium text-[#86868B] leading-relaxed">
            After conducting the interview, evaluate the candidate using these questions. Score their answers and get an AI-powered hiring recommendation.
          </p>
        </div>

        <div className="pt-4">
          <button
            onClick={onEvaluate}
            className="w-full bg-[#10b981] text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-[#059669] shadow-lg shadow-[#10b981]/20 hover:shadow-[#10b981]/30 hover:-translate-y-0.5 transition-all"
          >
            Evaluate Candidate ↗
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function AuditResultPage() {
  const { isLoaded, userId } = useAuth();
  const { getAuthToken } = useBackendToken();
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();
  const [audit, setAudit]     = useState<AuditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [showEvaluator, setShowEvaluator] = useState(false);

  useEffect(() => {
    if (!id || !isLoaded || !userId) return;
    (async () => {
      try {
        const token = await getAuthToken();
        if (!token) return;
        const res  = await fetch(`/api/kit-audit/${id}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setAudit(data);
      } catch {
        setError("Could not load the audit report.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isLoaded, userId, getAuthToken]);

  const handleUpdateQuestion = async (index: number, newText: string) => {
    if (!audit) return;
    
    // Update local state immediately for UI responsiveness
    setAudit(prev => {
      if (!prev) return null;
      const newQuestions = [...prev.questions];
      newQuestions[index] = newText;
      return { ...prev, questions: newQuestions };
    });

    // Persist to DB in the background
    try {
      const token = await getAuthToken();
      if (!token) return;
      await fetch(`/api/kit-audit/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          questions: audit.questions.map((q, i) => i === index ? newText : q)
        })
      });
    } catch (err) {
      console.error('Failed to persist question update:', err);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#86868B] font-medium">Loading audit report…</p>
        </div>
      </div>
    );
  }

  if (error || !audit) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center text-center px-4">
        <div>
          <p className="text-[#86868B] font-medium mb-3">{error || "Audit not found."}</p>
          <Link href="/kit" className="text-sm font-bold text-[#10b981] underline underline-offset-2">
            ← Back to Kits
          </Link>
        </div>
      </div>
    );
  }

  const isPaid       = ["starter", "growth", "enterprise"].includes(audit.planTier);
  const flaggedCount = audit.biasBreakdown.filter((b) => (b.bias_score ?? b.score ?? 0) > 20).length;
  const cleanCount   = audit.questionCount - flaggedCount;
  const colors       = scoreColor(audit.overallScore);

  const types = ["all", ...Array.from(new Set(audit.biasBreakdown.map(b => b.type || 'behavioral')))];

  // Construct kit object for Evaluator
  const kitForEvaluator = {
    id: audit.id,
    kit_title: audit.title,
    role: audit.role || "Target Role",
    experience_level: "mid-level",
    company_type: "product company",
    kit_summary: "Custom audited kit for interview evaluation.",
    questions: audit.questions.map((q, i) => ({
      id: i + 1,
      question: q,
      competency: audit.biasBreakdown[i].competency || "General",
      type: audit.biasBreakdown[i].type || "behavioral"
    }))
  };

  if (showEvaluator) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto pt-2 pb-16">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => setShowEvaluator(false)}
            className="w-10 h-10 rounded-2xl bg-white border border-black/[0.05] flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] shadow-sm transition-all active:scale-95"
          >
            ←
          </button>
          <div>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">Evaluation Mode</p>
            <h2 className="text-xl md:text-2xl font-bold text-[#1D1D1F]">
              {audit.title}
            </h2>
          </div>
        </div>
        <CandidateEvaluator kit={kitForEvaluator} />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto pt-2 pb-16 px-0 animate-in fade-in duration-500 space-y-6">

      {/* ── Premium Header ──────────────────────────────────────────────── */}
      <div className={cn("bg-gradient-to-br rounded-[1.75rem] p-6 md:p-8 text-white relative overflow-hidden shadow-lg", colors.gradient)}>
        {/* Decorative blur */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/[0.04] rounded-full blur-[80px]" />

        <div className="flex items-start justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
               <Link
                href="/kit"
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-colors shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <p className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em]">
                Kit Audit Report
              </p>
            </div>
            <h1 className="text-lg md:text-2xl font-bold leading-snug">
              {audit.title}
            </h1>
            <p className="text-sm text-white/70 font-medium leading-relaxed max-w-xl">
              Analysis of {audit.questionCount} interview questions for bias, fairness, and structural integrity.
            </p>
          </div>
          
          <div className="text-right flex-shrink-0 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <div className="text-3xl font-black tabular-nums leading-none">
              {audit.overallScore}
            </div>
            <div className="text-[9px] font-black text-white/60 uppercase tracking-widest mt-1.5">
              Bias Score
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-8 mt-8 pt-6 border-t border-white/10 relative z-10">
          <div className="shrink-0 text-center md:text-left">
            <div className="flex items-center gap-2 mb-0.5">
               <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_white] animate-pulse" />
               <div className="text-xl font-black tabular-nums">{audit.questionCount}</div>
            </div>
            <div className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Questions</div>
          </div>
          
          <div className="shrink-0 text-center md:text-left">
            <div className="flex items-center gap-2 mb-0.5">
               <CheckCircle className="w-4 h-4 text-emerald-300" />
               <div className="text-xl font-black tabular-nums">{cleanCount}</div>
            </div>
            <div className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Clean</div>
          </div>

          <div className="shrink-0 text-center md:text-left">
            <div className="flex items-center gap-2 mb-0.5">
               <AlertTriangle className={cn("w-4 h-4", flaggedCount > 0 ? "text-amber-300" : "text-white/40")} />
               <div className="text-xl font-black tabular-nums">{flaggedCount}</div>
            </div>
            <div className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Flagged</div>
          </div>

          <div className="ml-auto hidden md:block self-center">
             <div className="px-4 py-2 bg-white/10 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest">
               {audit.overallScore > 70 ? "High Risk" : audit.overallScore > 40 ? "Moderate" : "Fair Kit"}
             </div>
          </div>
        </div>
      </div>

      {/* ── Filter Tabs ──────────────────────────────────────────────── */}
      <div className="chip-row">
        {types.map((type) => (
          <button
            key={type}
            onClick={() => setActiveFilter(type)}
            className={cn(
              "text-[11px] font-black px-5 py-2.5 rounded-full border transition-all duration-200 capitalize whitespace-nowrap shrink-0 min-h-[36px] uppercase tracking-widest",
              activeFilter === type
                ? "bg-[#1D1D1F] text-white border-[#1D1D1F] shadow-md"
                : "bg-white text-[#86868B] border-black/[0.06] hover:border-black/[0.12] hover:bg-[#F5F5F7]"
            )}
          >
            {type === 'all'
              ? `All (${audit.questionCount})`
              : `${type} (${audit.biasBreakdown.filter(b => (b.type || 'behavioral') === type).length})`
            }
          </button>
        ))}
      </div>

      {/* ── Question cards ────────────────────────────────────────────── */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {audit.questions.map((question, i) => {
            const bias = audit.biasBreakdown[i] || { bias_score: 0, tags: [], severity: "NONE", oneLiner: "", explanation: "", type: "behavioral", competency: "General" };
            if (activeFilter !== "all" && (bias.type || "behavioral") !== activeFilter) return null;

            return (
              <QuestionCard
                key={i}
                question={question}
                bias={bias}
                index={i}
                auditId={audit.id}
                planTier={audit.planTier}
                onUpdateQuestion={handleUpdateQuestion}
              />
            );
          })}
        </AnimatePresence>
      </div>

      {/* ── Structural analysis (paid) ────────────────────────────────── */}
      {isPaid && audit.structuralAnalysis && (
        <div className="bg-white rounded-[2rem] border border-black/[0.06] p-6 md:p-10 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100">
              <Activity className="w-5 h-5 text-[#10b981]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#1D1D1F]">Structural Analysis</h3>
              <p className="text-xs text-[#86868B] font-medium mt-0.5">Deeper insights into kit coverage and balance.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Competency gaps */}
            {audit.competencyGaps && audit.competencyGaps.length > 0 && (
              <div className="space-y-4">
                <p className="text-[10px] font-black text-[#86868B] uppercase tracking-widest">Competency Gaps</p>
                <div className="space-y-2.5">
                  {audit.competencyGaps.map((gap: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-[#F5F5F7]/60 rounded-2xl border border-black/[0.02]">
                      <div>
                        <p className="text-sm font-bold text-[#1D1D1F]">{gap.competency}</p>
                        {gap.reason && <p className="text-[11px] text-[#86868B] mt-0.5 leading-tight">{gap.reason}</p>}
                      </div>
                      <span className={cn(
                        "text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shrink-0 ml-3 border",
                        gap.severity === "high" ? "bg-red-100 text-red-700 border-red-200" : "bg-amber-100 text-amber-700 border-amber-200"
                      )}>
                        {gap.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Redundancy flags */}
            {audit.redundancyFlags && audit.redundancyFlags.length > 0 && (
              <div className="space-y-4">
                <p className="text-[10px] font-black text-[#86868B] uppercase tracking-widest">Redundancy Alerts</p>
                <div className="space-y-2.5">
                  {audit.redundancyFlags.map((flag: any, i: number) => (
                    <div key={i} className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100">
                      <p className="text-[11px] font-black text-amber-800 mb-1 uppercase tracking-wider">
                        Questions {(flag.questionIndices ?? []).map((idx: number) => idx + 1).join(" & ")}
                      </p>
                      <p className="text-[13px] text-amber-900 font-medium leading-relaxed">{flag.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Suggested additions */}
          {audit.suggestedAdditions && audit.suggestedAdditions.length > 0 && (
            <div className="mt-10 space-y-4">
              <p className="text-[10px] font-black text-[#86868B] uppercase tracking-widest">Expert Additions</p>
              <div className="grid md:grid-cols-2 gap-3">
                {audit.suggestedAdditions.map((add: any, i: number) => (
                  <div key={i} className="p-5 bg-[#0a3d2e]/[0.03] rounded-2xl border border-[#0a3d2e]/10 relative group">
                    <div className="flex justify-between items-start mb-2">
                       <p className="text-[10px] font-black text-[#10b981] uppercase tracking-widest">{add.competency}</p>
                       <span className="text-[9px] font-black uppercase tracking-widest text-[#86868B] bg-white border border-black/[0.05] px-2 py-0.5 rounded-lg">
                        {add.type}
                      </span>
                    </div>
                    <p className="text-sm text-[#1D1D1F] font-semibold leading-relaxed mb-1">{add.suggestedQuestion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Upgrade CTA for free users ────────────────────────────────── */}
      {!isPaid && (
        <div className="bg-gradient-to-br from-[#10b981] to-[#059669] rounded-[2rem] p-8 text-white text-center shadow-xl relative overflow-hidden group">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-[80px] group-hover:scale-110 transition-transform duration-700" />
          
          <div className="relative z-10 space-y-6 max-w-lg mx-auto">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto border border-white/10 backdrop-blur-sm shadow-xl">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black tracking-tight">Unlock Full Kit Intelligence</h3>
              <p className="text-sm text-white/80 font-medium leading-relaxed">
                Starter reveals competency gaps, redundant questions, and expert AI rewrites to help you hire faster and fairer.
              </p>
            </div>
            <Link
              href="/pricing?reason=audit_structural"
              className="inline-flex items-center justify-center h-14 px-10 bg-white text-[#10b981] text-xs font-black rounded-2xl active:scale-95 transition-all shadow-xl uppercase tracking-widest hover:bg-emerald-50"
            >
              Get Expert Analysis →
            </Link>
          </div>
        </div>
      )}

      {/* ── Actions ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <ExportButton 
          type="audit" 
          id={audit.id} 
          planTier={audit.planTier} 
          label="Export Audit PDF"
          className="flex-1"
        />

        <Link
          href="/kit?tab=audit"
          className="flex-1 bg-[#1D1D1F] text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-center active:scale-[0.98] transition-all shadow-lg hover:bg-black"
        >
          Audit Another Kit
        </Link>
      </div>

      {/* ── Evaluation CTA ───────────────────────────────────────────── */}
      <KitActions onEvaluate={() => setShowEvaluator(true)} />
    </div>
  );
}
