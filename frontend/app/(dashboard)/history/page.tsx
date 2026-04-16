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
  AlertTriangle 
} from "lucide-react";
import { cn, safeParseReport } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function HistoryPage() {
  const { getToken, isLoaded, userId } = useAuth();
  const [history, setHistory] = useState<Record<string, any>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [targetId, setTargetId] = useState<string | null>(null);

  const fetchHistory = async () => {
    if (!isLoaded || !userId) return;
    
    setIsLoading(true);
    try {
      const token = await getToken();
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
  }, [isLoaded, userId, getToken]);

  const promptDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setTargetId(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!targetId) return;

    const token = await getToken();
    if (targetId === "ALL") {
      setDeletingId("ALL");
      setShowConfirmModal(false);
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
    setShowConfirmModal(false);
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-10 animate-in fade-in duration-1000 pb-4 pt-0">
      
      {/* Header section */}
      <div className="relative">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 md:gap-8">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">History</h1>
            <p className="text-[#86868B] max-w-xl text-sm md:text-lg font-medium">
              View and manage all your past bias analyses in one place.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-[10px] font-black uppercase tracking-[0.15em] text-[#86868B] bg-[#F5F5F7] px-4 py-2 rounded-full border border-black/[0.03]">
              {history.length} Reports
            </div>
            {history.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="text-danger border-danger/10 bg-danger/5 hover:bg-danger/10 hover:border-danger/30 shadow-sm transition-all h-10 px-6 rounded-full font-bold"
                onClick={() => {
                  setTargetId("ALL");
                  setShowConfirmModal(true);
                }}
                disabled={deletingId === "ALL"}
              >
                {deletingId === "ALL" ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-48">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl animate-pulse"></div>
            <Loader2 className="w-16 h-16 animate-spin text-primary relative z-10" />
          </div>
        </div>
      ) : history.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#F5F5F7]/30 border-2 border-dashed border-black/[0.05] p-12 md:p-24 text-center rounded-[2rem] md:rounded-[3rem]"
        >
          <div className="space-y-8">
            <div className="mx-auto h-24 w-24 bg-white rounded-full flex items-center justify-center border border-black/[0.03] shadow-[inset_0_4px_12px_rgba(0,0,0,0.01)]">
              <Calendar className="h-10 w-10 text-black/10" />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-extrabold text-foreground">Nothing here yet</h3>
            </div>
            <Link href="/analyze" className="inline-flex items-center justify-center h-12 px-8 mt-6 rounded-full bg-black text-white font-bold hover:bg-black/90 transition-all shadow-lg active:scale-95">
              Start Analysis <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-6"
        >
          <AnimatePresence>
            {history.map((report) => {
              const typeInCategories = report.categories?.analysis_type;
              const isKit = typeInCategories === 'kit' || report.input_text?.startsWith("Interview Kit: ");
              const detailUrl = isKit ? `/kit?reportId=${report.id}` : `/analyze?reportId=${report.id}`;
              const verdict = getVerdict(report.bias_score, isKit ? 'kit' : 'analysis');
              
              return (
                <motion.div 
                  key={report.id} 
                  variants={itemVariants}
                  exit={{ opacity: 0, x: -20 }}
                  layout
                >
                  <Link href={detailUrl} className="block group">
                    <div className="bg-white border border-black/[0.05] p-4 md:p-7 transition-all duration-500 rounded-[1.5rem] md:rounded-[2rem] shadow-[0_4px_24px_rgba(0,0,0,0.02)] group-hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] group-hover:border-primary/20 relative overflow-hidden">
                      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/[0.005] transition-colors" />
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:gap-8 relative z-10 w-full">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[#1D1D1F] font-bold truncate mb-2 md:mb-3 text-sm md:text-xl tracking-tight">
                            &ldquo;{report.input_text?.slice(0, 60)}...&rdquo;
                          </h4>
                          <div className="flex items-center gap-2 flex-wrap text-xs font-bold text-[#86868B]">
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-[#F5F5F7] rounded-full border border-black/[0.02]">
                              <Calendar className="h-3 w-3 opacity-40" />
                              {report.created_at && !isNaN(new Date(report.created_at).getTime())
                                ? format(new Date(report.created_at), "MMM d, yyyy")
                                : "—"}
                            </span>
                            <div className={cn(
                              "px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-2 rounded-full border shadow-sm",
                              verdict.bg,
                              verdict.color,
                              verdict.border
                            )}>
                              {verdict.showCheck ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <span className="opacity-70">{report.bias_score}</span>
                              )}
                              {verdict.label}
                            </div>
                          </div>
                        </div>

                        {/* Delete button — always visible on mobile */}
                        <div className="flex items-center gap-4 sm:gap-4 ml-auto sm:ml-0">
                          <button
                            onClick={(e) => promptDelete(e, report.id)}
                            disabled={deletingId === report.id}
                            className="p-2.5 md:p-3 text-[#86868B] hover:text-danger hover:bg-danger/5 border border-transparent hover:border-danger/10 rounded-xl md:rounded-2xl transition-all sm:opacity-0 sm:group-hover:opacity-100 disabled:opacity-50 shadow-sm bg-white relative z-20 min-h-[44px] min-w-[44px] flex items-center justify-center"
                            title="Delete Entry"
                          >
                            {deletingId === report.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
                            )}
                          </button>
                        </div>
                        
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Modernised Dialog */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-[440px] bg-white border border-black/[0.05] shadow-[0_32px_128px_rgba(0,0,0,0.1)] rounded-[3rem] p-0 overflow-hidden outline-none">
          <div className="p-10">
            <DialogHeader className="space-y-6">
              <div className="mx-auto w-20 h-20 bg-danger/5 rounded-[2.25rem] flex items-center justify-center border border-danger/10">
                <AlertTriangle className="h-10 w-10 text-danger" />
              </div>
              <div className="space-y-2">
                <DialogTitle className="text-center text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
                  {targetId === "ALL" ? "Delete History?" : "Delete Entry?"}
                </DialogTitle>
                <DialogDescription className="text-center text-sm font-medium text-[#86868B] leading-relaxed px-4">
                  {targetId === "ALL" 
                    ? "Are you sure you want to delete all your history? This action cannot be undone."
                    : "Are you sure you want to delete this entry? This action cannot be undone."}
                </DialogDescription>
              </div>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-4 mt-10">
              <Button
                variant="outline"
                className="flex-1 bg-[#F5F5F7] border-black/[0.03] text-foreground hover:bg-[#E8E8ED] h-14 rounded-full font-bold shadow-sm transition-all"
                onClick={() => setShowConfirmModal(false)}
              >
                Keep it
              </Button>
              <Button
                variant="default"
                className="flex-1 bg-danger hover:bg-danger/90 text-white font-heavy border-none shadow-lg h-14 rounded-full font-extrabold transition-all active:scale-95"
                onClick={confirmDelete}
              >
                Delete it
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
