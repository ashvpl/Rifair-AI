"use client";

import { useEffect, useState, use } from "react";
import { useAuth } from "@clerk/nextjs";
import { getReportById } from "@/lib/api";
import { safeParseReport, cn } from "@/lib/utils";
import { 
  Users, 
  ArrowLeft, 
  Calendar, 
  Trophy, 
  AlertTriangle, 
  ChevronRight, 
  CheckCircle2, 
  Clock,
  Briefcase,
  ShieldCheck,
  TrendingUp,
  FileText
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LoadingState } from "@/components/LoadingState";
import { useSubscription } from "@/hooks/useSubscription";
import ExportButton from "@/components/pdf/ExportButton";
import { useBackendToken } from "@/hooks/useBackendToken";


export default function EvaluationReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isLoaded, userId } = useAuth();
  const { getAuthToken } = useBackendToken();
  const { planId } = useSubscription();
  const [report, setReport] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReport() {
      if (!isLoaded || !userId) return;
      setIsLoading(true);
      try {
        const token = await getAuthToken();
        if (!token) return;
        const data = await getReportById(id, token);
        if (data.report) {
          setReport(safeParseReport(data.report));
        } else {
          setError("Report not found");
        }
      } catch (err) {
        console.error("Failed to load evaluation:", err);
        setError("Failed to load evaluation details");
      } finally {
        setIsLoading(false);
      }
    }
    fetchReport();
  }, [id, isLoaded, userId, getAuthToken]);

  if (isLoading) return <div className="py-20"><LoadingState text="Loading" /></div>;
  if (error || !report) return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <AlertTriangle className="w-12 h-12 text-red-500 opacity-50" />
      <h2 className="text-xl font-bold">{error || "Report not found"}</h2>
      <Link href="/evaluations" className="text-sm font-bold text-primary hover:underline flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" /> Back to Evaluations
      </Link>
    </div>
  );

  const evalData = report.report; // From safeParseReport mapping
  const recommendation = evalData?.recommendation || "UNKNOWN";
  
  const recStyles: Record<string, any> = {
    "HIRE": { bg: "bg-indigo-600", text: "text-white", border: "border-black", label: "Recommended for Hire" },
    "STRONG HIRE": { bg: "bg-black", text: "text-white", border: "border-black", label: "Strong Hire Priority" },
    "HOLD": { bg: "bg-amber-600", text: "text-white", border: "border-black", label: "Further Assessment Required" },
    "REJECT": { bg: "bg-red-600", text: "text-white", border: "border-black", label: "Not Recommended" },
    "UNKNOWN": { bg: "bg-indigo-700", text: "text-white", border: "border-black", label: "Evaluation Completed" },
  };

  const style = recStyles[recommendation] || recStyles.UNKNOWN;

  return (
    <div className="max-w-5xl mx-auto pt-2 pb-20 px-0 animate-in fade-in duration-700">
      {/* Breadcrumb */}
      <Link href="/evaluations" className="inline-flex items-center gap-2 text-xs font-bold text-[#86868B] hover:text-[#1D1D1F] transition-colors mb-8 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        BACK TO EVALUATIONS
      </Link>

      {/* Header Card */}
      <div className={cn(
        "border-2 border-black rounded-[2.5rem] p-8 md:p-12 mb-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden text-white transition-colors duration-500 bg-[#3b82f6]"
      )}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 backdrop-blur-md">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">
                  {report.categories?.candidate_name || "Unnamed Candidate"}
                </h1>
                <p className="text-sm font-bold text-white/60 uppercase tracking-widest flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5" />
                  {report.categories?.role || "Co-Founder"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-xs font-bold text-white/60">
                <Calendar className="w-4 h-4 opacity-50" />
                {new Date(report.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-white/60">
                <ShieldCheck className="w-4 h-4 text-white/80" />
                Bias Check Verified
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Overall Score</div>
                <div className="text-5xl font-black text-white tracking-tighter">
                  {evalData?.overall_score}<span className="text-xl text-white/40">/100</span>
                </div>
              </div>
              <div className={cn(
                "px-6 py-4 rounded-3xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center text-center min-w-[160px] bg-white text-black"
              )}>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Recommendation</span>
                <span className={cn(
                  "text-xs font-black uppercase tracking-widest",
                  recommendation === 'HIRE' || recommendation === 'STRONG HIRE' ? 'text-indigo-600' :
                  recommendation === 'REJECT' ? 'text-red-600' : 'text-amber-600'
                )}>{recommendation}</span>
              </div>
            </div>
            
            <ExportButton 
              type="evaluation" 
              id={id} 
              planTier={planId} 
              variant="secondary"
              className="w-full"
            />
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Summary & Competencies */}
        <div className="lg:col-span-2 space-y-8">
          {/* Summary Section */}
          <section className="bg-white border border-black/10 rounded-[2rem] p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-lg font-extrabold text-[#1D1D1F] mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Executive Summary
            </h2>
            <p className="text-[#424245] font-medium leading-relaxed text-sm md:text-base">
              {evalData?.summary}
            </p>
          </section>

          {/* Competency Breakdown */}
          <section className="bg-white border border-black/10 rounded-[2rem] p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-lg font-extrabold text-[#1D1D1F] mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Competency Breakdown
            </h2>
            <div className="space-y-6">
              {evalData?.competency_breakdown?.map((comp: any, i: number) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div>
                      <h4 className="text-sm font-bold text-[#1D1D1F]">{comp.competency}</h4>
                      <p className="text-[11px] text-[#86868B] font-medium">{comp.assessment}</p>
                    </div>
                    <div className="text-right">
                      <span className={cn(
                        "text-sm font-black",
                        comp.score >= 4 ? "text-indigo-600" : comp.score >= 3 ? "text-amber-600" : "text-red-600"
                      )}>
                        {comp.score}/5
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-[#F5F5F7] rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(comp.score / 5) * 100}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className={cn(
                        "h-full rounded-full",
                        comp.score >= 4 ? "bg-indigo-500" : comp.score >= 3 ? "bg-amber-500" : "bg-red-500"
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Strengths & Gaps */}
        <div className="space-y-8">
          {/* Strengths */}
          <section className="bg-blue-50/50 border border-black/10 rounded-[2rem] p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Top Strengths
            </h2>
            <div className="space-y-4">
              {evalData?.strengths?.map((strength: any, i: number) => (
                <div key={i} className="bg-white border border-black/10 rounded-2xl p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <h4 className="text-[11px] font-black text-blue-900 uppercase tracking-widest mb-1">{strength.competency}</h4>
                  <p className="text-xs text-blue-800/80 font-medium leading-relaxed">{strength.observation}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Critical Gaps */}
          <section className="bg-red-50/50 border border-black/10 rounded-[2rem] p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-sm font-black text-red-900 uppercase tracking-widest mb-6 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Identified Gaps
            </h2>
            <div className="space-y-4">
              {evalData?.gaps?.map((gap: any, i: number) => (
                <div key={i} className="bg-white border border-black/10 rounded-2xl p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-[11px] font-black text-red-900 uppercase tracking-widest">{gap.competency}</h4>
                    <span className="text-[8px] font-black bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase tracking-widest">{gap.severity}</span>
                  </div>
                  <p className="text-xs text-red-800/80 font-medium leading-relaxed">{gap.observation}</p>
                  {gap.can_be_trained && (
                    <div className="mt-2 inline-flex items-center gap-1 text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-black/10 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Trainable skill
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Next Steps Footer */}
      <section className="mt-8 bg-[#1D1D1F] text-white rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[100px] -mr-48 -mt-48" />
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-1 space-y-4">
            <h3 className="text-2xl font-extrabold tracking-tight">AI Strategy & Next Steps</h3>
            <p className="text-white/60 text-sm font-medium leading-relaxed">
              Based on the candidate's performance across {evalData?.competency_breakdown?.length} weighted dimensions, we recommend the following strategic actions.
            </p>
            <div className="pt-4 flex items-center gap-2 text-xs font-bold text-blue-400">
              <Clock className="w-4 h-4" /> Calibration Confidence: {evalData?.confidence}
            </div>
          </div>

          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">Actionable Plan (HIRE)</h4>
              <div className="space-y-3">
                {evalData?.next_steps?.if_hire?.map((step: string, i: number) => (
                  <div key={i} className="flex gap-3 text-xs font-medium leading-relaxed">
                    <span className="text-blue-500 flex-shrink-0">→</span>
                    <span className="text-white/80">{step}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">Contingency Plan (HOLD)</h4>
              <div className="space-y-3">
                {evalData?.next_steps?.if_hold?.map((step: string, i: number) => (
                  <div key={i} className="flex gap-3 text-xs font-medium leading-relaxed">
                    <span className="text-amber-500 flex-shrink-0">→</span>
                    <span className="text-white/80">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
