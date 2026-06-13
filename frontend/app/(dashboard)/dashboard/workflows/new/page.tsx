"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useBackendToken } from "@/hooks/useBackendToken";
import { generateWorkflow, saveWorkflow } from "@/lib/workflows/workflowService";
import { WorkflowBuilderInput, HiringWorkflowOutput } from "@/lib/workflows/types";
import { WorkflowBuilderForm } from "@/components/workflows/WorkflowBuilderForm";
import { WorkflowTemplatePicker } from "@/components/workflows/WorkflowTemplatePicker";
import { WorkflowGeneratingState } from "@/components/workflows/WorkflowGeneratingState";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewWorkflowPage() {
  const router = useRouter();
  const { isLoaded, userId } = useAuth();
  const { getAuthToken } = useBackendToken();

  const [formValues, setFormValues] = useState<Partial<WorkflowBuilderInput>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Template select trigger
  const handleSelectTemplate = (tplConfig: Partial<WorkflowBuilderInput>) => {
    setFormValues(tplConfig);
    setError(null);
  };

  // Submit trigger
  const handleFormSubmit = async (values: WorkflowBuilderInput) => {
    if (!isLoaded || !userId) return;
    setIsGenerating(true);
    setError(null);

    try {
      const token = await getAuthToken();
      if (!token) throw new Error("Could not retrieve authentication token.");

      // Step 1: Generate AI outputs
      const outputs: HiringWorkflowOutput = await generateWorkflow(values, token);

      // Step 2: Persist in Supabase DB via backend
      const saveResult = await saveWorkflow({ ...values, status: "active" }, outputs, token);

      if (saveResult && saveResult.workflow?.id) {
        // Redirect to detail page
        router.push(`/dashboard/workflows/${saveResult.workflow.id}`);
      } else {
        throw new Error("Failed to save workflow results. Please try again.");
      }

    } catch (err: any) {
      console.error("[NEW WORKFLOW ERROR]", err);
      setError(err.message || "An unexpected error occurred during generation. Please try again.");
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return <WorkflowGeneratingState />;
  }

  return (
    <div className="max-w-4xl mx-auto pb-12 pt-0 animate-in fade-in duration-500 space-y-6">
      
      {/* Back link */}
      <Link
        href="/dashboard/workflows"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#86868B] hover:text-black transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Workflows
      </Link>

      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Build structured hiring workflow
        </h1>
        <p className="text-[#86868B] text-sm md:text-base font-medium">
          Prefill details from a template or write your requirements to compile JD, Kit, and Scorecards.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex gap-2.5 p-4 rounded-xl border-2 border-red-200 bg-red-50 text-red-700 text-xs sm:text-sm font-bold items-start">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <div>
            <p className="font-black">Hiring Pipeline Builder Error</p>
            <p className="mt-0.5 text-red-600/90 leading-relaxed font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Template Picker */}
      <WorkflowTemplatePicker onSelectTemplate={handleSelectTemplate} />

      {/* Divider */}
      <div className="h-px bg-black/[0.05] my-2" />

      {/* Configuration Form */}
      <WorkflowBuilderForm
        initialValues={formValues}
        onSubmit={handleFormSubmit}
        isSubmitting={isGenerating}
      />

    </div>
  );
}
