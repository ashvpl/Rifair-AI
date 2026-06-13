"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useBackendToken } from "@/hooks/useBackendToken";
import { getWorkflowDetails } from "@/lib/workflows/workflowService";
import { HiringWorkflowRow, WorkflowOutputRow } from "@/lib/workflows/types";
import { CandidateEvaluationForm } from "@/components/workflows/CandidateEvaluationForm";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertTriangle, CheckCircle2, Users } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function WorkflowEvaluatePage() {
  const params = useParams();
  const router = useRouter();
  const { isLoaded, userId } = useAuth();
  const { getAuthToken } = useBackendToken();

  const workflowId = params?.id as string;

  const [config, setConfig] = useState<HiringWorkflowRow | null>(null);
  const [outputs, setOutputs] = useState<WorkflowOutputRow | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<any | null>(null);

  useEffect(() => {
    const init = async () => {
      if (!isLoaded || !userId || !workflowId) return;
      setIsLoading(true);
      try {
        const t = await getAuthToken();
        if (!t) throw new Error("No auth token.");
        setToken(t);
        const details = await getWorkflowDetails(workflowId, t);
        setConfig(details.config);
        setOutputs(details.outputs);
      } catch (err: any) {
        setError(err.message || "Failed to load workflow.");
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [isLoaded, userId, workflowId]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-black/20" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/20">Loading workflow...</p>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="max-w-md mx-auto pt-20 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <p className="text-sm font-medium text-[#86868B]">{error || "Workflow not found."}</p>
        <Link href="/dashboard/workflows">
          <button className="px-5 py-2 rounded-full bg-[#1D1D1F] text-white text-xs font-bold">Back to Workflows</button>
        </Link>
      </div>
    );
  }

  // ── Success State ──────────────────────────────────────────────────────
  if (submitted) {
    const rec = submitted.recommendation;
    const recColor =
      rec === "STRONG_HIRE" ? "text-emerald-600" :
      rec === "HIRE" ? "text-blue-600" :
      rec === "HOLD" ? "text-amber-600" :
      "text-red-500";

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto pt-16 text-center space-y-6"
      >
        <div className="w-20 h-20 mx-auto rounded-[2rem] bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-[#1D1D1F]">Evaluation Submitted</h2>
          <p className="text-sm font-medium text-[#86868B]">
            <strong className="text-[#1D1D1F]">{submitted.candidate_name}</strong> has been evaluated for{" "}
            <strong className="text-[#1D1D1F]">{config.role_title}</strong>.
          </p>
        </div>

        {rec && (
          <div className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm font-black",
            rec === "STRONG_HIRE" ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
            rec === "HIRE" ? "bg-blue-50 border-blue-200 text-blue-700" :
            rec === "HOLD" ? "bg-amber-50 border-amber-200 text-amber-700" :
            "bg-red-50 border-red-200 text-red-700"
          )}>
            Recommendation: {rec.replace(/_/g, " ")}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setSubmitted(null)}
            className="px-5 py-2.5 rounded-full border-2 border-black/10 text-sm font-bold text-[#86868B] hover:text-black hover:border-black/20 transition-colors"
          >
            <Users className="w-4 h-4 inline mr-1.5" />
            Evaluate Another
          </button>
          <Link href={`/dashboard/workflows/${workflowId}`}>
            <button className="px-5 py-2.5 rounded-full bg-[#1D1D1F] text-white font-bold text-sm hover:bg-black transition-all active:scale-95">
              Back to Workflow →
            </button>
          </Link>
        </div>
      </motion.div>
    );
  }

  // ── Main Form ──────────────────────────────────────────────────────────
  const scorecard = outputs?.scorecard ?? { criteria: [] };

  return (
    <div className="max-w-3xl mx-auto pb-12 pt-0 animate-in fade-in duration-500 space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/dashboard/workflows/${workflowId}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#86868B] hover:text-black transition-colors mb-5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Workflow
        </Link>

        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B]">Candidate Evaluation</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight">{config.role_title}</h1>
          <p className="text-sm font-medium text-[#86868B]">
            Score a candidate against the structured scorecard generated for this role.
          </p>
        </div>
      </div>

      {/* Scorecard preview bar */}
      {scorecard.criteria.length > 0 && (
        <div className="flex flex-wrap gap-2 p-4 rounded-2xl border border-black/[0.06] bg-[#F5F5F7]/50">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#86868B] self-center mr-1">Criteria:</span>
          {scorecard.criteria.map((c) => (
            <span key={c.name} className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white border border-black/[0.06] text-[#1D1D1F]">
              {c.name}
            </span>
          ))}
        </div>
      )}

      {/* Form card */}
      <div className="bg-white rounded-3xl border border-black/[0.06] p-5 md:p-7 shadow-sm">
        <CandidateEvaluationForm
          workflowId={workflowId}
          roleTitle={config.role_title}
          scorecard={scorecard}
          token={token!}
          onSuccess={(evaluation) => setSubmitted(evaluation)}
        />
      </div>
    </div>
  );
}
