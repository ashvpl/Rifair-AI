"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { getReports, deleteReports, deleteReportById } from "@/lib/api";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { getVerdict } from "@/lib/verdict";
import {
  ShieldCheck,
  Check,
  Trash2,
  Loader2,
  Calendar,
  ChevronRight,
  AlertTriangle,
  Search,
} from "lucide-react";
import { cn, safeParseReport } from "@/lib/utils";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { LoadingState } from "@/components/LoadingState";
import { useBackendToken } from "@/hooks/useBackendToken";

// ─── Types ─────────────────────────────────────────────────────────────────────
type FilterType = "All" | "Analysis" | "JD Analysis" | "JD Generated" | "Kit" | "Evaluation" | "Kit Audit";

export default function HistoryPage() {
  const { isLoaded, userId } = useAuth();
  const { getAuthToken } = useBackendToken();
  const [history, setHistory] = useState<Record<string, any>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showConfirmSheet, setShowConfirmSheet] = useState(false);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");

  const fetchHistory = async () => {
    if (!isLoaded || !userId) return;
    setIsLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) return;
      const data = await getReports(token);
      if (Array.isArray(data)) {
        setHistory(data.map(safeParseReport));
      } else {
        setHistory([]);
      }
    } catch (err) {
      console.error("[HISTORY] Load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [isLoaded, userId, getAuthToken]);

  const promptDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setTargetId(id);
    setShowConfirmSheet(true);
  };

  const confirmDelete = async () => {
    if (!targetId) return;
    const token = await getAuthToken();
    if (!token) return;

    if (targetId === "ALL") {
      setDeletingId("ALL");
      setShowConfirmSheet(false);
      try {
        await deleteReports(token);
        setHistory([]);
      } catch (err: any) {
        console.error(err);
        alert(err.message || "Failed to delete all reports");
      } finally {
        setDeletingId(null);
        setTargetId(null);
      }
      return;
    }

    setDeletingId(targetId);
    setShowConfirmSheet(false);
    try {
      await deleteReportById(targetId, token);
      setHistory((prev) => prev.filter((r) => r.id !== targetId));
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to delete report");
    } finally {
      setDeletingId(null);
      setTargetId(null);
    }
  };

  // ── Filtered + searched list ─────────────────────────────────────────────────
  const filteredHistory = history.filter((report) => {
    const isKit =
      report.categories?.analysis_type === "kit" ||
      report.input_text?.startsWith("Interview Kit: ");
    const isEvaluation =
      report.categories?.analysis_type === "evaluation" ||
      report.input_text?.startsWith("Candidate Evaluation: ");
    const isKitAudit =
      report.categories?.analysis_type === "kit_audit" ||
      report.input_text?.startsWith("Kit Audit: ");
    const isJdAnalysis =
      report.categories?.analysis_type === "jd_analysis" ||
      report.input_text?.startsWith("JD Analysis") ||
      report.input_text?.startsWith("Job Description Analysis");
    const isJdGenerated =
      report.categories?.analysis_type === "jd_generated" ||
      report.input_text?.startsWith("JD Generated");
    const isAnalysis = !isKit && !isEvaluation && !isKitAudit && !isJdAnalysis;

    if (activeFilter === "Kit" && !isKit) return false;
    if (activeFilter === "Analysis" && !isAnalysis) return false;
    if (activeFilter === "JD Analysis" && !isJdAnalysis) return false;
    if (activeFilter === "JD Generated" && !isJdGenerated) return false;
    if (activeFilter === "Evaluation" && !isEvaluation) return false;
    if (activeFilter === "Kit Audit" && !isKitAudit) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        report.input_text?.toLowerCase().includes(q) ||
        report.categories?.analysis_type?.toLowerCase().includes(q)
      );
    }

    return true;
  });

  // ── Animation variants ───────────────────────────────────────────────────────
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16, scale: 0.97 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 350, damping: 28 } },
  };

  const filters: FilterType[] = ["All", "Analysis", "JD Analysis", "JD Generated", "Kit", "Evaluation", "Kit Audit"];

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-700 pb-4 pt-0">

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-5">
        <div className="space-y-0.5">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
            History
          </h1>
          <p className="text-[#86868B] text-sm md:text-base font-medium">
            All your past bias analyses in one place.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] text-[#86868B] bg-[#F5F5F7] px-3 py-1.5 rounded-full border border-black/[0.03] whitespace-nowrap">
            {filteredHistory.length} / {history.length} reports
          </div>
          {history.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="text-danger border-danger/10 bg-danger/5 hover:bg-danger/10 hover:border-danger/30 shadow-sm transition-all h-9 md:h-10 px-4 rounded-full font-bold text-xs"
              onClick={() => {
                setTargetId("ALL");
                setShowConfirmSheet(true);
              }}
              disabled={deletingId === "ALL"}
            >
              {deletingId === "ALL" ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              )}
              Delete all
            </Button>
          )}
        </div>
      </div>

      {/* ── Sticky Search + Filter Bar ────────────────────────────────────── */}
      <div className="sticky top-0 sticky-below-topbar z-20 bg-background/95 backdrop-blur-sm pt-1 pb-3 mb-4"
      >
        <div className="relative mb-3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search history..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/[0.08] bg-white text-sm font-medium placeholder:text-[#86868B] focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/20 transition-all"
          />
        </div>

        <div className="chip-row">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-150 min-h-[36px] touch-target shrink-0",
                activeFilter === filter
                  ? "bg-[#1D1D1F] text-white shadow-sm"
                  : "bg-white text-[#86868B] border border-black/[0.08] hover:border-black/[0.15] active:bg-[#F5F5F7]"
              )}
            >
              {filter}
              {filter === "All" && history.length > 0 && (
                <span className={cn("ml-1.5 text-[10px]", activeFilter === "All" ? "text-white/60" : "text-[#86868B]/60")}>
                  {history.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-black/10" />
          <p className="text-[10px] font-black text-black/20 uppercase tracking-[0.2em]">Loading history...</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#F5F5F7]/30 border-2 border-dashed border-black/[0.05] p-10 md:p-20 text-center rounded-[2rem] md:rounded-[3rem]"
        >
          <div className="space-y-6">
            <div className="mx-auto h-20 w-20 bg-white rounded-full flex items-center justify-center border border-black/[0.03] shadow-inner">
              <Calendar className="h-8 w-8 text-black/10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl md:text-2xl font-extrabold text-foreground">
                {searchQuery ? "No results found" : "Nothing here yet"}
              </h3>
              {searchQuery && (
                <p className="text-[#86868B] text-sm font-medium">
                  Try a different search term or clear the filter.
                </p>
              )}
            </div>
            {!searchQuery && (
              <Link
                href="/analyze"
                className="inline-flex items-center justify-center h-12 px-7 rounded-full bg-black text-white font-bold hover:bg-black/90 transition-all shadow-lg active:scale-95 text-sm"
              >
                Start Analysis <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          <AnimatePresence>
            {filteredHistory.map((report) => {
              const typeInCategories = report.categories?.analysis_type;
              const isKit =
                typeInCategories === "kit" ||
                report.input_text?.startsWith("Interview Kit: ");
              const isEvaluation =
                typeInCategories === "evaluation" ||
                report.input_text?.startsWith("Candidate Evaluation: ");
              const isKitAudit =
                typeInCategories === "kit_audit" ||
                report.input_text?.startsWith("Kit Audit: ");
              const isJdAnalysis =
                typeInCategories === "jd_analysis" ||
                report.input_text?.startsWith("JD Analysis") ||
                report.input_text?.startsWith("Job Description Analysis");
              const isJdGenerated =
                typeInCategories === "jd_generated" ||
                report.input_text?.startsWith("JD Generated");

              const detailUrl = isKitAudit
                ? `/kit/audit/${report.categories?.audit_id}`
                : isKit
                  ? `/kit?reportId=${report.id}`
                  : isEvaluation
                    ? `/evaluations/${report.id}`
                    : isJdAnalysis || isJdGenerated
                      ? `/jd/${report.id}`
                      : `/analyze?reportId=${report.id}`;
              const verdict = getVerdict(report.bias_score, isKit ? "kit" : "analysis");

              return (
                <motion.div
                  key={report.id}
                  variants={itemVariants}
                  exit={{ opacity: 0, x: -20, scale: 0.96 }}
                  layout
                >
                  <Link href={detailUrl} className="block group">
                    <div className="bg-white border border-black/10 rounded-[1.5rem] p-4 md:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-300 relative overflow-hidden">
                      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/[0.005] transition-colors rounded-[1.5rem]" />

                      <div className="relative z-10 flex flex-row items-center gap-3 md:gap-6 w-full">

                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={cn(
                            "w-2.5 h-2.5 rounded-full shrink-0",
                            isKitAudit ? "bg-teal-400" : isKit ? "bg-purple-400" : isEvaluation ? "bg-indigo-500" : (isJdAnalysis || isJdGenerated) ? "bg-emerald-400" : "bg-blue-400"
                          )} />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-[#1D1D1F] font-bold truncate text-sm md:text-base tracking-tight">
                              &ldquo;{report.input_text?.slice(0, 70)}
                              {report.input_text?.length > 70 ? "…" : ""}&rdquo;
                            </h4>
                            <div className="flex items-center gap-2 flex-wrap mt-1.5">
                              <span className="flex items-center gap-1.5 text-[10px] md:text-[11px] font-bold text-[#86868B]">
                                <Calendar className="h-3 w-3 opacity-40" />
                                {report.created_at && !isNaN(new Date(report.created_at).getTime())
                                  ? format(new Date(report.created_at), "MMM d, yyyy")
                                  : "—"}
                              </span>
                              <div className={cn(
                                "px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] flex items-center gap-1.5 rounded-full border",
                                verdict.bg,
                                verdict.color,
                                verdict.border
                              )}>
                                {verdict.showCheck ? (
                                  <Check className="h-2.5 w-2.5" />
                                ) : (
                                  <span className="opacity-70">{report.bias_score}</span>
                                )}
                                {verdict.label}
                              </div>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={(e) => promptDelete(e, report.id)}
                          disabled={deletingId === report.id}
                          className={cn(
                            "flex-shrink-0 w-10 h-10 md:w-11 md:h-11 flex items-center justify-center",
                            "text-[#86868B] hover:text-danger",
                            "bg-white border border-transparent hover:border-danger/15 hover:bg-danger/5",
                            "rounded-xl md:rounded-2xl transition-all active:scale-90",
                            "md:opacity-0 md:group-hover:opacity-100",
                            "disabled:opacity-40 touch-target relative z-20"
                          )}
                          title="Delete"
                          aria-label="Delete entry"
                        >
                          {deletingId === report.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── Delete Confirm Bottom Sheet ───────────────────────────────────── */}
      <BottomSheet
        isOpen={showConfirmSheet}
        onClose={() => setShowConfirmSheet(false)}
        title={targetId === "ALL" ? "Delete all history?" : "Delete this entry?"}
        disableBackdropClose={false}
      >
        <div className="space-y-5">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-danger/8 rounded-[1.5rem] flex items-center justify-center border border-danger/12">
              <AlertTriangle className="h-8 w-8 text-danger" />
            </div>
          </div>

          <p className="text-center text-sm font-medium text-[#86868B] leading-relaxed">
            {targetId === "ALL"
              ? "This will permanently delete all your analysis history. This cannot be undone."
              : "This will permanently delete this entry. This cannot be undone."}
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              className="flex-1 py-3.5 rounded-2xl bg-[#F5F5F7] border border-black/[0.05] text-[#1D1D1F] font-bold text-sm hover:bg-[#EBEBEB] transition-colors active:scale-95 min-h-[48px]"
              onClick={() => setShowConfirmSheet(false)}
            >
              Keep it
            </button>
            <button
              className="flex-1 py-3.5 rounded-2xl bg-danger text-white font-extrabold text-sm hover:bg-danger/90 transition-all active:scale-95 shadow-md min-h-[48px]"
              onClick={confirmDelete}
            >
              Delete
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
