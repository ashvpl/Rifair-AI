"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useBackendToken } from "@/hooks/useBackendToken";
import { listWorkflows, deleteWorkflow } from "@/lib/workflows/workflowService";
import { HiringWorkflowRow } from "@/lib/workflows/types";
import Link from "next/link";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Trash2,
  Loader2,
  ChevronRight,
  AlertTriangle,
  Plus,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BottomSheet } from "@/components/ui/BottomSheet";

export default function WorkflowsPage() {
  const { isLoaded, userId } = useAuth();
  const { getAuthToken } = useBackendToken();
  const [workflows, setWorkflows] = useState<HiringWorkflowRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showConfirmSheet, setShowConfirmSheet] = useState(false);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchWorkflows = async () => {
    if (!isLoaded || !userId) return;
    setIsLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) return;
      const data = await listWorkflows(token);
      setWorkflows(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("[WORKFLOWS] Load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
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

    setDeletingId(targetId);
    setShowConfirmSheet(false);
    try {
      await deleteWorkflow(targetId, token);
      setWorkflows((prev) => prev.filter((w) => w.id !== targetId));
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to delete workflow");
    } finally {
      setDeletingId(null);
      setTargetId(null);
    }
  };

  const filteredWorkflows = workflows.filter((w) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      w.role_title.toLowerCase().includes(q) ||
      (w.department && w.department.toLowerCase().includes(q)) ||
      (w.seniority_level && w.seniority_level.toLowerCase().includes(q))
    );
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 350, damping: 28 } },
  };

  return (
    <div className="max-w-6xl mx-auto pb-8 pt-0 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <Layers className="w-8 h-8 text-primary" /> Hiring Workflows
          </h1>
          <p className="text-[#86868B] text-sm md:text-base font-medium">
            Build and manage end-to-end evaluations, JDs, kits, and scorecards.
          </p>
        </div>

        <Link href="/dashboard/workflows/new">
          <button className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#1D1D1F] hover:bg-black text-white rounded-full font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95">
            <Plus className="w-4 h-4" /> Build Workflow
          </button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B] pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search roles, departments, levels..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/[0.08] bg-white text-sm font-medium placeholder:text-[#86868B] focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/20 transition-all"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-black/10" />
          <p className="text-[10px] font-black text-black/20 uppercase tracking-[0.2em]">Loading workflows...</p>
        </div>
      ) : filteredWorkflows.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#F5F5F7]/30 border-2 border-dashed border-black/[0.05] p-10 md:p-20 text-center rounded-[2rem] md:rounded-[3rem] space-y-6"
        >
          <div className="mx-auto h-20 w-20 bg-white rounded-full flex items-center justify-center border border-black/[0.03] shadow-inner">
            <Layers className="h-8 w-8 text-black/10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl md:text-2xl font-extrabold text-foreground">
              {searchQuery ? "No workflows match search" : "No hiring workflows built yet"}
            </h3>
            <p className="text-[#86868B] text-sm font-medium max-w-md mx-auto">
              {searchQuery
                ? "Try adjusting your keywords or clearing the search query."
                : "Create a single cohesive workflow including job descriptions, structured kits, and evaluation rubrics."}
            </p>
          </div>
          {!searchQuery && (
            <Link href="/dashboard/workflows/new">
              <button className="inline-flex items-center justify-center h-12 px-7 rounded-full bg-black text-white font-bold hover:bg-black/90 transition-all shadow-lg active:scale-95 text-sm uppercase tracking-wider">
                Build First Workflow <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </Link>
          )}
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredWorkflows.map((wf) => (
              <motion.div
                key={wf.id}
                variants={itemVariants}
                exit={{ opacity: 0, scale: 0.95 }}
                layout
                className="group"
              >
                <Link href={`/dashboard/workflows/${wf.id}`} className="block h-full">
                  <div className="bg-white border-2 border-black rounded-2xl p-5 md:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-300 relative flex flex-col justify-between h-full space-y-4">
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-wider">
                          {wf.status || 'Draft'}
                        </span>
                        
                        {wf.hiring_health_score !== null && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black text-black/40 uppercase">Health Score:</span>
                            <span className={cn(
                              "text-xs font-black px-2 py-0.5 rounded border",
                              wf.hiring_health_score >= 80
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                : wf.hiring_health_score >= 60
                                ? "bg-amber-50 text-amber-600 border-amber-100"
                                : "bg-red-50 text-red-600 border-red-100"
                            )}>
                              {wf.hiring_health_score}%
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-base sm:text-lg font-black text-[#1D1D1F] tracking-tight group-hover:text-primary transition-colors leading-tight">
                          {wf.role_title}
                        </h3>
                        <p className="text-xs font-bold text-[#86868B] flex items-center gap-1">
                          <span>{wf.seniority_level || 'Mid'}</span>
                          <span>&bull;</span>
                          <span>{wf.employment_type || 'Full-time'}</span>
                        </p>
                      </div>

                      <p className="text-xs text-[#86868B] font-medium line-clamp-3 leading-relaxed">
                        {wf.company_context || "No company description provided."}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-black/[0.04] pt-4 mt-2">
                      <div className="text-[11px] font-bold text-[#86868B]">
                        <span>{wf.department || "General"}</span>
                        <span className="mx-1.5">&bull;</span>
                        <span>{format(new Date(wf.created_at), "MMM d, yyyy")}</span>
                      </div>

                      <button
                        onClick={(e) => promptDelete(e, wf.id)}
                        disabled={deletingId === wf.id}
                        className={cn(
                          "w-9 h-9 flex items-center justify-center rounded-xl transition-all",
                          "text-[#86868B] hover:text-danger",
                          "bg-[#F5F5F7] hover:bg-danger/10 hover:text-red-600 active:scale-90"
                        )}
                        title="Delete Workflow"
                      >
                        {deletingId === wf.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Delete Sheet */}
      <BottomSheet
        isOpen={showConfirmSheet}
        onClose={() => setShowConfirmSheet(false)}
        title="Delete hiring workflow?"
      >
        <div className="space-y-5 text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-danger/8 rounded-[1.5rem] flex items-center justify-center border border-danger/12">
              <AlertTriangle className="h-8 w-8 text-danger" />
            </div>
          </div>

          <p className="text-sm font-medium text-[#86868B] leading-relaxed max-w-sm mx-auto">
            This will permanently delete this hiring workflow configuration, its AI outputs, and all candidate evaluations linked to it. This cannot be undone.
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
