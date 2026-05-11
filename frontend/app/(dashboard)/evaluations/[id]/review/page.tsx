"use client";

import { useEffect, useState, use } from "react";
import { useAuth } from "@clerk/nextjs";
import { CustomEvaluationFlow } from "@/components/eval/CustomEvaluationFlow";
import { LoadingState } from "@/components/LoadingState";
import { AlertTriangle, ArrowLeft, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CustomEvalReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { getToken, isLoaded, userId } = useAuth();
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchSession() {
      if (!isLoaded || !userId) return;
      setIsLoading(true);
      try {
        const token = await getToken({ template: "backend" }).catch(() => getToken());
        const res = await fetch(`/api/custom-eval/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (res.ok && data.session) {
          setSession(data.session);
        } else {
          setError(data.error || "Session not found");
        }
      } catch (err) {
        console.error("Failed to load session:", err);
        setError("Failed to load evaluation session");
      } finally {
        setIsLoading(false);
      }
    }
    fetchSession();
  }, [id, isLoaded, userId, getToken]);

  if (isLoading) return <div className="py-20"><LoadingState text="Loading" /></div>;
  if (error || !session) return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <AlertTriangle className="w-12 h-12 text-red-500 opacity-50" />
      <h2 className="text-xl font-bold">{error || "Session not found"}</h2>
      <Link href="/evaluations" className="text-sm font-bold text-primary hover:underline flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" /> Back to Evaluations
      </Link>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto pt-2 pb-8 px-0 animate-in fade-in duration-500">
      <Link
        href="/evaluations"
        className="flex items-center gap-2 text-sm font-semibold text-[#86868B] hover:text-[#1D1D1F] mb-6 transition-colors group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Evaluations
      </Link>
      <CustomEvaluationFlow 
        initialStep="bias" 
        initialSession={{
          id: session.id,
          title: session.title,
          questions: session.questions,
          biasResults: session.bias_results,
          hasHighBias: (session.bias_results || []).some((b: any) => b.score > 50),
          planId: session.plan_tier || 'free',
          remaining: null,
          draft_scores: session.draft_scores,
          draft_notes: session.draft_notes
        }} 
      />
    </div>
  );
}
