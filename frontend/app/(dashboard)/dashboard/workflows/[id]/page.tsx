"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useBackendToken } from "@/hooks/useBackendToken";
import { getWorkflowDetails, getWorkflowEvaluations, deleteWorkflow } from "@/lib/workflows/workflowService";
import { HiringWorkflowRow, WorkflowOutputRow, HiringWorkflowOutput } from "@/lib/workflows/types";
import { WorkflowOverview } from "@/components/workflows/WorkflowOverview";
import { WorkflowOutputTabs } from "@/components/workflows/WorkflowOutputTabs";
import { BottomSheet } from "@/components/ui/BottomSheet";
import Link from "next/link";
import {
  ArrowLeft, Loader2, AlertTriangle, Trash2,
  Layers, RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function WorkflowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isLoaded, userId } = useAuth();
  const { getAuthToken } = useBackendToken();

  const workflowId = params?.id as string;

  const [config, setConfig] = useState<HiringWorkflowRow | null>(null);
  const [outputs, setOutputs] = useState<WorkflowOutputRow | null>(null);
  const [evaluationCount, setEvaluationCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteSheet, setShowDeleteSheet] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = async () => {
    if (!isLoaded || !userId || !workflowId) return;
    setIsLoading(true);
    setError(null);
    try {
      const token = await getAuthToken();
      if (!token) throw new Error("No auth token.");

      const [details, evaluations] = await Promise.all([
        getWorkflowDetails(workflowId, token),
        getWorkflowEvaluations(workflowId, token).catch(() => []),
      ]);

      setConfig(details.config);
      setOutputs(details.outputs);
      setEvaluationCount(Array.isArray(evaluations) ? evaluations.length : 0);
    } catch (err: any) {
      console.error("[WORKFLOW DETAIL]", err);
      setError(err.message || "Failed to load workflow.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [isLoaded, userId, workflowId]);

  const handleDelete = async () => {
    if (!workflowId) return;
    setIsDeleting(true);
    try {
      const token = await getAuthToken();
      if (!token) return;
      await deleteWorkflow(workflowId, token);
      router.push("/dashboard/workflows");
    } catch (err: any) {
      alert(err.message || "Failed to delete.");
    } finally {
      setIsDeleting(false);
      setShowDeleteSheet(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-black/20" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/20">Loading workflow...</p>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error || !config) {
    return (
      <div className="max-w-lg mx-auto pt-20 text-center space-y-5">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <div>
          <h2 className="text-lg font-black text-[#1D1D1F]">Workflow not found</h2>
          <p className="text-sm font-medium text-[#86868B] mt-1">{error || "This workflow may have been deleted."}</p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={load}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-black/10 text-xs font-bold text-[#86868B] hover:text-black transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
          <Link href="/dashboard/workflows">
            <button className="px-5 py-2 rounded-full bg-[#1D1D1F] text-white font-bold text-xs hover:bg-black transition-colors">
              Back to Workflows
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Reshape outputs ────────────────────────────────────────────────────────
  const reshapedOutputs: HiringWorkflowOutput | null = outputs
    ? {
        hiring_health_score: config.hiring_health_score,
        optimized_jd: outputs.optimized_jd,
        interview_kit: outputs.interview_kit,
        scorecard: outputs.scorecard,
        bias_review: outputs.bias_review,
        evaluation_guide: outputs.evaluation_guide,
      }
    : null;

  return (
    <div className="max-w-7xl mx-auto pb-12 pt-0 animate-in fade-in duration-500">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/dashboard/workflows"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#86868B] hover:text-black transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> All Workflows
        </Link>

        <div className="flex items-center gap-2">
          <Link href={`/dashboard/workflows/${workflowId}/evaluate`}>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1D1D1F] text-white font-bold text-xs hover:bg-black transition-all active:scale-95 shadow-sm">
              <Layers className="w-3.5 h-3.5" /> Evaluate Candidate
            </button>
          </Link>
          <button
            onClick={() => setShowDeleteSheet(true)}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-black/[0.08] text-[#86868B] hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all active:scale-90"
            title="Delete workflow"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Status badge */}
      <div className="flex items-center gap-2 mb-5">
        <span className={cn(
          "text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border",
          config.status === "active"
            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
            : "bg-[#F5F5F7] text-[#86868B] border-black/[0.05]"
        )}>
          {config.status || "Draft"}
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight">{config.role_title}</h1>
      </div>

      {/* Main 2-col layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left: Overview sticky sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full lg:w-80 xl:w-96 shrink-0 lg:sticky lg:top-6"
        >
          <WorkflowOverview
            config={config}
            outputs={reshapedOutputs}
            evaluationCount={evaluationCount}
          />
        </motion.div>

        {/* Right: Output tabs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut", delay: 0.08 }}
          className="flex-1 min-w-0 bg-white rounded-3xl border border-black/[0.06] p-5 md:p-6 shadow-sm"
        >
          {reshapedOutputs ? (
            <WorkflowOutputTabs config={config} outputs={reshapedOutputs} />
          ) : (
            <div className="py-20 text-center space-y-3">
              <Loader2 className="w-7 h-7 animate-spin text-black/10 mx-auto" />
              <p className="text-sm font-medium text-[#86868B]">AI outputs not yet available.</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Delete Sheet */}
      <BottomSheet
        isOpen={showDeleteSheet}
        onClose={() => setShowDeleteSheet(false)}
        title="Delete this workflow?"
      >
        <div className="space-y-5 text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-red-50 rounded-[1.5rem] flex items-center justify-center border border-red-100">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </div>
          <p className="text-sm font-medium text-[#86868B] leading-relaxed max-w-sm mx-auto">
            Permanently deletes <strong className="text-[#1D1D1F]">{config.role_title}</strong> — including its AI outputs and all candidate evaluations. This cannot be undone.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => setShowDeleteSheet(false)}
              className="py-3.5 rounded-2xl bg-[#F5F5F7] border border-black/[0.05] text-[#1D1D1F] font-bold text-sm hover:bg-[#EBEBEB] transition-colors min-h-[48px]"
            >
              Keep it
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="py-3.5 rounded-2xl bg-red-500 text-white font-extrabold text-sm hover:bg-red-600 transition-all active:scale-95 shadow-md min-h-[48px] flex items-center justify-center gap-2"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Delete
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
