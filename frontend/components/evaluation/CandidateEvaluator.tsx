'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { evaluateCandidate } from '@/lib/api'
import { useAuth } from '@clerk/nextjs'
import { useContentModeration } from '@/hooks/useContentModeration'
import { ContentWarning } from '@/components/moderation/ContentWarning'
import { cn } from '@/lib/utils'
import { useSubscription } from '@/hooks/useSubscription'
import ExportButton from '@/components/pdf/ExportButton'


interface Question {
  id: number
  question: string
  competency: string
  weight_percent?: number
  time_minutes?: number
}

interface QuestionScore {
  id: number
  question: string
  competency: string
  score: number
  notes: string
  weight_percent: number
}

export function CandidateEvaluator({
  kit,
  onComplete
}: {
  kit: any
  onComplete?: (evaluation: any) => void
}) {
  const router = useRouter()
  const { getToken } = useAuth()
  const { planId } = useSubscription()
  const questions: Question[] = kit.questions ?? []


  const [candidateName, setCandidateName] = useState(kit.candidateName || '')
  const [scores, setScores] = useState<Record<number, {
    score: number
    notes: string
  }>>(() => {
    if (kit.initialScores) {
      // Reconstruct scores map
      const initial: Record<number, { score: number; notes: string }> = {};
      Object.entries(kit.initialScores).forEach(([k, v]: [string, any]) => {
        initial[parseInt(k)] = {
          score: v.score,
          notes: kit.initialNotes?.[k] || v.notes || ''
        };
      });
      return initial;
    }
    return {};
  })
  const [loading, setLoading] = useState(false)
  const [evaluation, setEvaluation] = useState<any>(null)
  const [step, setStep] = useState<'score' | 'result'>('score')

  // Autosave logic
  useEffect(() => {
    const saveTimer = setTimeout(async () => {
      const evalId = (kit as any)._customEvalId || kit.id;
      if (!evalId || Object.keys(scores).length === 0) return;
      
      try {
        await fetch(`/api/evaluations/${evalId}/autosave`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            scores: scores,
            notes: Object.fromEntries(Object.entries(scores).map(([k, v]) => [k, v.notes]))
          })
        });
      } catch (err) {
        console.error('Autosave failed', err);
      }
    }, 1000);

    return () => clearTimeout(saveTimer);
  }, [scores, kit]);

  const scoreLabels: Record<number, {
    label: string
    color: string
    bg: string
  }> = {
    1: { label: 'Poor',        color: 'text-red-700',     bg: 'bg-red-50 border-red-200' },
    2: { label: 'Adequate',    color: 'text-orange-700',  bg: 'bg-orange-50 border-orange-200' },
    3: { label: 'Good',        color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200' },
    4: { label: 'Strong',      color: 'text-teal-700',    bg: 'bg-teal-50 border-teal-200' },
    5: { label: 'Exceptional', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  }

  const completedCount = Object.keys(scores).filter(
    k => scores[parseInt(k)]?.score > 0
  ).length

  const allScored = completedCount === questions.length

  const evalModeration = useContentModeration('evaluate')

  // Warn on accidental navigation
  useEffect(() => {
    if (completedCount > 0 && step === 'score') {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = '';
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [completedCount, step]);

  const handleSubmit = async () => {
    if (!allScored) return

    // Final check before submission
    const allNotes = questions.map(q => scores[q.id]?.notes || '').join(' ')
    const isClean = await evalModeration.checkContent(allNotes)
    if (!isClean) return

    setLoading(true)

    const questionScores: QuestionScore[] = questions.map(q => ({
      id:            q.id,
      question:      q.question,
      competency:    q.competency,
      score:         scores[q.id]?.score ?? 0,
      notes:         scores[q.id]?.notes ?? '',
      weight_percent: q.weight_percent ?? 10
    }))

    try {
      let data: any

      // ── Custom evaluation path: POST /api/custom-eval/:id/score ──────
      if ((kit as any)._isCustomEval && (kit as any)._customEvalId) {
        const customId = (kit as any)._customEvalId
        const res = await fetch(`/api/custom-eval/${customId}/score`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scores: questionScores.map(qs => ({
              score: qs.score,
              notes: qs.notes,
            })),
            role:          kit.role,
            experience:    kit.experience_level ?? 'mid-level',
            companyType:   kit.company_type ?? 'product company',
            candidateName: candidateName || undefined,
          }),
        })
        const json = await res.json()
        if (!res.ok) {
          const err: any = new Error(json.message || json.error || 'Evaluation failed')
          err.status = res.status
          throw err
        }
        data = json.evaluation

      // ── Standard kit evaluation path ─────────────────────────────────
      } else {
        const token = await getToken({ template: "backend" }).catch(() => getToken())
        data = await evaluateCandidate({
          kitId:         kit.id ?? 'unknown',
          role:          kit.role,
          experience:    kit.experience_level,
          companyType:   kit.company_type,
          candidateName: candidateName || undefined,
          questionScores,
          kitSummary:    kit.kit_summary
        }, token)
      }

      setEvaluation(data)
      setStep('result')
      onComplete?.(data)

    } catch (err: any) {
      console.error('Evaluation error:', err)
      if (err.status === 403) {
        router.push('/pricing?feature=evaluation')
      }
    } finally {
      setLoading(false)
    }
  }

  // ── SCORING FORM ──
  if (step === 'score') {
    return (
      <div className="space-y-4">

        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-lg font-bold text-[#1D1D1F] mb-1">
              Evaluate Candidate
            </h3>
            <p className="text-sm text-[#86868B]">
              Score each answer on a 1-5 scale based on your interview notes.
            </p>
          </div>

          {/* Candidate name */}
          <div className="space-y-2">
             <label className="text-[10px] font-bold text-[#86868B] uppercase tracking-[0.1em] ml-1">Candidate Name</label>
             <input
              type="text"
              placeholder="e.g. Jane Doe (optional)"
              value={candidateName}
              onChange={e => setCandidateName(e.target.value)}
              className="w-full text-sm font-medium border border-black/[0.05] bg-[#F5F5F7]/50 rounded-xl px-4 py-3 focus:outline-none focus:border-[#3b82f6]/30 focus:ring-4 focus:ring-black/5 transition-all"
            />
          </div>
        </div>

        {/* Progress */}
        <div className="px-1 mb-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[#86868B] mb-2">
            <span>{completedCount} of {questions.length} scored</span>
            <span>{Math.round(completedCount/questions.length*100)}%</span>
          </div>
          <div className="h-1.5 bg-[#F5F5F7] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#3b82f6] to-[#2563eb] rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(completedCount/questions.length)*100}%` }}
            />
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-3">
          {questions.map((q, idx) => {
            const qScore = scores[q.id]
            const selected = qScore?.score ?? 0

            return (
              <div
                key={q.id}
                className={`bg-white border rounded-2xl p-5 transition-all duration-200 ${
                  selected > 0
                    ? 'border-[#3b82f6]/30 shadow-[0_2px_12px_rgba(59,130,246,0.04)]'
                    : 'border-black/[0.05] hover:border-black/[0.1]'
                }`}
              >
                {/* Question */}
                <div className="flex gap-4 mb-5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5 transition-colors ${
                    selected > 0
                      ? 'bg-[#3b82f6] text-white'
                      : 'bg-[#F5F5F7] text-[#86868B]'
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#86868B] uppercase tracking-[0.1em] mb-1">
                      {q.competency}
                    </p>
                    <p className="text-sm font-semibold text-[#1D1D1F] leading-relaxed">
                      {q.question}
                    </p>
                  </div>
                </div>

                {/* Score buttons */}
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map(score => {
                    const config = scoreLabels[score]
                    const isSelected = selected === score

                    return (
                      <button
                        key={score}
                        onClick={() => setScores(prev => ({
                          ...prev,
                          [q.id]: {
                            score,
                            notes: prev[q.id]?.notes ?? ''
                          }
                        }))}
                        className={`py-2 rounded-xl border text-center transition-all duration-200 ${
                          isSelected
                            ? `${config.bg} ${config.color} border-current shadow-sm scale-[1.02]`
                            : 'bg-white text-[#86868B] border-black/[0.05] hover:bg-[#F5F5F7] hover:border-black/[0.1]'
                        }`}
                      >
                        <div className={`text-base font-bold mb-0.5 ${isSelected ? '' : 'text-[#1D1D1F]'}`}>
                          {score}
                        </div>
                        <div className={`text-[9px] font-semibold uppercase tracking-wider ${isSelected ? '' : 'opacity-70'}`}>
                          {config.label}
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Notes */}
                <textarea
                  placeholder="Notes on this answer (optional but helpful for AI evaluation)..."
                  value={scores[q.id]?.notes ?? ''}
                  onChange={async e => {
                    const notes = e.target.value
                    setScores(prev => ({
                      ...prev,
                      [q.id]: {
                        score: prev[q.id]?.score ?? 0,
                        notes
                      }
                    }))
                    if (notes.length > 10) {
                      await evalModeration.checkContent(notes)
                    } else {
                      evalModeration.clearModeration()
                    }
                  }}
                  rows={2}
                  className={cn(
                    "w-full text-[13px] border rounded-xl px-4 py-3 resize-none focus:outline-none focus:border-[#3b82f6]/30 focus:ring-4 focus:ring-black/5 transition-all font-medium",
                    evalModeration.isBlocked 
                      ? "border-red-300 bg-red-50/30 text-red-900 placeholder:text-red-900/40" 
                      : "border-black/[0.05] bg-[#F5F5F7]/30 placeholder:text-[#86868B]/60"
                  )}
                />
              </div>
            )
          })}
        </div>

        <ContentWarning
          warning={evalModeration.warning}
          severity={evalModeration.severity}
          category={evalModeration.category}
          isChecking={evalModeration.isChecking}
        />

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!allScored || loading || evalModeration.isBlocked || evalModeration.isChecking}
          className={`w-full mt-4 py-4 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all ${
            allScored && !loading && !evalModeration.isBlocked
              ? 'bg-[#3b82f6] text-white hover:bg-[#2563eb] shadow-[0_4px_14px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)] hover:-translate-y-0.5'
              : 'bg-[#F5F5F7] text-[#86868B] cursor-not-allowed border border-black/[0.05]'
          }`}
        >
          {evalModeration.isBlocked ? (
            'Fix content to continue'
          ) : loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing candidate...
            </span>
          ) : allScored
            ? 'Generate Evaluation Report ↗'
            : `Score all questions to continue (${completedCount}/${questions.length})`
          }
        </button>
      </div>
    )
  }

  // ── EVALUATION RESULT ──
  return (
    <EvaluationResult
      evaluation={evaluation}
      candidateName={candidateName}
      role={kit.role}
      planId={planId}
    />

  )
}

// ── RESULT DISPLAY ──
function EvaluationResult({
  evaluation,
  candidateName,
  role,
  planId
}: {
  evaluation: any
  candidateName: string
  role: string
  planId: string
}) {

  const recommendationConfig = {
    HIRE: {
      bg:    'bg-gradient-to-br from-blue-600 to-blue-800',
      badge: 'bg-white/20 text-white backdrop-blur-md',
      icon:  '✓',
      label: 'Recommended to Hire'
    },
    HOLD: {
      bg:    'bg-gradient-to-br from-amber-500 to-amber-700',
      badge: 'bg-white/20 text-white backdrop-blur-md',
      icon:  '⟳',
      label: 'Hold — Further Assessment Needed'
    },
    REJECT: {
      bg:    'bg-gradient-to-br from-red-600 to-red-800',
      badge: 'bg-white/20 text-white backdrop-blur-md',
      icon:  '✕',
      label: 'Not Recommended'
    }
  }

  const rec = (evaluation.recommendation || 'HOLD').toUpperCase() as 'HIRE' | 'HOLD' | 'REJECT'
  const config = recommendationConfig[rec] || recommendationConfig.HOLD
  
  return (
    <div id="evaluation-container" className="space-y-4 bg-[#F5F5F7]">

      {/* Hero recommendation card */}
      <div className={`page-break-avoid ${config.bg} rounded-[2rem] p-8 text-white shadow-lg overflow-hidden relative`}>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-[80px]" />
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
          <div>
            <p className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em] mb-2">
              Candidate Evaluation
            </p>
            <h2 className="text-2xl md:text-3xl font-bold mb-1">
              {candidateName || 'Candidate'}
            </h2>
            <p className="text-sm font-medium text-white/80 mb-5">
              {role}
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm tracking-wide border border-white/10 shadow-sm bg-black/10 backdrop-blur-md">
              <span className="opacity-90">{config.icon}</span> 
              {config.label}
            </div>
          </div>
          <div className="md:text-right flex-shrink-0 bg-black/10 backdrop-blur-md p-5 rounded-2xl border border-white/10">
            <div className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em] mb-1">
              Overall Score
            </div>
            <div className="flex items-baseline md:justify-end gap-1">
              <span className="text-5xl font-black tabular-nums">{evaluation.overall_score}</span>
              <span className="text-xl font-bold text-white/50">/100</span>
            </div>
            <div className="text-xs font-semibold text-white/70 mt-2 bg-black/20 inline-block px-2 py-1 rounded">
              {evaluation.confidence} confidence
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="page-break-avoid bg-white border border-black/[0.05] rounded-2xl p-6 shadow-sm">
        <p className="text-[10px] font-bold text-[#86868B] uppercase tracking-[0.1em] mb-3">
          Overall Assessment
        </p>
        <p className="text-[15px] text-[#1D1D1F] font-medium leading-relaxed">
          {evaluation.summary}
        </p>
      </div>

      {/* Reasoning */}
      {(evaluation.hire_reasoning || evaluation.reject_reasoning || evaluation.hold_reasoning) && (
        <div className={`page-break-avoid border rounded-2xl p-6 shadow-sm ${
          rec === 'HIRE'   ? 'bg-emerald-50/50 border-emerald-100' :
          rec === 'REJECT' ? 'bg-red-50/50 border-red-100' :
                             'bg-amber-50/50 border-amber-100'
        }`}>
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] mb-3 opacity-60">
            Why {rec.toLowerCase()}
          </p>
          <p className="text-[14px] font-medium leading-relaxed text-black/80">
            {evaluation.hire_reasoning || evaluation.reject_reasoning || evaluation.hold_reasoning}
          </p>
        </div>
      )}

      {/* Strengths + Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="page-break-avoid bg-white border border-black/[0.05] rounded-2xl p-6 shadow-sm">
          <p className="text-[10px] font-bold text-[#86868B] uppercase tracking-[0.1em] mb-4">
            Strengths Identified
          </p>
          <div className="space-y-4">
            {(evaluation.strengths ?? []).length > 0 ? (
              (evaluation.strengths ?? []).map((s: any, i: number) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1D1D1F] mb-0.5">{s.competency}</p>
                    <p className="text-[13px] text-[#424245] leading-relaxed">{s.observation}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#86868B] italic">No notable strengths identified.</p>
            )}
          </div>
        </div>

        {/* Gaps */}
        <div className="page-break-avoid bg-white border border-black/[0.05] rounded-2xl p-6 shadow-sm">
          <p className="text-[10px] font-bold text-[#86868B] uppercase tracking-[0.1em] mb-4">
            Areas of Concern
          </p>
          <div className="space-y-4">
            {(evaluation.gaps ?? []).length > 0 ? (
              (evaluation.gaps ?? []).map((g: any, i: number) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    g.severity === 'CRITICAL' ? 'bg-red-100 text-red-600' :
                    g.severity === 'MODERATE' ? 'bg-amber-100 text-amber-600' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {g.severity === 'CRITICAL' 
                        ? <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        : <path d="M6 3V6M6 9H6.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      }
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-bold text-[#1D1D1F]">{g.competency}</p>
                      {g.can_be_trained && (
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">Trainable</span>
                      )}
                    </div>
                    <p className="text-[13px] text-[#424245] leading-relaxed">{g.observation}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#86868B] italic">No significant gaps identified.</p>
            )}
          </div>
        </div>
      </div>

      {/* Competency breakdown */}
      <div className="page-break-avoid bg-white border border-black/[0.05] rounded-2xl p-6 shadow-sm">
        <p className="text-[10px] font-bold text-[#86868B] uppercase tracking-[0.1em] mb-5">
          Competency Scores
        </p>
        <div className="space-y-5">
          {(evaluation.competency_breakdown ?? []).map((c: any, i: number) => (
            <div key={i}>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-bold text-[#1D1D1F]">{c.competency}</span>
                <span className="font-bold tabular-nums text-[#86868B]">{c.score}<span className="text-xs text-[#86868B]/60">/5</span></span>
              </div>
              <div className="flex gap-1 h-2 mb-2">
                {[1,2,3,4,5].map(idx => (
                  <div 
                    key={idx} 
                    className={`flex-1 rounded-full ${
                      idx <= c.score 
                        ? (c.score >= 4 ? 'bg-blue-500' : c.score >= 3 ? 'bg-blue-400' : c.score >= 2 ? 'bg-amber-500' : 'bg-red-500')
                        : 'bg-[#F5F5F7]'
                    }`} 
                  />
                ))}
              </div>
              <p className="text-[12px] font-medium text-[#424245] leading-relaxed">
                {c.assessment}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Next steps */}
      <div className="page-break-avoid bg-white border border-black/[0.05] rounded-2xl p-6 shadow-sm">
        <p className="text-[10px] font-bold text-[#86868B] uppercase tracking-[0.1em] mb-4">
          Recommended Next Steps
        </p>
        <div className="space-y-3">
          {(evaluation.next_steps?.[
            rec === 'HIRE' ? 'if_hire' : rec === 'HOLD' ? 'if_hold' : 'if_reject'
          ] ?? []).map((step: string, i: number) => (
            <div key={i} className="flex gap-3 items-start p-3 bg-[#F5F5F7]/50 rounded-xl">
              <span className="text-[#1e1b4b] font-bold flex-shrink-0 mt-0.5">→</span>
              <p className="text-[13px] font-medium text-[#1D1D1F] leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bias check alert */}
      {evaluation.bias_check?.potential_bias_detected && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex gap-3 items-start">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="text-sm font-bold text-amber-900 mb-1">
                Potential Scoring Bias Detected
              </p>
              <p className="text-[13px] text-amber-800 leading-relaxed font-medium">
                {evaluation.bias_check.bias_note}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Interviewer feedback */}
      {evaluation.interview_quality_feedback && (
        <div className="bg-[#F5F5F7] border border-black/[0.05] rounded-2xl p-5 no-print">
          <p className="text-[10px] font-bold text-[#86868B] uppercase tracking-[0.1em] mb-2">
            Interviewer Feedback (Private)
          </p>
          <p className="text-[13px] font-medium text-[#424245]">
            {evaluation.interview_quality_feedback}
          </p>
        </div>
      )}

      <div id="pdf-action-buttons" className="flex gap-3 pt-2 no-print">
        <ExportButton 
          type="evaluation" 
          id={evaluation.id} 
          planTier={planId} 
          className="flex-1"
        />
        <button
          onClick={() => window.location.reload()}
          className="flex-1 py-4 bg-[#3b82f6] text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-[#3b82f6]/20 hover:bg-[#2563eb] hover:shadow-[#3b82f6]/30 hover:-translate-y-0.5 transition-all"
        >
          Evaluate Another
        </button>
      </div>
    </div>
  )
}
