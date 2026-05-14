"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  ClipboardList,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingState } from "@/components/LoadingState";

interface QuestionRow {
  id: string;
  text: string;
}

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

export default function KitAuditUploader() {
  const router = useRouter();

  const [questions, setQuestions] = useState<QuestionRow[]>([
    { id: makeId(), text: "" },
  ]);
  const [title, setTitle]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  // Scroll to top when error occurs
  useEffect(() => {
    if (error) {
      const container = document.querySelector('.dashboard-main');
      if (container) {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [error]);

  const [limitInfo, setLimitInfo] = useState<{
    allowed: number;
    current: number;
    upgradeUrl?: string;
  } | null>(null);

  const bulkRef = useRef<HTMLTextAreaElement>(null);

  // ── Question management ────────────────────────────────────────────────────

  const addQuestion = () => {
    setQuestions((prev) => [...prev, { id: makeId(), text: "" }]);
  };

  const removeQuestion = (id: string) => {
    setQuestions((prev) => (prev.length > 1 ? prev.filter((q) => q.id !== id) : prev));
  };

  const updateQuestion = (id: string, text: string) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, text } : q)));
  };

  // ── Smart bulk-paste handler ───────────────────────────────────────────────
  // Detects numbered lists (1. 2. 3.) and plain newlines, splits into rows.

  const handleBulkPaste = useCallback((raw: string) => {
    if (!raw.trim()) return;

    // Try to split on numbered list pattern first: "1. " / "1) "
    const numberedPattern = /^\s*\d+[\.\)]\s+/m;
    let lines: string[];

    if (numberedPattern.test(raw)) {
      lines = raw
        .split(/\n/)
        .map((l) => l.replace(/^\s*\d+[\.\)]\s+/, "").trim())
        .filter((l) => l.length >= 10);
    } else {
      // Fall back to splitting on blank lines or single newlines
      lines = raw
        .split(/\n{2,}|\n/)
        .map((l) => l.trim())
        .filter((l) => l.length >= 10);
    }

    if (lines.length <= 1) return; // Not bulk — leave the textarea as-is

    const newRows = lines.map((text) => ({ id: makeId(), text }));
    setQuestions(newRows);

    // Clear bulk textarea
    if (bulkRef.current) bulkRef.current.value = "";
  }, []);

  // ── Derived state ──────────────────────────────────────────────────────────

  const validQuestions = questions.filter((q) => q.text.trim().length >= 10);
  const totalCount     = validQuestions.length;

  // ── Submit ─────────────────────────────────────────────────────────────────

  const runAudit = async () => {
    if (totalCount < 1) {
      setError("Add at least one question (10+ characters) before auditing.");
      return;
    }

    setLoading(true);
    setError(null);
    setLimitInfo(null);

    try {
      const res = await fetch("/api/kit-audit", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          title:     title.trim() || undefined,
          questions: validQuestions.map((q) => q.text.trim()),
          source:    "paste",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "AUDIT_LIMIT_EXCEEDED") {
          setLimitInfo({
            allowed:    data.allowed,
            current:    data.currentCount,
            upgradeUrl: data.upgradeUrl,
          });
          setError(
            `Your plan allows ${data.allowed} questions per audit. You have ${data.currentCount}.`
          );
          return;
        }
        if (data.error === "ANALYSIS_LIMIT_EXCEEDED") {
          setLimitInfo({ allowed: 0, current: 0, upgradeUrl: "/pricing?reason=analysis_limit" });
          setError("Monthly audit limit reached. Upgrade your plan to continue.");
          return;
        }
        if (data.error === "inappropriate_content") {
          const flagged = data.flaggedQuestions ?? [];
          const detail  = flagged.length > 0
            ? ` Questions: ${flagged.map((f: any) => `#${f.index}`).join(", ")}.`
            : "";
          setError(
            `${flagged.length || "Some"} question(s) contain inappropriate content and were blocked.${detail} Please remove them and try again.`
          );
          return;
        }
        setError(data.message || data.error || "Audit failed. Please try again.");
        return;
      }

      router.push(`/kit/audit/${data.id}`);
    } catch (e) {
      setError("Something went wrong. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-3xl mx-auto">
      {loading && <LoadingState text="Analysing" />}
      <div className="bg-white border-2 border-black rounded-2xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="px-6 sm:px-8 pt-8 pb-6 border-b-2 border-black">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-[#10b981]/10 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-[#10b981]" />
            </div>
            <h2 className="text-xl font-extrabold text-[#1D1D1F] tracking-tight">
              Audit My Kit
            </h2>
          </div>
          <p className="text-sm text-[#1D1D1F]/70 font-semibold ml-12">
            Paste your existing interview questions. We'll detect bias, gaps, and
            redundancies instantly.
          </p>
        </div>

        {/* ── Error (at top for visibility) ───────────────────────────────── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden px-6 sm:px-8 pt-4"
            >
              <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-red-700 font-semibold leading-snug">{error}</p>
                    {limitInfo?.upgradeUrl && (
                      <a
                        href={limitInfo.upgradeUrl}
                        className="inline-flex items-center gap-1 mt-2 text-xs font-black text-[#10b981] underline underline-offset-2"
                      >
                        Upgrade plan <ArrowRight className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="px-6 sm:px-8 py-6 space-y-5">

          {/* ── Kit name ────────────────────────────────────────────────── */}
          <div>
            <label className="block text-[10px] font-black text-[#1D1D1F] uppercase tracking-[0.1em] mb-2">
              Kit Name (optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Frontend Engineer — Round 2"
              maxLength={200}
              className="w-full px-4 py-3 rounded-xl border-2 border-black bg-[#F5F5F7]/40 text-sm font-semibold text-[#1D1D1F] placeholder:text-[#1D1D1F]/40 focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]/40 transition-all"
            />
          </div>

          {/* ── Individual question inputs ───────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-black text-[#1D1D1F] uppercase tracking-[0.1em]">
                Questions
              </label>
              <span className="text-[10px] font-bold text-[#1D1D1F]/60">
                {totalCount} valid
              </span>
            </div>

            <div className="space-y-2.5">
              <AnimatePresence initial={false}>
                {questions.map((q, i) => (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="flex gap-2 items-start"
                  >
                    {/* Index pill */}
                    <div className="shrink-0 w-7 h-7 mt-2.5 rounded-full bg-[#F5F5F7] border border-black/[0.12] flex items-center justify-center text-[10px] font-black text-[#1D1D1F]">
                      {i + 1}
                    </div>

                    {/* Textarea */}
                    <div className="relative flex-1">
                      <textarea
                        value={q.text}
                        onChange={(e) => updateQuestion(q.id, e.target.value)}
                        placeholder={`Question ${i + 1}`}
                        rows={2}
                        maxLength={1000}
                        className={cn(
                          "w-full px-4 py-3 pr-10 rounded-xl border-2 text-sm font-semibold text-[#1D1D1F] placeholder:text-[#1D1D1F]/40",
                          "resize-none focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]/40 transition-all",
                          q.text.length > 0 && q.text.trim().length < 10
                            ? "border-amber-500 bg-amber-50/50"
                            : "border-black bg-[#F5F5F7]/30"
                        )}
                      />
                      <span className="absolute bottom-2 right-3 text-[9px] font-mono text-[#1D1D1F]/40">
                        {q.text.length}
                      </span>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeQuestion(q.id)}
                      disabled={questions.length <= 1}
                      className="shrink-0 w-9 h-9 mt-2 rounded-xl border border-black/[0.12] bg-white flex items-center justify-center text-[#1D1D1F]/60 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all active:scale-95 disabled:opacity-30 touch-target"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Add question button */}
            <button
              onClick={addQuestion}
              className="mt-3 w-full py-3 rounded-2xl border-2 border-dashed border-black/[0.15] text-sm font-bold text-[#1D1D1F] hover:border-[#10b981]/50 hover:text-[#10b981] hover:bg-[#10b981]/[0.02] transition-all active:scale-[0.99] touch-target flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </button>
          </div>

          {/* ── Divider + bulk paste ─────────────────────────────────────── */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-black/[0.05]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-[10px] font-black text-[#1D1D1F] uppercase tracking-[0.1em]">
                or paste all at once
              </span>
            </div>
          </div>

          <div>
            <textarea
              ref={bulkRef}
              placeholder={"Paste your questions here — one per line, or numbered (1. 2. 3.)…"}
              rows={4}
              onBlur={(e) => handleBulkPaste(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  handleBulkPaste((e.target as HTMLTextAreaElement).value);
                }
              }}
              className="w-full px-4 py-3 rounded-xl border-2 border-black bg-[#F5F5F7]/30 text-sm font-semibold text-[#1D1D1F] placeholder:text-[#1D1D1F]/40 resize-none focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]/40 transition-all"
            />
            <p className="text-[10px] text-[#1D1D1F]/60 font-semibold mt-1.5 ml-1">
              Questions are auto-split on paste or when you click outside / press ⌘↵
            </p>
          </div>


          {/* ── Submit ───────────────────────────────────────────────────── */}
          <button
            onClick={runAudit}
            disabled={loading || totalCount < 1}
            className="w-full relative p-0.5 inline-flex overflow-hidden rounded-xl group shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all h-auto active:translate-x-0.5 active:translate-y-0.5 active:shadow-none bg-[#10b981] hover:bg-[#059669] border-2 border-black text-white"
          >
            <span className="inline-flex size-full items-center justify-center rounded-xl px-6 py-4 font-semibold transition-all">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2 text-white" />
                  <span className="font-black text-xs tracking-widest uppercase text-white">
                    Analysing {totalCount} question{totalCount !== 1 ? "s" : ""}…
                  </span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 mr-2 text-white" />
                  <span className="font-black text-xs tracking-widest uppercase text-white">
                    Run Audit{totalCount > 0 ? ` (${totalCount})` : ""}
                  </span>
                </>
              )}
            </span>
          </button>

          <p className="text-[10px] text-[#1D1D1F]/60 text-center font-bold">
            Uses 1 analysis credit · Free: 5 questions max · Starter: 20
          </p>
        </div>
      </div>
    </div>
  );
}
