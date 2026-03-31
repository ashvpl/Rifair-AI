"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { getReports, deleteReports, deleteReportById } from "@/lib/api";
import Link from "next/link";
import { Calendar, ChevronRight, Loader2, Trash2, AlertTriangle, FileText } from "lucide-react";
import { RiskIndicator } from "@/components/RiskIndicator";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function HistoryPage() {
  const { getToken } = useAuth();
  const [history, setHistory] = useState<Record<string, any>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [targetId, setTargetId] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      const token = await getToken();
      const data = await getReports(token);
      if (Array.isArray(data)) {
        const uniqueMap = new Map();
        data.forEach((item) => {
          if (!uniqueMap.has(item.input_text)) {
            uniqueMap.set(item.input_text, item);
          }
        });
        setHistory(Array.from(uniqueMap.values()));
      } else {
        setHistory([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

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
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* Header section */}
      <div className="relative">
        <div className="absolute top-0 right-10 w-64 h-64 bg-secondary/10 rounded-full blur-[80px] -z-10" />
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 bg-surface border border-border rounded-full">
              <FileText className="h-3 w-3 text-secondary" />
              <span className="text-xs font-semibold text-secondary uppercase tracking-wider">Reports</span>
            </div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Analysis History</h1>
            <p className="text-muted-foreground max-w-xl">
              Track, review, and manage all your past interview question bias analyses.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-surface px-4 py-2 rounded-full border border-border/50">
              {history.length} Reports Total
            </div>
            {history.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="text-danger border-danger/30 hover:bg-danger/10 hover:border-danger/50 shadow-sm transition-all h-9"
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
                Delete All
              </Button>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-40">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
            <Loader2 className="w-12 h-12 animate-spin text-primary relative z-10" />
          </div>
        </div>
      ) : history.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel border-dashed border-2 p-16 text-center"
        >
          <div className="space-y-6">
            <div className="mx-auto h-20 w-20 bg-surface rounded-full flex items-center justify-center border border-border shadow-inner">
              <Calendar className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-foreground">No reports found</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">Start by analyzing your first set of interview questions in the analysis engine.</p>
            </div>
            <Link href="/analyze" className="inline-flex items-center justify-center h-10 px-6 mt-4 rounded-full bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors">
              Go to Analyze <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-4"
        >
          <AnimatePresence>
            {history.map((report) => (
              <motion.div 
                key={report.id} 
                variants={itemVariants}
                exit={{ opacity: 0, x: -20 }}
                layout
              >
                <Link href={`/report/${report.id}`} className="block">
                  <div className="glass-panel p-5 group hover:border-primary/40 transition-all duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                      
                      <div className="flex-shrink-0 flex sm:flex-col items-center sm:w-20 sm:border-r border-border pr-0 sm:pr-6 gap-3 sm:gap-1">
                        <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest sm:order-2">Score</span>
                        <span className="text-3xl font-black text-foreground sm:order-1">{report.bias_score}</span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-foreground/90 font-medium truncate mb-2 group-hover:text-primary transition-colors text-lg">
                          "{report.input_text.slice(0, 80)}..."
                        </h4>
                        <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground">
                          <span className="flex items-center gap-1.5 px-3 py-1 bg-surface rounded-full border border-border/50">
                            <Calendar className="h-3 w-3 opacity-50" />
                            {format(new Date(report.created_at), "MMM d, yyyy • h:mm a")}
                          </span>
                          <RiskIndicator level={report.risk_level} />
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-4 sm:mt-0 ml-auto sm:ml-0">
                        <button
                          onClick={(e) => promptDelete(e, report.id)}
                          disabled={deletingId === report.id}
                          className="p-2.5 text-muted-foreground hover:text-danger hover:bg-danger/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                          title="Delete Report"
                        >
                          {deletingId === report.id ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Trash2 className="h-5 w-5" />
                          )}
                        </button>
                        <div className="flex-shrink-0 h-10 w-10 text-muted-foreground bg-surface border-border flex items-center justify-center rounded-xl group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/30 transition-all">
                          <ChevronRight className="h-5 w-5" />
                        </div>
                      </div>
                      
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Modernised Dialog */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-[420px] bg-background border border-border shadow-2xl rounded-2xl p-0 overflow-hidden">
          <div className="p-8">
            <DialogHeader className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mb-2">
                <AlertTriangle className="h-8 w-8 text-danger" />
              </div>
              <DialogTitle className="text-center text-2xl font-extrabold text-foreground">
                {targetId === "ALL" ? "Delete All Reports?" : "Delete Report?"}
              </DialogTitle>
              <DialogDescription className="text-center text-sm font-medium text-muted-foreground leading-relaxed pt-2">
                This action is permanent and cannot be undone. Are you sure you want to completely remove {targetId === "ALL" ? "all reports" : "this report"} from your history?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-8">
              <Button
                variant="outline"
                className="flex-1 bg-surface border-border text-foreground hover:bg-background h-12 rounded-xl"
                onClick={() => setShowConfirmModal(false)}
              >
                No, cancel
              </Button>
              <Button
                variant="default"
                className="flex-1 bg-danger hover:bg-danger/90 text-white font-bold border-none shadow-md h-12 rounded-xl"
                onClick={confirmDelete}
              >
                Yes, delete
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
