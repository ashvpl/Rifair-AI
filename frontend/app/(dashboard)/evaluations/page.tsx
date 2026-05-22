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
      <div className="max-w-2xl mx-auto pt-2 pb-8 px-0 animate-in fade-in duration-500">
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
    <div className="max-w-6xl mx-auto pt-2 pb-8 px-0 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3b82f6]/[0.05] border border-[#3b82f6]/[0.1] text-[#3b82f6] text-[10px] font-black uppercase tracking-[0.15em] mb-2">
            <ClipboardCheck className="w-3 h-3" />
            Evaluation Center
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#3b82f6] tracking-tight">
            Candidate Evaluations
          </h1>
          <p className="text-base md:text-lg text-[#86868B] font-medium max-w-2xl">
            Select a generated interview kit to start evaluating your candidates with AI-powered bias detection.
          </p>
        </div>

        <Link href="/kit">
          <Button className="h-12 px-6 rounded-2xl bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold shadow-md transition-all active:scale-95 text-xs uppercase tracking-widest">
            <Plus className="w-4 h-4 mr-2" />
            Generate New Kit
          </Button>
        </Link>
      </div>

      {/* ── Entry Points ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* A — Rifair Kit */}
        <div className="bg-white border border-black/10 rounded-[2rem] p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden hover:border-[#3b82f6]/[0.2] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-300">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#3b82f6]/[0.03] rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="w-12 h-12 bg-[#3b82f6] rounded-2xl flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-base font-extrabold text-[#3b82f6] mb-1">Use a Rifair Kit</h3>
            <p className="text-sm text-[#86868B] font-medium leading-relaxed mb-5">
              Evaluate a candidate against questions from your AI-generated interview kits.
            </p>
            <div className="flex flex-wrap gap-2 mb-5">
              {["Bias-verified questions", "Competency mapping", "AI scoring"].map(tag => (
                <span key={tag} className="text-[10px] font-bold text-[#3b82f6] bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-xs text-[#86868B] font-semibold uppercase tracking-[0.08em]">
              Select a kit below ↓
            </p>
          </div>
        </div>

        {/* B — Own Questions */}
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setShowCustomFlow(true)}
          className="text-left bg-gradient-to-br from-[#3b82f6] to-[#2563eb] border-2 border-black rounded-[2rem] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden cursor-pointer group"
        >
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/[0.04] rounded-full blur-2xl" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/[0.03] rounded-full blur-xl" />
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-base font-extrabold text-white mb-1">Use My Own Questions</h3>
            <p className="text-sm text-white/70 font-medium leading-relaxed mb-5">
              Paste your own interview questions. We'll check them for bias and generate an AI evaluation report.
            </p>
            <div className="flex flex-wrap gap-2 mb-5">
              {["Auto bias check", "Type detection", "Upgrade nudge"].map(tag => (
                <span key={tag} className="text-[10px] font-bold text-white/80 bg-white/10 border border-white/10 px-2.5 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 text-white text-xs font-bold uppercase tracking-[0.08em] group-hover:gap-3 transition-all">
              Start now <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </motion.button>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">

        <div className="md:col-span-3 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#86868B]" />
          <input 
            type="text"
            placeholder="Search roles or kits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-black/10 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:ring-0 focus:border-black transition-all text-[#1D1D1F] font-medium"
          />
        </div>
        <div className="bg-white border border-black/10 rounded-2xl p-4 flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.1em]">Total Kits</span>
            <span className="text-2xl font-extrabold text-[#1D1D1F]">{kits.length}</span>
          </div>
          <FileText className="w-8 h-8 text-black/[0.03]" />
        </div>
      </div>

      {/* Section Header: Active Kits */}
      <div className="flex items-center gap-3 mb-6 mt-4">
        <FileText className="w-5 h-5 text-[#1D1D1F]" />
        <h2 className="text-xl font-bold text-foreground tracking-tight">Interview Library</h2>
      </div>

      {/* Kits List */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground font-medium">Loading evaluations...</p>
        </div>
      ) : filteredKits.length === 0 ? (
        <div className="bg-[#F5F5F7]/50 border-2 border-dashed border-black/[0.05] rounded-[2.5rem] p-10 text-center mb-10">
          <p className="text-[#86868B] font-medium">
            {searchQuery ? "No matching kits found" : "No interview kits generated yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
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
                    <div className="group bg-white border border-black/10 rounded-[2rem] p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-300 cursor-pointer relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-[#1D1D1F] flex items-center justify-center text-white">
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-[#F5F5F7] text-[#86868B] text-[10px] font-black uppercase tracking-[0.1em]">
                            {kit.report?.experience_level || "Standard"}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-[#F5F5F7] text-[#1D1D1F] text-[10px] font-black uppercase tracking-[0.1em]">
                            {kit.report?.questions?.length || 0} Questions
                          </span>
                        </div>

                        <div>
                          <h3 className="text-xl font-extrabold text-[#1D1D1F] group-hover:text-black transition-colors tracking-tight">
                            {kit.report?.role || kit.input_text.replace("Interview Kit: ", "")}
                          </h3>
                          <p className="text-sm text-[#86868B] line-clamp-1 mt-1 font-medium">
                            {kit.report?.company_type || "Standard Industry Context"}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-black/[0.04] flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[#86868B] text-xs font-medium">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(kit.created_at).toLocaleDateString()}
                          </div>
                          {latestEval ? (
                            <div className="text-[#1e1b4b] text-xs font-bold flex items-center group-hover:underline">
                              Evaluation Completed • See Report <ArrowRight className="w-3.5 h-3.5 ml-1" />
                            </div>
                          ) : (
                            <div className="text-[#1D1D1F] text-xs font-bold flex items-center group-hover:underline">
                              Evaluate Candidate <ArrowRight className="w-3.5 h-3.5 ml-1" />
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

      {/* Section Header: Recent Evaluations */}
      {evaluations.length > 0 && (
        <>
          <div className="flex items-center gap-3 mb-6">
            <ClipboardCheck className="w-5 h-5 text-[#1D1D1F]" />
            <h2 className="text-xl font-bold text-foreground tracking-tight">Recent Evaluations</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <AnimatePresence>
              {evaluations.slice(0, 6).map((evalItem, idx) => (
                <motion.div
                  key={evalItem.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link href={`/evaluations/${evalItem.id}`}>
                    <div className="bg-white border border-black/10 rounded-[2rem] p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer group">
                      <div className="flex justify-between items-start mb-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#F5F5F7] flex items-center justify-center border border-black/[0.02] group-hover:bg-[#1D1D1F] transition-colors">
                          <Users className="w-5 h-5 text-[#86868B] group-hover:text-white" />
                        </div>
                        <div className={cn(
                          "px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.1em]",
                          evalItem.report?.recommendation === "HIRE" ? "bg-blue-600 text-white" :
                          evalItem.report?.recommendation === "STRONG HIRE" ? "bg-[#1D1D1F] text-white" :
                          "bg-[#F5F5F7] text-[#86868B]"
                        )}>
                          {evalItem.report?.recommendation || "Completed"}
                        </div>
                      </div>
                      <h4 className="font-extrabold text-[#1D1D1F] group-hover:text-black transition-colors truncate">
                        {evalItem.categories?.candidate_name || "Unnamed Candidate"}
                      </h4>
                      <p className="text-xs text-[#86868B] font-medium truncate mb-4">
                        {evalItem.categories?.role}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-[#86868B] font-black uppercase tracking-[0.1em]">
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
      <div className="mt-12 p-6 md:p-8 rounded-[2rem] bg-[#1D1D1F] text-white relative overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0 border border-white/10">
            <AlertCircle className="w-8 h-8 text-white/80" />
          </div>
          <div className="space-y-2 text-center md:text-left">
            <h4 className="text-lg md:text-xl font-extrabold tracking-tight">Why evaluate with Rifair AI?</h4>
            <p className="text-white/60 text-sm font-medium leading-relaxed max-w-2xl">
              Our evaluation engine doesn't just score candidates; it monitors your scoring patterns for subtle biases in real-time, ensuring that every hiring decision is based purely on merit and performance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
