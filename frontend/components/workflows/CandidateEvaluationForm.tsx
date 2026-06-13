"use client";

import { useState } from "react";
import { submitWorkflowEvaluation } from "@/lib/workflows/workflowService";
import { ScorecardOutput } from "@/lib/workflows/types";
import { Loader2, CheckCircle2, User, Mail, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface CandidateEvaluationFormProps {
  workflowId: string;
  roleTitle: string;
  scorecard: ScorecardOutput;
  token: string;
  onSuccess: (evaluation: any) => void;
}

type Recommendation = "STRONG_HIRE" | "HIRE" | "HOLD" | "NO_HIRE";

const RECOMMENDATION_OPTIONS: { value: Recommendation; label: string; color: string; bg: string; border: string }[] = [
  { value: "STRONG_HIRE", label: "Strong Hire", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-300" },
  { value: "HIRE", label: "Hire", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-300" },
  { value: "HOLD", label: "Hold", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-300" },
  { value: "NO_HIRE", label: "No Hire", color: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
];

export function CandidateEvaluationForm({
  workflowId,
  roleTitle,
  scorecard,
  token,
  onSuccess,
}: CandidateEvaluationFormProps) {
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [scores, setScores] = useState<Record<string, { score: number; notes: string }>>(
    Object.fromEntries((scorecard?.criteria || []).map((c) => [c.name, { score: 3, notes: "" }]))
  );
  const [recommendation, setRecommendation] = useState<Recommendation>("HOLD");
  const [finalSummary, setFinalSummary] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateScore = (name: string, field: "score" | "notes", value: string | number) => {
    setScores((prev) => ({
      ...prev,
      [name]: { ...prev[name], [field]: value },
    }));
  };

  const computedAvg =
    Object.values(scores).length > 0
      ? Math.round((Object.values(scores).reduce((s, v) => s + v.score, 0) / Object.values(scores).length) * 10) / 10
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim()) {
      setError("Candidate name is required.");
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const scoresArray = (scorecard?.criteria || []).map((c) => ({
        criterionName: c.name,
        score: scores[c.name]?.score ?? 3,
        notes: scores[c.name]?.notes ?? "",
      }));

      const emailTrimmed = candidateEmail.trim();
      const summaryTrimmed = finalSummary.trim();

      const result = await submitWorkflowEvaluation(
        workflowId,
        {
          candidateName: candidateName.trim(),
          ...(emailTrimmed ? { candidateEmail: emailTrimmed } : {}),
          scores: scoresArray,
          evidenceNotes: {},
          recommendation,
          ...(summaryTrimmed ? { finalSummary: summaryTrimmed } : {}),
        },
        token
      );

      onSuccess(result.evaluation);
    } catch (err: any) {
      setError(err.message || "Failed to submit evaluation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Candidate Info */}
      <div className="space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B]">Candidate Information</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold text-[#1D1D1F]">
              <User className="w-3.5 h-3.5 text-[#86868B]" /> Candidate Name *
            </label>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              placeholder="e.g. Alex Johnson"
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-black/[0.08] bg-white text-sm font-medium placeholder:text-[#86868B]/60 focus:outline-none focus:border-black/40 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold text-[#1D1D1F]">
              <Mail className="w-3.5 h-3.5 text-[#86868B]" /> Email (optional)
            </label>
            <input
              type="email"
              value={candidateEmail}
              onChange={(e) => setCandidateEmail(e.target.value)}
              placeholder="alex@example.com"
              className="w-full px-4 py-3 rounded-xl border-2 border-black/[0.08] bg-white text-sm font-medium placeholder:text-[#86868B]/60 focus:outline-none focus:border-black/40 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Scorecard Criteria */}
      {scorecard?.criteria?.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B]">Scorecard Evaluation</p>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black text-[#86868B] uppercase tracking-wider">Avg Score:</span>
              <span className={cn(
                "text-sm font-black px-2 py-0.5 rounded-full",
                computedAvg >= 4 ? "text-emerald-600 bg-emerald-50" :
                computedAvg >= 3 ? "text-amber-600 bg-amber-50" :
                "text-red-600 bg-red-50"
              )}>
                {computedAvg}/5
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {scorecard.criteria.map((criterion) => {
              const scoreVal = scores[criterion.name]?.score ?? 3;
              return (
                <div key={criterion.name} className="p-4 md:p-5 rounded-2xl border-2 border-black/[0.06] bg-white space-y-3">
                  <div>
                    <h4 className="text-sm font-black text-[#1D1D1F]">{criterion.name}</h4>
                    <p className="text-xs font-medium text-[#86868B] mt-0.5 leading-relaxed">{criterion.description}</p>
                  </div>

                  {/* Score buttons 1–5 */}
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => updateScore(criterion.name, "score", n)}
                        className={cn(
                          "flex-1 py-2.5 rounded-xl border-2 text-sm font-black transition-all active:scale-95",
                          scoreVal === n
                            ? "border-black bg-[#1D1D1F] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]"
                            : "border-black/[0.08] text-[#86868B] hover:border-black/20 hover:text-[#1D1D1F] bg-[#F5F5F7]"
                        )}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between text-[9px] font-bold text-[#86868B] px-0.5">
                    <span>Poor</span><span>Below</span><span>Meets</span><span>Exceeds</span><span>Stellar</span>
                  </div>

                  {/* Notes */}
                  <textarea
                    value={scores[criterion.name]?.notes ?? ""}
                    onChange={(e) => updateScore(criterion.name, "notes", e.target.value)}
                    placeholder={`Interviewer notes for ${criterion.name}...`}
                    rows={2}
                    className="w-full px-3 py-2.5 rounded-xl border border-black/[0.08] bg-[#F5F5F7]/60 text-xs font-medium placeholder:text-[#86868B]/60 focus:outline-none focus:border-black/20 transition-all resize-none"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommendation */}
      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B]">Hiring Recommendation</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {RECOMMENDATION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRecommendation(opt.value)}
              className={cn(
                "py-3 px-2 rounded-2xl border-2 text-xs font-black transition-all active:scale-95",
                recommendation === opt.value
                  ? `${opt.bg} ${opt.border} ${opt.color} shadow-sm`
                  : "border-black/[0.08] text-[#86868B] hover:border-black/15 bg-white"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-xs font-bold text-[#1D1D1F]">
          <FileText className="w-3.5 h-3.5 text-[#86868B]" /> Final Interview Summary
        </label>
        <textarea
          value={finalSummary}
          onChange={(e) => setFinalSummary(e.target.value)}
          placeholder="Summarize your overall assessment of the candidate — strengths, concerns, and fit for the role..."
          rows={4}
          className="w-full px-4 py-3 rounded-xl border-2 border-black/[0.08] bg-white text-sm font-medium placeholder:text-[#86868B]/60 focus:outline-none focus:border-black/40 transition-all resize-none"
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl">{error}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 h-14 rounded-2xl bg-[#1D1D1F] text-white font-black text-sm hover:bg-black transition-all active:scale-[0.99] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Submitting Evaluation...
          </>
        ) : (
          <>
            <CheckCircle2 className="w-5 h-5" />
            Submit Candidate Evaluation
          </>
        )}
      </button>
    </form>
  );
}
