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
import { LoadingState } from '@/components/LoadingState'
import { useBackendToken } from '@/hooks/useBackendToken'
import ResponsiveResultCard from '@/components/results/ResponsiveResultCard'
import ResultSection from '@/components/results/ResultSection'


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
  const { isLoaded, userId } = useAuth()
  const { getAuthToken } = useBackendToken()
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
      if (!evalId || Object.keys(scores).length === 0 || !isLoaded || !userId) return;
      
      try {
        const token = await getAuthToken()
        if (!token) return
        await fetch(`/api/evaluations/${evalId}/autosave`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
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
  }, [scores, kit, isLoaded, userId, getAuthToken]);

  const scoreLabels: Record<number, {
    label: string
    shortLabel: string
    color: string
    bg: string
    selectedText: string
  }> = {
    1: { label: 'Poor',        shortLabel: 'Poor', color: 'text-red-800',     bg: 'bg-red-100 border-red-400',     selectedText: 'text-red-800' },
    2: { label: 'Adequate',    shortLabel: 'Adqt', color: 'text-orange-800',  bg: 'bg-orange-100 border-orange-400', selectedText: 'text-orange-800' },
    3: { label: 'Good',        shortLabel: 'Good', color: 'text-amber-800',   bg: 'bg-amber-100 border-amber-400', selectedText: 'text-amber-800' },
    4: { label: 'Strong',      shortLabel: 'Stng', color: 'text-teal-800',    bg: 'bg-teal-100 border-teal-400',   selectedText: 'text-teal-800' },
    5: { label: 'Exceptional', shortLabel: 'Excl', color: 'text-emerald-800', bg: 'bg-emerald-100 border-emerald-400', selectedText: 'text-emerald-800' },
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
      const token = await getAuthToken()
      if (!token) return

      // ── Custom evaluation path: POST /api/custom-eval/:id/score ──────
      if ((kit as any)._isCustomEval && (kit as any)._customEvalId) {
        const customId = (kit as any)._customEvalId
        const res = await fetch(`/api/custom-eval/${customId}/score`, {
          method:  'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
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
      <div className="space-y-3.5 lg:space-y-5">
        {loading && <LoadingState text="Analyzing candidate..." />}

        {/* Header */}
        <div className="bg-white border border-black/10 rounded-xl p-3 sm:p-4 lg:p-6 xl:p-8 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] lg:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] lg:rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base lg:text-xl xl:text-2xl font-extrabold text-[#1D1D1F] tracking-tight">
                Evaluate Candidate
              </h3>
              <p className="text-[11px] sm:text-xs lg:text-sm text-[#86868B] leading-tight mt-0.5">
                Score each answer on a 1-5 scale based on your interview notes.
              </p>
            </div>

            {/* Candidate name */}
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto max-w-xs">
              <div className="w-full">
                <label className="block text-[8px] font-black text-[#86868B] uppercase tracking-wider mb-1 ml-0.5">Candidate Name</label>
                <input
                  type="text"
                  placeholder="e.g. Jane Doe (optional)"
                  value={candidateName}
                  onChange={e => setCandidateName(e.target.value)}
                  className="w-full text-xs font-semibold border border-black/10 bg-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-neutral-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="px-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-[#86868B] mb-1.5">
            <span>{completedCount} of {questions.length} scored</span>
            <span>{Math.round(completedCount/questions.length*100)}%</span>
          </div>
          <div className="h-1 bg-[#F5F5F7] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#3b82f6] to-[#2563eb] rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(completedCount/questions.length)*100}%` }}
            />
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-2.5">
          {questions.map((q, idx) => {
            const qScore = scores[q.id]
            const selected = qScore?.score ?? 0

            return (
              <div
                key={q.id}
                className={`bg-white border rounded-xl p-3 sm:p-4 lg:p-5 xl:p-6 transition-all duration-200 ${
                  selected > 0
                    ? 'border-[#3b82f6]/30 shadow-[0_1px_8px_rgba(59,130,246,0.03)]'
                    : 'border-black/[0.05] hover:border-black/[0.1]'
                }`}
              >
                <div className="md:grid md:grid-cols-12 md:gap-4 md:items-start">
                  {/* Left Column: Question number + competency + question text */}
                  <div className="md:col-span-7 flex gap-3 min-w-0">
                    <div className={cn(
                      "w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center text-[10px] sm:text-xs lg:text-sm font-black flex-shrink-0 mt-0.5 border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-colors",
                      selected > 0 ? "bg-[#3b82f6] text-white" : "bg-neutral-100 text-neutral-500"
                    )}>
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="inline-block text-[7px] sm:text-[8px] lg:text-[10px] font-black px-1.5 py-0.5 rounded border uppercase tracking-wider bg-neutral-50 text-[#86868B] border-black/5">
                        {q.competency}
                      </span>
                      <p className="text-xs sm:text-[13px] lg:text-base xl:text-lg font-semibold text-[#1D1D1F] leading-snug mt-1.5">
                        {q.question}
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Score buttons + Notes textarea */}
                  <div className="md:col-span-5 space-y-2 mt-3 md:mt-0">
                    {/* Score buttons grid */}
                    <div className="grid grid-cols-5 gap-1 lg:gap-2">
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
                            className={cn(
                              "py-1.5 sm:py-2 lg:py-3 rounded-lg border text-center transition-all duration-200",
                              isSelected
                                ? `${config.bg} border-2 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] scale-[1.02]`
                                : "bg-white border-black/15 hover:bg-neutral-50 hover:border-black/30 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
                            )}
                          >
                            <div className={cn(
                              "text-xs sm:text-sm lg:text-base font-black mb-0.5",
                              isSelected ? config.selectedText : "text-neutral-800"
                            )}>
                              {score}
                            </div>
                            <div className={cn(
                              "text-[9px] sm:text-[10px] lg:text-[11px] font-extrabold uppercase tracking-wide leading-none",
                              isSelected ? config.selectedText : "text-neutral-600"
                            )}>
                              <span className="hidden sm:inline">{config.label}</span>
                              <span className="sm:hidden">{config.shortLabel}</span>
                            </div>
                          </button>
                        )
                      })}
                    </div>

                    {/* Notes */}
                    <textarea
                      placeholder="Notes on this answer (optional)..."
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
                      rows={1}
                      className={cn(
                        "w-full text-[11px] sm:text-xs border rounded-lg px-2.5 py-1.5 resize-none focus:outline-none focus:border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all font-semibold leading-relaxed",
                        evalModeration.isBlocked 
                          ? "border-red-300 bg-red-50/30 text-red-900 placeholder:text-red-900/40" 
                          : "border-black/10 bg-white placeholder:text-[#86868B]/50"
                      )}
                    />
                  </div>
                </div>
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
          className={cn(
            "w-full mt-2 py-3 lg:py-4 rounded-xl lg:rounded-2xl text-xs lg:text-sm font-black uppercase tracking-wider transition-all",
            allScored && !loading && !evalModeration.isBlocked
              ? 'bg-[#3b82f6] text-white border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] lg:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5'
              : 'bg-[#F5F5F7] text-[#86868B] cursor-not-allowed border border-black/10'
          )}
        >
          {evalModeration.isBlocked ? (
            'Fix content to continue'
          ) : loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
      bg:    'bg-indigo-600',
      border: 'border-black',
      badge: 'bg-white/20 text-white backdrop-blur-md',
      icon:  '✓',
      label: 'Recommended to Hire'
    },
    HOLD: {
      bg:    'bg-amber-600',
      border: 'border-black',
      badge: 'bg-white/20 text-white backdrop-blur-md',
      icon:  '⟳',
      label: 'Hold — Further Assessment Needed'
    },
    REJECT: {
      bg:    'bg-red-600',
      border: 'border-black',
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
      <div className="page-break-avoid bg-[#3b82f6] border-2 border-black rounded-xl p-3.5 sm:p-5 lg:p-8 xl:p-10 text-white overflow-hidden relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] lg:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] lg:rounded-2xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -mr-24 -mt-24" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 lg:gap-8">
          <div className="space-y-2.5 lg:space-y-4 w-full md:max-w-xl">
            <div>
              <p className="text-[8px] lg:text-[10px] font-black text-white/60 uppercase tracking-widest mb-0.5">
                Candidate Evaluation
              </p>
              <h2 className="text-base sm:text-lg lg:text-3xl xl:text-4xl font-black text-white tracking-tight leading-tight break-words">
                {candidateName || 'Unnamed Candidate'}
              </h2>
              <p className="text-[9px] lg:text-xs font-black text-white/60 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                {role}
              </p>
            </div>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 lg:px-5 lg:py-3 rounded-xl lg:rounded-2xl font-black text-[9px] lg:text-xs uppercase tracking-widest border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] lg:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white text-black mt-1">
              <span className="opacity-90">{config.icon}</span> 
              {config.label}
            </div>
          </div>
          
          <div className="flex flex-row md:flex-col items-center md:items-end gap-3 lg:gap-5 justify-between w-full md:w-auto border-t border-white/10 pt-2.5 md:border-t-0 md:pt-0">
            <div className="text-left md:text-right">
              <div className="text-[8px] lg:text-xs font-black text-white/60 uppercase tracking-widest mb-0.5">
                Overall Score
              </div>
              <div className="text-xl sm:text-2xl lg:text-5xl xl:text-6xl font-black text-white tracking-tighter">
                {evaluation.overall_score}<span className="text-xs lg:text-base text-white/40">/100</span>
              </div>
            </div>
            <div className="px-3 py-1.5 lg:px-5 lg:py-3 rounded-xl lg:rounded-2xl border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] lg:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center text-center bg-white text-black min-w-[100px] lg:min-w-[140px]">
              <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest opacity-60 mb-0.5">Confidence</span>
              <span className="text-[9px] lg:text-xs font-black uppercase tracking-widest text-[#3b82f6]">{evaluation.confidence}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <ResponsiveResultCard className="page-break-avoid border-black/10 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <ResultSection title="Overall Assessment">
          <p className="text-sm sm:text-[15px] font-medium leading-relaxed">
            {evaluation.summary}
          </p>
        </ResultSection>
      </ResponsiveResultCard>

      {/* Reasoning */}
      {(evaluation.hire_reasoning || evaluation.reject_reasoning || evaluation.hold_reasoning) && (
        <ResponsiveResultCard className={cn(
          "page-break-avoid border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
          rec === 'HIRE'   ? 'bg-emerald-50/50 border-emerald-100 text-emerald-950 dark:text-emerald-50' :
          rec === 'REJECT' ? 'bg-red-50/50 border-red-100 text-red-950 dark:text-red-50' :
                             'bg-amber-50/50 border-amber-100 text-amber-950 dark:text-amber-50'
        )}>
          <ResultSection title={`Why ${rec.toLowerCase()}`} titleClassName="opacity-60">
            <p className="text-xs sm:text-[14px] font-medium leading-relaxed">
              {evaluation.hire_reasoning || evaluation.reject_reasoning || evaluation.hold_reasoning}
            </p>
          </ResultSection>
        </ResponsiveResultCard>
      )}

      {/* Strengths + Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <ResponsiveResultCard className="page-break-avoid border-black/10 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <ResultSection title="Strengths Identified">
            <div className="space-y-4 mt-2">
              {(evaluation.strengths ?? []).length > 0 ? (
                (evaluation.strengths ?? []).map((s: any, i: number) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-[#1D1D1F] dark:text-white mb-0.5">{s.competency}</p>
                      <p className="text-xs sm:text-[13px] text-[#424245] dark:text-neutral-400 leading-relaxed">{s.observation}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs sm:text-sm text-[#86868B] italic">No notable strengths identified.</p>
              )}
            </div>
          </ResultSection>
        </ResponsiveResultCard>

        {/* Gaps */}
        <ResponsiveResultCard className="page-break-avoid border-black/10 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <ResultSection title="Areas of Concern">
            <div className="space-y-4 mt-2">
              {(evaluation.gaps ?? []).length > 0 ? (
                (evaluation.gaps ?? []).map((g: any, i: number) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      g.severity === 'CRITICAL' ? 'bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400' :
                      g.severity === 'MODERATE' ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400' :
                      'bg-gray-100 dark:bg-neutral-905/50 text-gray-500 dark:text-neutral-400'
                    }`}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {g.severity === 'CRITICAL' 
                          ? <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          : <path d="M6 3V6M6 9H6.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        }
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <p className="text-xs sm:text-sm font-bold text-[#1D1D1F] dark:text-white break-words">{g.competency}</p>
                        {g.can_be_trained && (
                          <span className="text-[8px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded">Trainable</span>
                        )}
                      </div>
                      <p className="text-xs sm:text-[13px] text-[#424245] dark:text-neutral-400 leading-relaxed">{g.observation}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs sm:text-sm text-[#86868B] italic">No significant gaps identified.</p>
              )}
            </div>
          </ResultSection>
        </ResponsiveResultCard>
      </div>

      {/* Competency breakdown */}
      <ResponsiveResultCard className="page-break-avoid border-black/10 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <ResultSection title="Competency Scores">
          <div className="space-y-5 mt-4">
            {(evaluation.competency_breakdown ?? []).map((c: any, i: number) => (
              <div key={i}>
                <div className="flex justify-between text-xs sm:text-sm mb-2">
                  <span className="font-bold text-[#1D1D1F] dark:text-white">{c.competency}</span>
                  <span className="font-bold tabular-nums text-[#86868B]">{c.score}<span className="text-xs text-[#86868B]/60">/5</span></span>
                </div>
                <div className="flex gap-1 h-2 mb-2">
                  {[1,2,3,4,5].map(idx => (
                    <div 
                      key={idx} 
                      className={`flex-1 rounded-full ${
                        idx <= c.score 
                          ? (c.score >= 4 ? 'bg-[#3b82f6]' : c.score >= 3 ? 'bg-[#60a5fa]' : c.score >= 2 ? 'bg-amber-500' : 'bg-red-500')
                          : 'bg-[#F5F5F7] dark:bg-neutral-800'
                      }`} 
                    />
                  ))}
                </div>
                <p className="text-xs sm:text-[12px] font-medium text-[#424245] dark:text-neutral-400 leading-relaxed">
                  {c.assessment}
                </p>
              </div>
            ))}
          </div>
        </ResultSection>
      </ResponsiveResultCard>

      {/* Next steps */}
      <ResponsiveResultCard className="page-break-avoid border-black/10 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <ResultSection title="Recommended Next Steps">
          <div className="space-y-3 mt-4">
            {(evaluation.next_steps?.[
              rec === 'HIRE' ? 'if_hire' : rec === 'HOLD' ? 'if_hold' : 'if_reject'
            ] ?? []).map((step: string, i: number) => (
              <div key={i} className="flex gap-3 items-start p-3 bg-[#F5F5F7]/50 dark:bg-neutral-900/50 border border-black/[0.03] dark:border-white/[0.03] rounded-xl">
                <span className="text-[#3b82f6] font-bold flex-shrink-0 mt-0.5">→</span>
                <p className="text-xs sm:text-[13px] font-medium text-[#1D1D1F] dark:text-neutral-300 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </ResultSection>
      </ResponsiveResultCard>

      {/* Bias check alert */}
      {evaluation.bias_check?.potential_bias_detected && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5">
          <div className="flex gap-3 items-start">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="text-xs sm:text-sm font-bold text-amber-900 mb-1">
                Potential Scoring Bias Detected
              </p>
              <p className="text-xs sm:text-[13px] text-amber-800 leading-relaxed font-medium">
                {evaluation.bias_check.bias_note}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Interviewer feedback */}
      {evaluation.interview_quality_feedback && (
        <div className="bg-[#F5F5F7] border border-black/10 rounded-2xl p-4 sm:p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] no-print">
          <p className="text-[10px] font-bold text-[#86868B] uppercase tracking-[0.1em] mb-2">
            Interviewer Feedback (Private)
          </p>
          <p className="text-xs sm:text-[13px] font-medium text-[#424245]">
            {evaluation.interview_quality_feedback}
          </p>
        </div>
      )}

      <div id="pdf-action-buttons" className="flex flex-col sm:flex-row gap-3 lg:gap-5 pt-2 no-print">
        <ExportButton 
          type="evaluation" 
          id={evaluation.id} 
          planTier={planId} 
          className="w-full sm:flex-1"
        />
        <button
          onClick={() => window.location.reload()}
          className="w-full sm:flex-1 py-4 lg:py-5 bg-indigo-600 text-white rounded-2xl text-xs lg:text-sm font-bold uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
        >
          Evaluate Another
        </button>
      </div>
    </div>
  )
}
