'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import { FileSearch, ArrowRight, CheckCircle2, Lock, ChevronDown } from 'lucide-react'
import { JDAnalysisResult } from '@/components/jd/JDAnalysisResult'
import { JDGeneratorResult } from '@/components/jd/JDGeneratorResult'
import { useSubscription } from '@/hooks/useSubscription'
import { useContentModeration } from '@/hooks/useContentModeration'
import { ContentWarning } from '@/components/moderation/ContentWarning'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { LoadingState } from '@/components/LoadingState'
import { useBackendToken } from '@/hooks/useBackendToken'

type Mode = 'generate' | 'analyse'

export default function JDAnalyserPage() {
  const [mode, setMode] = useState<Mode>('generate')
  const [jd, setJd] = useState('')
  const [role, setRole] = useState('')
  const [companyType, setCompanyType] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

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
  }, [error])

  const [showFeatures, setShowFeatures] = useState(false)
  const router = useRouter()
  const { planId, isLoading: planLoading } = useSubscription()
  const { getAuthToken } = useBackendToken()

  const hasAccess = planId === 'growth' || planId === 'enterprise'

  const charCount = jd.length
  const wordCount = jd.trim() ? jd.trim().split(/\s+/).length : 0

  const jdModeration = useContentModeration('jd')

  const handleInputChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setJd(value)
    if (value.trim().length > 10) {
      await jdModeration.checkContent(value)
    } else {
      jdModeration.clearModeration()
    }
  }

  const handleAnalyse = async () => {
    if (!jd.trim() || charCount > 12000) return
    
    const isClean = await jdModeration.checkContent(jd)
    if (!isClean) return

    setLoading(true)
    setError(null)

    try {
      const token = await getAuthToken()
      if (!token) return
      
      const res = await fetch('/api/analyse-jd', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ jobDescription: jd, role, companyType }),
      })

      const data = await res.json()

      if (res.status === 403) {
        if (data.error === 'plan_required') {
          router.push('/pricing?highlight=growth&feature=jd_analyser')
          return
        }
      }

      if (!res.ok) {
        setError(data.error || data.message || 'Analysis failed. Please try again.')
        return
      }

      if (data.reportId) {
        router.push(`/jd/${data.reportId}`);
        return;
      }

      setResult(data)
    } catch {
      setError('Something went wrong. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return <JDAnalysisResult result={result} onReset={() => setResult(null)} />
  }

  const features = [
    'Job title bias', 'Coded language decoder', 'Requirement inflation check',
    'Gender language balance', 'Culture section neutrality', 'Legal risk assessment',
    'Section-by-section scoring', 'Complete bias-free rewrite',
  ]

  const canSubmit = !!(jd.trim()) && !loading && charCount <= 12000

  return (
    <div className="w-full min-h-screen relative pb-28 md:pb-8">
      {loading && <LoadingState text="Analysing" />}

      {/* Page Header */}
      <div className="relative mb-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#d97706]">
            Job Descriptions
          </h1>
          <p className="text-[#86868B] max-w-2xl text-base md:text-lg font-medium">
            Generate high-converting, bias-free job descriptions or analyze your existing ones for inclusivity.
          </p>
        </div>
      </div>

      {/* ── Upgrade Overlay (locked state) ──────────────────────────────────── */}
      {!hasAccess && !planLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-6">
          <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px] rounded-3xl" />
          <div className="relative z-30 flex flex-col items-center max-w-md w-full">
            {/* Lock card */}
            <div className="bg-white/95 backdrop-blur-md rounded-[2rem] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-white/60 w-full">
              <div className="w-16 h-16 bg-[#F5F5F7] rounded-2xl flex items-center justify-center mb-5 mx-auto border border-black/[0.05]">
                <Lock className="w-8 h-8 text-[#1D1D1F]" />
              </div>
              <h2 className="text-xl font-bold text-[#1D1D1F] tracking-tight mb-2">
                Premium Feature
              </h2>
              <p className="text-sm text-[#86868B] mb-6 leading-relaxed font-medium">
                Upgrade to the Growth plan to unlock our powerful Job Description Analyser. Instantly detect bias, get inclusivity scores, and generate complete bias-free rewrites.
              </p>
              <Link href="/pricing?highlight=growth&feature=jd_analyser">
                <button className="w-full bg-[#1D1D1F] text-white px-6 py-4 rounded-2xl text-sm font-bold shadow-lg hover:bg-black active:scale-[0.98] transition-all min-h-[52px]">
                  Upgrade to Unlock →
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Mode toggle */}
      <div className="flex items-center gap-1 bg-[#F5F5F7] p-1 rounded-2xl mb-6 w-fit relative z-10 border border-black/10 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        <button
          onClick={() => setMode('generate')}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            mode === 'generate'
              ? 'bg-[#f59e0b] text-white shadow-sm'
              : 'text-gray-500 hover:text-[#f59e0b]'
          }`}
        >
          Generate JD
        </button>
        <button
          onClick={() => setMode('analyse')}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            mode === 'analyse'
              ? 'bg-[#f59e0b] text-white shadow-sm'
              : 'text-gray-500 hover:text-[#f59e0b]'
          }`}
        >
          Analyse JD
        </button>
      </div>

      <div className={`space-y-4 transition-all duration-500 ${(!hasAccess && !planLoading) ? 'opacity-40 pointer-events-none select-none blur-[4px]' : ''}`}>
        {mode === 'generate' ? (
          <JDGenerator onPassToAnalyser={(generatedJd) => {
            setJd(generatedJd)
            setMode('analyse')
          }} />
        ) : (
          <>

        {/* Section Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <h2 className="text-xl font-extrabold text-[#1D1D1F] tracking-tight mb-1">
            Analyze Existing JD
          </h2>
          <p className="text-xs md:text-sm font-medium text-[#86868B]">
            Paste your job description to scan for biased language and requirements.
          </p>
        </motion.div>

        {/* Error (at top for visibility) */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
                <p className="text-sm text-red-700 font-bold">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Optional context — stacked on mobile, side-by-side on sm+ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          <div>
            <label className="text-[10px] font-black text-black uppercase tracking-[0.15em] block mb-1.5">
              Role (optional)
            </label>
            <input
              type="text"
              id="jd-role-input"
              placeholder="e.g. Senior Frontend Engineer"
              value={(!hasAccess && !planLoading) ? 'Senior Frontend Engineer' : role}
              onChange={e => setRole(e.target.value)}
              className="w-full border border-black/10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl px-4 py-3 focus:outline-none focus:border-black bg-white text-black placeholder:text-black/40 transition-all"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-black uppercase tracking-[0.15em] block mb-1.5">
              Company type (optional)
            </label>
            <input
              type="text"
              id="jd-company-type-input"
              placeholder="e.g. Fintech startup"
              value={(!hasAccess && !planLoading) ? 'Fast-growing Fintech Startup' : companyType}
              onChange={e => setCompanyType(e.target.value)}
              className="w-full border border-black/10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl px-4 py-3 focus:outline-none focus:border-black bg-white text-black placeholder:text-black/40 transition-all"
            />
          </div>
        </motion.div>

        {/* JD textarea — taller on mobile for comfortable typing */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <label className="text-[10px] font-black text-black uppercase tracking-[0.15em] block mb-1.5">
            Job Description
          </label>
          <div className="relative">
            <textarea
              id="jd-text-input"
              value={(!hasAccess && !planLoading) ? "We are looking for a Rockstar Frontend Ninja to join our fast-paced, high-energy team! You must be a digital native with 10+ years of React experience. We work hard and play hard. Cultural fit is our #1 priority. Recent grads from top-tier universities preferred." : jd}
              onChange={handleInputChange}
              placeholder={`Paste your complete job description here…\n\nInclude: job title, responsibilities, requirements, qualifications, about the company, culture section, and benefits.\n\nThe more complete the JD, the more thorough the analysis.`}
              rows={14}
              maxLength={12000}
              className={cn(
                "w-full border border-black/10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl px-5 py-4 resize-none focus:outline-none focus:border-black leading-relaxed transition-all",
                jdModeration.isBlocked ? "border-red-300 bg-red-50/30 text-red-900 placeholder:text-red-900/40" : "bg-white text-black placeholder:text-black/40"
              )}
            />
            {/* Char/word counter */}
            <div className="absolute bottom-3 right-4 flex items-center gap-3 bg-white/90 rounded-lg px-2 py-1">
              <span className="text-[11px] text-black/50 font-medium">{wordCount} words</span>
              <span className={cn(
                "text-[11px] font-semibold",
                charCount > 11000 ? 'text-red-500' : 'text-black/50'
              )}>
                {charCount.toLocaleString()}/12,000
              </span>
            </div>
          </div>
          {/* Progress bar for char limit */}
          <div className="mt-1.5 h-1 bg-[#F5F5F7] rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                charCount > 11000 ? "bg-red-500" : charCount > 8000 ? "bg-amber-500" : "bg-[#f59e0b]"
              )}
              style={{ width: `${Math.min(100, (charCount / 12000) * 100)}%` }}
            />
          </div>
        </motion.div>

        <ContentWarning
          warning={jdModeration.warning}
          severity={jdModeration.severity}
          category={jdModeration.category}
          isChecking={jdModeration.isChecking}
        />


        {/* Desktop submit button (hidden on mobile — sticky bar handles it) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="hidden md:block"
        >
          <button
            id="jd-analyse-button"
            onClick={handleAnalyse}
            disabled={!canSubmit || jdModeration.isBlocked || jdModeration.isChecking}
            className={cn(
              "w-full py-4 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 min-h-[52px]",
              !jdModeration.isBlocked && canSubmit
                ? 'bg-[#f59e0b] text-white hover:bg-[#d97706] active:scale-[0.98] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5'
                : 'bg-[#F5F5F7] text-black/40 cursor-not-allowed border border-black/10'
            )}
          >
            {jdModeration.isBlocked ? (
              'Fix content to continue'
            ) : loading ? (
              <>
                Analysing job description…
              </>
            ) : (
              <>Analyse for bias <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </motion.div>

        {/* What gets analysed — collapsible on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          {/* Mobile: collapsible */}
          <button
            onClick={() => setShowFeatures(!showFeatures)}
            className="md:hidden w-full flex items-center justify-between p-4 bg-[#F5F5F7] rounded-2xl text-left"
          >
            <span className="text-[10px] font-black text-black uppercase tracking-[0.15em]">
              What gets analysed
            </span>
            <ChevronDown className={cn(
              "w-4 h-4 text-[#86868B] transition-transform duration-200",
              showFeatures ? "rotate-180" : ""
            )} />
          </button>

          <AnimatePresence>
            {(showFeatures) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden md:hidden"
              >
                <div className="bg-[#F5F5F7] rounded-b-2xl -mt-2 pt-2 px-4 pb-4">
                  <div className="grid grid-cols-2 gap-1.5 pt-2">
                    {features.map(item => (
                      <div key={item} className="flex items-center gap-2 text-xs text-[#1D1D1F]/70">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Desktop: always visible */}
          <div className="hidden md:block bg-white border border-black/10 rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-[10px] font-black text-black uppercase tracking-[0.15em] mb-3">What gets analysed</p>
            <div className="grid grid-cols-2 gap-1.5">
              {features.map(item => (
                <div key={item} className="flex items-center gap-2 text-xs text-[#1D1D1F]/70">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

          </>
        )}
      </div>

      {/* ── Mobile Sticky Submit Bar ─────────────────────────────────────────── */}
      {mode === 'analyse' && (
        <div
          className="md:hidden sticky-submit-bar"
          style={{
            bottom: 'calc(60px + env(safe-area-inset-bottom))',
          }}
        >
          <button
            id="jd-analyse-button-mobile"
            onClick={handleAnalyse}
            disabled={!canSubmit || (!hasAccess && !planLoading) || jdModeration.isBlocked || jdModeration.isChecking}
            className={cn(
              "w-full py-4 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 min-h-[52px] shadow-lg",
              !jdModeration.isBlocked && canSubmit && (hasAccess || planLoading)
                ? 'bg-[#1D1D1F] text-white active:scale-[0.98]'
                : 'bg-[#F5F5F7] text-black/40 cursor-not-allowed'
            )}
          >
            {jdModeration.isBlocked ? (
              'Fix content to continue'
            ) : loading ? (
              <>
                Analysing…
              </>
            ) : (
              <>Analyse for bias <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

function JDGenerator({ onPassToAnalyser }: { onPassToAnalyser: (jd: string) => void }) {
  const { getAuthToken } = useBackendToken()
  const [form, setForm] = useState({
    role: '', company: '', location: '',
    experience: '', companyType: '',
    industry: '', keySkills: '',
    workMode: 'hybrid', salaryRange: '',
    tone: 'conversational'
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  const set = (key: string, val: string) =>
    setForm(p => ({ ...p, [key]: val }))

  const handleGenerate = async () => {
    if (!form.role || !form.company ||
        !form.location || !form.experience) return

    setLoading(true)
    try {
      const token = await getAuthToken()
      if (!token) return
      
      const res = await fetch('/api/generate-jd', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (res.ok) setResult(data)
    } finally {
      setLoading(false)
    }
  }

  const copy = () => {
    if (!result) return
    navigator.clipboard.writeText(result.full_jd)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (result) return (
    <JDGeneratorResult 
      result={result} 
      reportId={result.reportId} 
      onReset={() => setResult(null)} 
    />
  )

  return (
    <div className="space-y-6 relative animate-in fade-in slide-in-from-bottom-4 duration-500">
      {loading && <LoadingState text="Generating" />}
      <div>
        <h2 className="text-xl font-extrabold text-[#1D1D1F] tracking-tight mb-1">
          Role Details
        </h2>
        <p className="text-xs md:text-sm font-medium text-[#86868B]">
          Fill in the specifications to generate a complete, high-converting, bias-free job description.
        </p>
      </div>

      {/* Required fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { key: 'role', label: 'Role title *',
            placeholder: 'e.g. Senior Data Analyst' },
          { key: 'company', label: 'Company name *',
            placeholder: 'e.g. Razorpay' },
          { key: 'location', label: 'Location *',
            placeholder: 'e.g. Bangalore, India' },
          { key: 'experience', label: 'Experience level *',
            placeholder: 'e.g. 3-5 years' },
          { key: 'companyType', label: 'Company type',
            placeholder: 'e.g. Fintech startup' },
          { key: 'industry', label: 'Industry',
            placeholder: 'e.g. Financial services' },
          { key: 'keySkills', label: 'Key skills',
            placeholder: 'e.g. SQL, Python, Tableau' },
          { key: 'salaryRange', label: 'Salary range',
            placeholder: 'e.g. ₹18-25 LPA' },
        ].map(field => (
          <div key={field.key}>
            <label className="text-[10px] font-black 
                               text-gray-400 uppercase 
                               tracking-[0.15em] block mb-1.5">
              {field.label}
            </label>
            <input
              type="text"
              placeholder={field.placeholder}
              value={(form as any)[field.key]}
              onChange={e => set(field.key, e.target.value)}
              className="w-full text-sm border border-black/10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl px-4 py-3 focus:outline-none focus:border-black transition-all bg-white font-medium"
            />
          </div>
        ))}
      </div>

      {/* Work mode + Tone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-black 
                             text-gray-400 uppercase 
                             tracking-[0.15em] block mb-1.5">
            Work mode
          </label>
          <select
            value={form.workMode}
            onChange={e => set('workMode', e.target.value)}
            className="w-full text-sm border border-black/10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl px-4 py-3 focus:outline-none focus:border-black bg-white font-medium transition-all"
          >
            <option value="onsite">On-site</option>
            <option value="hybrid">Hybrid</option>
            <option value="remote">Remote</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-black 
                             text-gray-400 uppercase 
                             tracking-[0.15em] block mb-1.5">
            Writing tone
          </label>
          <select
            value={form.tone}
            onChange={e => set('tone', e.target.value)}
            className="w-full text-sm border border-black/10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl px-4 py-3 focus:outline-none focus:border-black bg-white font-medium transition-all"
          >
            <option value="conversational">
              Conversational
            </option>
            <option value="startup">Startup</option>
            <option value="formal">Formal</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={
          !form.role || !form.company ||
          !form.location || !form.experience || loading
        }
        className={`w-full py-4 rounded-2xl text-sm 
                    font-bold transition-all min-h-[56px] ${
          form.role && form.company &&
          form.location && form.experience && !loading
            ? 'bg-[#f59e0b] text-white hover:bg-[#d97706] active:scale-[0.98] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-black/10'
        }`}
      >
        {loading ? (
          <span className="flex items-center 
                           justify-center gap-2">
            Generating your JD...
          </span>
        ) : 'Generate bias-free JD ↗'}
      </button>
    </div>
  )
}
