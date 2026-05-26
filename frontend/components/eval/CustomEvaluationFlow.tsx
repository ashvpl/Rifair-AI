'use client'

import { useState, useEffect, useRef } from 'react'
import { draftStorage } from '@/lib/persistence/draftStorage'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, AlertTriangle, CheckCircle, Loader2, ShieldCheck, ArrowRight, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CandidateEvaluator } from '@/components/evaluation/CandidateEvaluator'
import { LoadingState } from '@/components/LoadingState'
import BiasCheckResults from './BiasCheckResults'
import { useBackendToken } from '@/hooks/useBackendToken'

// ── Types ───────────────────────────────────────────────────────────────────

interface EnrichedQuestion {
  id: number
  text: string
  type: string
  competency: string
  biasScore: number
  biasTags: string[]
  biasIssue: string
  aiRewrite?: string | null
}

interface SessionData {
  id: string
  title: string
  questions: EnrichedQuestion[]
  biasResults: { score: number; tags: string[]; oneLiner: string }[]
  hasHighBias: boolean
  planId: string
  remaining: number | null
  draft_scores?: any
  draft_notes?: any
}

type Step = 'input' | 'bias' | 'score'

// ── Sub-components ──────────────────────────────────────────────────────────

function BiasScorePill({ score, tags }: { score: number; tags: string[] }) {
  const isHigh = score > 50
  const isMed  = score > 25 && score <= 50
  return (
    <div className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold',
      isHigh ? 'bg-red-50 text-red-700'
             : isMed ? 'bg-amber-50 text-amber-700'
                     : 'bg-emerald-50 text-emerald-700'
    )}>
      {isHigh ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
      {score}/100
      {tags.slice(0, 2).map(t => (
        <span key={t} className="text-[9px] uppercase tracking-wide opacity-70">{t}</span>
      ))}
    </div>
  )
}

// ── Step 1: Input ───────────────────────────────────────────────────────────

