"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { getReports } from "@/lib/api";
import { safeParseReport } from "@/lib/utils";
import { 
  ClipboardCheck, 
  Search, 
  ArrowRight, 
  Users, 
  Calendar,
  FileText,
  Loader2,
  AlertCircle,
  Plus,
  ShieldCheck,
  ChevronLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { CustomEvaluationFlow } from "@/components/eval/CustomEvaluationFlow";
import { useBackendToken } from "@/hooks/useBackendToken";
import { SectionLimitLock } from "@/components/pricing/FeatureGate";

export default function EvaluationsPage() {
  const { isLoaded, userId } = useAuth();
  const { getAuthToken } = useBackendToken();
  const [kits, setKits] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCustomFlow, setShowCustomFlow] = useState(false);


  useEffect(() => {
    async function fetchKits() {
      if (!isLoaded || !userId) return;
      setIsLoading(true);
      try {
        const token = await getAuthToken();
        if (!token) return;
        const data = await getReports(token);
        if (Array.isArray(data)) {
          const parsed = data.map(safeParseReport);
          
          // Filter only kits
          const onlyKits = parsed.filter(r => 
            r.categories?.analysis_type === "kit" || 
            r.input_text?.startsWith("Interview Kit: ")
          );
          setKits(onlyKits);

          // Filter only evaluations
          const onlyEvals = parsed.filter(r => 
            r.categories?.analysis_type === "evaluation"
          );
          setEvaluations(onlyEvals);
        }
      } catch (err) {
        console.error("Failed to load kits:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchKits();
  }, [isLoaded, userId, getAuthToken]);

  const filteredKits = kits.filter(k => 
    k.input_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    k.report?.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Custom Evaluation Flow view ──────────────────────────────────────────
  if (showCustomFlow) {
    return (
      <div className="max-w-2xl mx-auto pt-2 pb-8 animate-in fade-in duration-500">
        <button
          onClick={() => setShowCustomFlow(false)}
          className="flex items-center gap-2 text-sm font-semibold text-[#86868B] hover:text-[#1D1D1F] mb-6 transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Evaluations
        </button>
        <CustomEvaluationFlow onClose={() => setShowCustomFlow(false)} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pt-2 pb-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#3b82f6]/[0.05] border border-[#3b82f6]/[0.1] text-[#3b82f6] text-[8px] font-black uppercase tracking-[0.15em] mb-1">
            <ClipboardCheck className="w-2.5 h-2.5" />
            Evaluation Center
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#3b82f6] tracking-tight leading-tight">
            Candidate Evaluations
          </h1>
          <p className="text-xs sm:text-sm text-[#86868B] font-semibold max-w-xl">
            Select a generated interview kit to start evaluating your candidates with AI-powered bias detection.
          </p>
        </div>

        <Link href="/kit">
          <Button className="h-10 px-4 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] text-white font-black shadow-md transition-all active:scale-95 text-[10px] uppercase tracking-widest">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Generate New Kit
          </Button>
        </Link>
      </div>

      {/* ── Entry Points + Kit Library: locked when evaluations limit reached ── */}
      <SectionLimitLock type="evaluations" serviceLabel="candidate evaluations">

      {/* ── Entry Points ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* A — Rifair Kit */}
        <div className="bg-white border-2 border-black rounded-xl p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative hover:border-[#3b82f6]/[0.2] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[180px] h-auto">
          <div className="relative z-10 flex flex-col h-full justify-between gap-3">
            <div>
              <div className="w-10 h-10 bg-[#3b82f6]/10 text-[#3b82f6] rounded-xl flex items-center justify-center mb-3">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-[#3b82f6] mb-1">Use a Rifair Kit</h3>
              <p className="text-xs text-[#86868B] font-semibold leading-relaxed mb-3">
                Evaluate a candidate against questions from your AI-generated interview kits.
              </p>
            </div>
            <div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {["Bias-verified", "Competencies", "AI scoring"].map(tag => (
                  <span key={tag} className="text-[9px] font-bold text-[#3b82f6] bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-[9px] text-[#86868B] font-black uppercase tracking-[0.08em]">
                Select a kit below ↓
              </p>
            </div>
          </div>
        </div>

        {/* B — Own Questions */}
        <div
          onClick={() => setShowCustomFlow(true)}
          className="text-left bg-gradient-to-br from-[#3b82f6] to-[#2563eb] border-2 border-black rounded-xl p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative cursor-pointer group flex flex-col justify-between min-h-[180px] h-auto"
        >
          <div className="relative z-10 flex flex-col h-full justify-between gap-3">
            <div>
              <div className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-black text-white mb-1">Use My Own Questions</h3>
              <p className="text-xs text-white/70 font-semibold leading-relaxed mb-3">
                Paste your own interview questions. We'll check them for bias and generate an AI evaluation report.
              </p>
            </div>
            <div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {["Bias check", "Type detection", "AI report"].map(tag => (
                  <span key={tag} className="text-[9px] font-bold text-white/80 bg-white/10 border border-white/10 px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1.5 text-white text-[10px] font-black uppercase tracking-[0.08em] group-hover:gap-2.5 transition-all">
                Start now <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

        <div className="md:col-span-3 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#86868B]" />
          <input 
            type="text"
            placeholder="Search roles or kits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-black/10 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:ring-0 focus:border-black transition-all text-xs text-[#1D1D1F] font-semibold"
          />
        </div>
        <div className="bg-white border border-black/10 rounded-xl p-3 flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-[#86868B] uppercase tracking-[0.1em]">Total Kits</span>
            <span className="text-lg font-black text-[#1D1D1F]">{kits.length}</span>
          </div>
          <FileText className="w-6 h-6 text-black/[0.03]" />
        </div>
      </div>

      {/* Section Header: Active Kits */}
      <div className="flex items-center gap-2 mb-4 mt-2">
        <FileText className="w-4 h-4 text-[#1D1D1F]" />
        <h2 className="text-base font-black text-foreground tracking-tight uppercase tracking-wider">Interview Library</h2>
      </div>

      {/* Kits List */}
      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <p className="mt-3 text-xs text-muted-foreground font-semibold">Loading evaluations...</p>
        </div>
      ) : filteredKits.length === 0 ? (
        <div className="bg-[#F5F5F7]/50 border border-dashed border-black/[0.05] rounded-xl p-8 text-center mb-8">
          <p className="text-xs text-[#86868B] font-semibold">
            {searchQuery ? "No matching kits found" : "No interview kits generated yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <AnimatePresence>
            {filteredKits.map((kit, idx) => {
              const kitEvals = evaluations.filter(e => e.categories?.kit_id === kit.id);
              const latestEval = kitEvals.length > 0 ? kitEvals[0] : null;

              return (
                <motion.div
                  key={kit.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                <Link href={latestEval ? `/evaluations/${latestEval.id}` : `/kit?reportId=${kit.id}&evaluate=true`}>
                    <div className="group bg-white border border-black/10 rounded-xl p-4.5 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-300 cursor-pointer relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-8 h-8 rounded-full bg-[#1D1D1F] flex items-center justify-center text-white">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded bg-[#F5F5F7] text-[#86868B] text-[8px] font-black uppercase tracking-[0.1em]">
                            {kit.report?.experience_level || "Standard"}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-[#F5F5F7] text-[#1D1D1F] text-[8px] font-black uppercase tracking-[0.1em]">
                            {kit.report?.questions?.length || 0} Questions
                          </span>
                        </div>

                        <div>
                          <h3 className="text-base font-black text-[#1D1D1F] group-hover:text-black transition-colors tracking-tight leading-snug">
                            {kit.report?.role || kit.input_text.replace("Interview Kit: ", "")}
                          </h3>
                          <p className="text-xs text-[#86868B] line-clamp-1 mt-0.5 font-semibold">
                            {kit.report?.company_type || "Standard Context"}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-black/[0.04] flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-[#86868B] text-[10px] font-semibold">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(kit.created_at).toLocaleDateString()}
                          </div>
                          {latestEval ? (
                            <div className="text-[#3b82f6] text-[10px] font-black uppercase tracking-wider flex items-center group-hover:underline">
                              Completed <ArrowRight className="w-3 h-3 ml-1" />
                            </div>
                          ) : (
                            <div className="text-[#1D1D1F] text-[10px] font-black uppercase tracking-wider flex items-center group-hover:underline">
                              Evaluate Candidate <ArrowRight className="w-3 h-3 ml-1" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      </SectionLimitLock>  {/* end SectionLimitLock */}

      {/* Section Header: Recent Evaluations */}
      {evaluations.length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-4">
            <ClipboardCheck className="w-4 h-4 text-[#1D1D1F]" />
            <h2 className="text-base font-black text-foreground tracking-tight uppercase tracking-wider">Recent Evaluations</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <AnimatePresence>
              {evaluations.slice(0, 6).map((evalItem, idx) => (
                <motion.div
                  key={evalItem.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link href={`/evaluations/${evalItem.id}`}>
                    <div className="bg-white border border-black/10 rounded-xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer group">
                      <div className="flex justify-between items-start mb-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#F5F5F7] flex items-center justify-center border border-black/[0.02] group-hover:bg-[#1D1D1F] transition-colors">
                          <Users className="w-4 h-4 text-[#86868B] group-hover:text-white" />
                        </div>
                        <div className={cn(
                          "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-[0.1em]",
                          evalItem.report?.recommendation === "HIRE" ? "bg-blue-600 text-white" :
                          evalItem.report?.recommendation === "STRONG HIRE" ? "bg-[#1D1D1F] text-white" :
                          "bg-[#F5F5F7] text-[#86868B]"
                        )}>
                          {evalItem.report?.recommendation || "Completed"}
                        </div>
                      </div>
                      <h4 className="font-black text-sm text-[#1D1D1F] group-hover:text-black transition-colors truncate">
                        {evalItem.categories?.candidate_name || "Unnamed Candidate"}
                      </h4>
                      <p className="text-xs text-[#86868B] font-semibold truncate mb-3">
                        {evalItem.categories?.role}
                      </p>
                      <div className="flex items-center justify-between text-[9px] text-[#86868B] font-black uppercase tracking-[0.1em]">
                        <span>Score: {evalItem.report?.overall_score}/100</span>
                        <span>{new Date(evalItem.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

      {/* Info Box */}
      <div className="mt-8 p-5 sm:p-6 rounded-xl bg-[#1D1D1F] text-white relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -mr-24 -mt-24" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-5 sm:gap-6">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center shrink-0 border border-white/10">
            <AlertCircle className="w-6 h-6 text-white/80" />
          </div>
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-sm sm:text-base font-black tracking-tight uppercase tracking-wider">Why evaluate with Rifair AI?</h4>
            <p className="text-white/60 text-[11px] sm:text-xs font-semibold leading-relaxed max-w-xl">
              Our evaluation engine doesn't just score candidates; it monitors your scoring patterns for subtle biases in real-time, ensuring that every hiring decision is based purely on merit and performance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