function InputStep({
  onSubmit
}: {
  onSubmit: (data: { title: string; questions: string[]; candidateName: string; role: string }) => void
}) {
  const [title, setTitle]               = useState('')
  const [candidateName, setCandidateName] = useState('')
  const [role, setRole]                 = useState('')
  const [rows, setRows]                 = useState<string[]>(['', ''])
  const [loading, setLoading]           = useState(false)
  const [showRecovery, setShowRecovery] = useState(false)
  const [draftTime, setDraftTime]       = useState<number | null>(null)
  const bulkRef = useRef<HTMLTextAreaElement>(null)


  // Load draft on mount
  useEffect(() => {
    const raw = localStorage.getItem('rifair_draft_evaluation_input');
    if (raw) {
      const parsed = JSON.parse(raw);
      const draft = draftStorage.load('evaluation_input');
      if (draft) {
        setTitle(draft.title || '')
        setCandidateName(draft.candidateName || '')
        setRole(draft.role || '')
        setRows(draft.rows && draft.rows.length > 0 ? draft.rows : ['', ''])
        setDraftTime(parsed.timestamp)
        setShowRecovery(true)
      }
    }
  }, [])

  // Save draft on change
  useEffect(() => {
    if (title || candidateName || role || rows.some(r => r.length > 0)) {
      draftStorage.save('evaluation_input', { title, candidateName, role, rows })
    }
  }, [title, candidateName, role, rows])

  // Warn on accidental navigation
  useEffect(() => {
    if (title || rows.some(r => r.trim().length > 10)) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = '';
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [title, rows]);

  const addRow = () => { if (rows.length < 15) setRows([...rows, '']) }
  const removeRow = (i: number) => setRows(rows.filter((_, idx) => idx !== i))
  const updateRow = (i: number, v: string) => {
    const next = [...rows]
    next[i] = v
    setRows(next)
  }

  // ── Smart bulk-paste handler ───────────────────────────────────────────────
  const handleBulkPaste = (raw: string) => {
    if (!raw.trim()) return

    // Try to split on numbered list pattern or plain newlines
    const numberedPattern = /^\s*\d+[\.\)]\s+/m
    let lines: string[]

    if (numberedPattern.test(raw)) {
      lines = raw
        .split(/\n/)
        .map(l => l.replace(/^\s*\d+[\.\)]\s+/, '').trim())
        .filter(l => l.length >= 10)
    } else {
      lines = raw
        .split(/\n{2,}|\n/)
        .map(l => l.trim())
        .filter(l => l.length >= 10)
    }

    if (lines.length <= 1 && rows.length <= 1) return

    // Combine with existing non-empty rows, or replace if we have many new ones
    setRows(lines.slice(0, 15))
    
    // Clear bulk textarea
    if (bulkRef.current) bulkRef.current.value = ''
  }

  const validQuestions = rows.filter(q => q.trim().length >= 10)

  const handleSubmit = async () => {
    if (validQuestions.length === 0 || loading) return
    setLoading(true)
    await onSubmit({ title, questions: validQuestions, candidateName, role })
    draftStorage.clear('evaluation_input')
    setLoading(false)
  }

  const handleClearDraft = () => {
    draftStorage.clear('evaluation_input')
    setTitle('')
    setCandidateName('')
    setRole('')
    setRows(['', ''])
    setShowRecovery(false)
  }

  return (
    <div className="space-y-5">
      {loading && <LoadingState text="Checking for bias..." />}

      {showRecovery && (
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row shadow-sm">
          <div>
            <h4 className="text-zinc-800 font-bold text-sm flex items-center gap-2">
              <span className="text-base">↻</span> Recover unsaved work?
            </h4>
            <p className="text-zinc-700/80 text-xs font-medium mt-1">
              You have {validQuestions.length} valid question(s){draftTime ? ` from ${Math.round((Date.now() - draftTime) / 60000)} minute(s) ago` : ''}.
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={() => setShowRecovery(false)} 
              className="flex-1 sm:flex-none text-xs font-bold bg-black text-white px-4 py-2 rounded-lg hover:bg-black/90 transition shadow-sm whitespace-nowrap"
            >
              Continue draft
            </button>
            <button 
              onClick={handleClearDraft} 
              className="flex-1 sm:flex-none text-xs font-bold border border-zinc-300 text-zinc-700 px-4 py-2 rounded-lg hover:bg-zinc-100 transition whitespace-nowrap"
            >
              Start new
            </button>
          </div>
        </div>
      )}
      {/* Meta inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { label: 'Evaluation title', value: title, set: setTitle, placeholder: 'e.g. Frontend Round 2' },
          { label: 'Candidate name (optional)', value: candidateName, set: setCandidateName, placeholder: 'e.g. Jane Doe' },
        ].map(({ label, value, set, placeholder }) => (
          <div key={label} className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#1D1D1F] uppercase tracking-[0.1em] ml-1">{label}</label>
            <input
              type="text"
              value={value}
              onChange={e => set(e.target.value)}
              placeholder={placeholder}
               className="w-full text-sm font-semibold border border-black/10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white rounded-xl px-4 py-3 focus:outline-none focus:border-black transition-all text-[#1D1D1F] placeholder:text-[#1D1D1F]/40"
            />
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-[#1D1D1F] uppercase tracking-[0.1em] ml-1">Role being hired for (optional)</label>
        <input
          type="text"
          value={role}
          onChange={e => setRole(e.target.value)}
          placeholder="e.g. Senior Frontend Engineer"
          className="w-full text-sm font-semibold border border-black/10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white rounded-xl px-4 py-3 focus:outline-none focus:border-black transition-all text-[#1D1D1F] placeholder:text-[#1D1D1F]/40"
        />
      </div>

      {/* Questions */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-[#1D1D1F] uppercase tracking-[0.1em] ml-1">
          Interview Questions ({validQuestions.length} / 15)
        </label>
        <AnimatePresence>
          {rows.map((q, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <textarea
                  value={q}
                  onChange={e => updateRow(i, e.target.value)}
                  placeholder={`Question ${i + 1} — minimum 10 characters`}
                  rows={2}
                  className="w-full text-[13px] font-semibold border border-black/10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white rounded-xl px-4 py-3 pr-10 resize-none focus:outline-none focus:border-black transition-all text-[#1D1D1F] placeholder:text-[#1D1D1F]/40"
                />
                <span className={cn(
                  'absolute bottom-2 right-3 text-[10px] font-medium',
                  q.trim().length >= 10 ? 'text-emerald-600' : 'text-[#1D1D1F]/40'
                )}>
                  {q.length}
                </span>
              </div>
              {rows.length > 1 && (
                <button
                  onClick={() => removeRow(i)}
                  className="shrink-0 self-start mt-1 w-9 h-9 flex items-center justify-center rounded-xl border border-black/[0.12] text-[#1D1D1F] hover:text-red-600 hover:border-red-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {rows.length < 15 && (
          <button
            onClick={addRow}
            className="w-full py-3 rounded-xl border-2 border-dashed border-black/[0.15] text-sm font-bold text-[#1D1D1F] hover:border-[#3b82f6]/50 hover:text-[#3b82f6] transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Question
          </button>
        )}
      </div>

      {/* ── Divider + bulk paste ─────────────────────────────────────── */}
      <div className="relative pt-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-black/[0.05]" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-[#F5F5F7] px-3 text-[10px] font-black text-[#1D1D1F] uppercase tracking-[0.1em]">
            or paste all at once
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        <textarea
          ref={bulkRef}
          placeholder="Paste your questions here — one per line, or numbered (1. 2. 3.)…"
          rows={3}
          onBlur={(e) => handleBulkPaste(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              handleBulkPaste((e.target as HTMLTextAreaElement).value)
            }
          }}
          className="w-full px-4 py-3 rounded-xl border border-black/10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white text-sm font-semibold text-[#1D1D1F] placeholder:text-[#1D1D1F]/40 resize-none focus:outline-none focus:border-black transition-all"
        />
        <p className="text-[10px] text-[#1D1D1F]/60 font-semibold ml-1">
          Questions are auto-split on paste or when you click outside / press ⌘↵
        </p>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading || validQuestions.length === 0}
        className={cn(
          'w-full py-4 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2',
          loading || validQuestions.length === 0
            ? 'bg-[#F5F5F7] text-[#1D1D1F]/30 cursor-not-allowed border border-black/10'
            : 'bg-[#3b82f6] text-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5'
        )}
      >
        {loading
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Checking for bias...</>
          : <><ShieldCheck className="w-4 h-4" /> Check Bias &amp; Continue</>
        }
      </button>
    </div>
  )
}

// ── Step 2: Bias Check ──────────────────────────────────────────────────────

function BiasStep({
  session,
  planId,
  onContinue,
  onQuestionsUpdate,
}: {
  session: SessionData
  planId: string
  onContinue: () => void
  onQuestionsUpdate: (newQuestions: string[]) => void
}) {
  const isPaid     = ['starter', 'growth', 'enterprise'].includes(planId)
  
  // Map session.questions to the format BiasCheckResults expects
  const questions = session.questions.map(q => q.text)
  const biasResults = session.questions.map(q => ({
    score: q.biasScore,
    tags: q.biasTags,
    oneLiner: q.biasIssue.split('.')[0], // Simple one-liner from the issue
    explanation: q.biasIssue,
    rewrite: q.aiRewrite || undefined
  }))

  return (
    <div className="space-y-4">
      <BiasCheckResults 
        questions={questions}
        biasResults={biasResults}
        planTier={planId}
        evalId={session.id}
        onQuestionsUpdate={onQuestionsUpdate}
      />

      {/* Sticky CTA */}
      <div className="sticky bottom-0 pt-3 pb-4 bg-gradient-to-t from-[#F5F5F7] to-transparent z-10">
        <button
          onClick={onContinue}
          className="w-full bg-[#3b82f6] text-white py-4 rounded-2xl text-sm font-bold uppercase tracking-widest shadow-[0_4px_14px_rgba(59,130,246,0.3)] hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
        >
          Start Evaluation <ArrowRight className="w-4 h-4" />
        </button>
        {session.remaining !== null && (
          <p className="text-center text-[11px] text-[#1D1D1F]/60 font-bold mt-2">
            {session.remaining} evaluation{session.remaining !== 1 ? 's' : ''} remaining this month
          </p>
        )}
      </div>
    </div>
  )
}

// ── Step 3: Scoring — wraps CandidateEvaluator ─────────────────────────────

function ScoringStep({
  session,
  onBack,
}: {
  session: SessionData
  onBack: () => void
}) {
  // Shape session data to match the kit interface CandidateEvaluator expects
  const kitLike = {
    id:              session.id,
    role:            session.title,
    experience_level: 'custom',
    company_type:    'custom',
    kit_summary:     `Custom evaluation session: ${session.title}`,
    questions:       session.questions.map(q => ({
      id:          q.id,
      question:    q.text,
      competency:  q.competency,
      weight_percent: Math.round(100 / session.questions.length),
      time_minutes: 5,
    })),
    // Flag so CandidateEvaluator uses the custom-eval score endpoint
    _isCustomEval:   true,
    _customEvalId:   session.id,
    initialScores:   session.draft_scores || null,
    initialNotes:    session.draft_notes || null,
  }

  return (
    <div>
      <div className="flex items-center gap-2.5 mb-4 sm:mb-6">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-xl bg-white border border-black/[0.12] flex items-center justify-center text-[#1D1D1F] hover:text-[#000] hover:bg-[#F5F5F7] shadow-sm transition-all active:scale-95 text-xs font-bold"
        >
          ←
        </button>
        <div>
          <p className="text-[8px] sm:text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">
            Custom Evaluation Mode
          </p>
          <h2 className="text-sm sm:text-base md:text-lg font-bold text-[#1D1D1F]">{session.title}</h2>
        </div>
      </div>
      <CandidateEvaluator kit={kitLike} />
    </div>
  )
}

// ── Main Component ──────────────────────────────────────────────────────────

export function CustomEvaluationFlow({ 
  onClose,
  initialStep = 'input',
  initialSession = null
}: { 
  onClose?: () => void,
  initialStep?: Step,
  initialSession?: SessionData | null
}) {
  const { isLoaded, userId } = useAuth()
  const { getAuthToken } = useBackendToken()
  const router = useRouter()
  const [step, setStep]       = useState<Step>(initialStep)
  const [session, setSession] = useState<SessionData | null>(initialSession)
  const [error, setError]     = useState<string | null>(null)

  // Scroll to top when error occurs so user sees the warning (especially on long forms)
  useEffect(() => {
    if (error) {
      // Find the dashboard's scrollable container and roll it to the top
      const container = document.querySelector('.dashboard-main');
      if (container) {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [error])

  useEffect(() => {
    if (initialSession) setSession(initialSession)
    if (initialStep) setStep(initialStep)
  }, [initialSession, initialStep])

  const handleInputSubmit = async (data: {
    title: string
    questions: string[]
    candidateName: string
    role: string
  }) => {
    setError('')
    try {
      const token = await getAuthToken()
      if (!token) return
      const res = await fetch('/api/custom-eval', {
        method:  'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body:    JSON.stringify(data),
      })
      const json = await res.json()

      if (!res.ok) {
        if (res.status === 403) {
          setError(json.message || 'You have reached your evaluation limit for this month. Please upgrade to continue.')
          return
        }
        // Content safety block — tell the user exactly which questions were flagged
        if (json.error === 'inappropriate_content' && json.flaggedQuestions?.length > 0) {
          const nums = json.flaggedQuestions.map((q: { index: number }) => `Q${q.index}`).join(', ')
          setError(
            `${json.flaggedQuestions.length} question(s) contain inappropriate content and cannot be used in a professional evaluation (${nums}). Please remove or replace them before continuing.`
          )
          return
        }
        setError(json.error || json.message || 'Something went wrong')
        return
      }

      setSession(json)
      // Redirect to review page for persistence
      router.push(`/evaluations/${json.id}/review`)
    } catch {
      setError('Network error. Please try again.')
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Step header */}
      {step !== 'score' && (
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">
              Custom Evaluation
            </p>
            <h2 className="text-xl font-bold text-[#1D1D1F]">
              {step === 'input' ? 'Your Own Questions' : 'Bias Check Results'}
            </h2>
          </div>

          {/* Step pills */}
          <div className="hidden sm:flex items-center gap-1.5">
            {(['input', 'bias', 'score'] as Step[]).map((s, i) => (
              <div
                key={s}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  step === s
                    ? 'bg-[#3b82f6] w-5'
                    : i < (['input','bias','score'] as Step[]).indexOf(step)
                      ? 'bg-emerald-400'
                      : 'bg-black/[0.1]'
                )}
              />
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium flex items-center justify-between">
          <span>{error}</span>
          {error.toLowerCase().includes('limit') && (
            <Link href="/pricing?reason=custom_eval_limit" className="text-red-800 underline font-bold whitespace-nowrap ml-4">
              Upgrade Plan
            </Link>
          )}
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 'input' && (
          <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <InputStep onSubmit={handleInputSubmit} />
          </motion.div>
        )}
        {step === 'bias' && session && (
          <motion.div key="bias" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <BiasStep
              session={session}
              planId={session.planId}
              onContinue={() => router.push(`/evaluations/${session.id}/score`)}
              onQuestionsUpdate={(newQuestions) => {
                setSession(prev => {
                  if (!prev) return null;
                  const updatedQuestions = prev.questions.map((q, i) => {
                    const hasChanged = q.text !== newQuestions[i];
                    return {
                      ...q,
                      text: newQuestions[i],
                      // Clear bias if the question was changed (e.g. via rewrite)
                      biasScore: hasChanged ? 0 : q.biasScore,
                      biasTags: hasChanged ? [] : q.biasTags,
                      biasIssue: hasChanged ? "" : q.biasIssue,
                      aiRewrite: hasChanged ? null : (q.aiRewrite ?? null)
                    };
                  });
                  const hasHighBias = updatedQuestions.some(q => (q.biasScore ?? 0) > 50);
                  return { ...prev, questions: updatedQuestions, hasHighBias };
                });
              }}
            />
          </motion.div>
        )}
        {step === 'score' && session && (
          <motion.div key="score" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ScoringStep session={session} onBack={() => router.push(`/evaluations/${session.id}/review`)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
