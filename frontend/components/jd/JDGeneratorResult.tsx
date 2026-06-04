'use client'

import { useState, useEffect } from 'react'
import { Edit3, Save, X, Loader2 } from 'lucide-react'
import { updateReportById } from '@/lib/api'
import { useBackendToken } from '@/hooks/useBackendToken'
import { useSubscription } from '@/hooks/useSubscription'
import ExportButton from '@/components/pdf/ExportButton'
import { JobDescriptionDocument, JDSections, JDMeta } from './JobDescriptionDocument'

export function JDGeneratorResult({
  result: initialResult,
  onReset,
  reportId
}: {
  result: any
  onReset: () => void
  reportId?: string
}) {
  const { getAuthToken } = useBackendToken()
  const { planId } = useSubscription()

  const cleanNewlines = (text: string) => {
    if (!text) return ''
    return text.replace(/\\n/g, '\n')
  }

  const [result, setResult] = useState(() => ({
    ...initialResult,
    full_jd: cleanNewlines(initialResult.full_jd)
  }))
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Editable copies of sections and meta — only used in edit mode
  const [editSections, setEditSections] = useState<JDSections>(initialResult.sections || {})
  const [editMeta, setEditMeta] = useState<JDMeta>(initialResult.meta || {})

  // Keep local result in sync if prop changes
  useEffect(() => {
    const cleaned = {
      ...initialResult,
      full_jd: cleanNewlines(initialResult.full_jd)
    }
    setResult(cleaned)
    setEditSections(initialResult.sections || {})
    setEditMeta(initialResult.meta || {})
  }, [initialResult])

  // When entering edit mode, seed editable state from current result
  const enterEdit = () => {
    setEditSections(result.sections || {})
    setEditMeta(result.meta || {})
    setIsEditing(true)
  }

  const handleCancel = () => {
    // Reset edit state back to saved result
    setEditSections(result.sections || {})
    setEditMeta(result.meta || {})
    setIsEditing(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const updatedResult = {
        ...result,
        sections: editSections,
        meta: editMeta,
      }

      if (reportId) {
        const token = await getAuthToken()
        if (!token) return
        await updateReportById(reportId, {
          ...updatedResult,
          analysis_type: 'jd_generated'
        }, token)
      }

      setResult(updatedResult)
      setIsEditing(false)
    } catch (err) {
      console.error('Failed to save JD:', err)
      alert('Failed to save changes. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const copy = () => {
    // Build clean plain text from structured sections for clipboard
    const s = result.sections || {}
    const m = result.meta || {}
    const lines: string[] = []

    if (m.role) lines.push(m.role, '')
    if (m.company) lines.push(m.company)
    const meta = [m.work_mode, m.experience, m.location].filter(Boolean).join(' · ')
    if (meta) lines.push(meta, '')

    if (s.about_company) {
      lines.push('About the Company', '─'.repeat(32), s.about_company, '')
    }
    if (s.what_youll_do?.length) {
      lines.push("What You'll Do", '─'.repeat(32))
      s.what_youll_do.forEach((r: string) => lines.push(`• ${r}`))
      lines.push('')
    }
    if (s.must_have?.length) {
      lines.push('Requirements', '─'.repeat(32))
      s.must_have.forEach((r: string) => lines.push(`• ${r}`))
      lines.push('')
    }
    if (s.nice_to_have?.length) {
      lines.push('Nice to Have', '─'.repeat(32))
      s.nice_to_have.forEach((r: string) => lines.push(`• ${r}`))
      lines.push('')
    }
    if (s.what_we_offer?.length) {
      lines.push('Compensation & Benefits', '─'.repeat(32))
      s.what_we_offer.forEach((r: string) => lines.push(`• ${r}`))
      lines.push('')
    }
    if (s.hiring_process) {
      lines.push('Hiring Process', '─'.repeat(32))
      if (Array.isArray(s.hiring_process)) {
        s.hiring_process.forEach((step: string, i: number) => lines.push(`${i + 1}. ${step}`))
      } else {
        lines.push(s.hiring_process)
      }
      lines.push('')
    }
    if (s.cta) lines.push(s.cta, '')

    navigator.clipboard.writeText(lines.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const reachStr = result.conversion_insights?.estimated_talent_pool_reach || '—'
  const shortReach = reachStr.match(/\d+%/)?.[0] || (reachStr.length > 12 ? reachStr.slice(0, 12) + '…' : reachStr)

  const stats = [
    { label: 'Words', value: result.conversion_insights?.word_count ?? '—' },
    { label: 'Reqs', value: result.sections?.must_have?.length ?? 0 },
    { label: 'Resp', value: result.sections?.what_youll_do?.length ?? 0 },
    { label: 'Benefits', value: result.sections?.what_we_offer?.length ?? 0 },
    { label: 'Reach', value: shortReach },
  ]

  return (
    <div className="space-y-3">

      {/* ── Hero Stats Card ── */}
      <div className="bg-[#f59e0b] border-2 border-black rounded-xl p-3.5 sm:p-5 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden transition-colors duration-500">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -mr-24 -mt-24" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2.5 w-full md:max-w-xl">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/10 backdrop-blur-md flex-shrink-0">
                <span className="font-mono text-sm font-black text-white">JD</span>
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black text-white tracking-tight leading-tight">
                  {result.headline || "Job Description"}
                </h1>
                <p className="text-[9px] font-black text-white/60 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                  ✓ Bias-Free · AI Generated
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <div className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
                {[result.meta?.role, result.meta?.company, result.meta?.location, result.meta?.work_mode].filter(Boolean).join(' · ')}
              </div>
            </div>

            <p className="text-xs text-white/80 leading-relaxed font-medium line-clamp-2 md:line-clamp-none">
              This job description was generated with inclusive, bias-free terminology to attract a wider, high-quality candidate pool.
            </p>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end gap-3 justify-between w-full md:w-auto border-t border-white/10 pt-2.5 md:border-t-0 md:pt-0">
            <div className="text-left md:text-right">
              <div className="text-[8px] font-black text-white/60 uppercase tracking-widest mb-0.5">Reach</div>
              <div className="text-xl sm:text-2xl font-black text-white tracking-tighter">
                {shortReach}
              </div>
            </div>
            <div className="px-3 py-1.5 rounded-xl border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center text-center bg-white text-black min-w-[100px]">
              <span className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-0.5">Words</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#f59e0b]">{result.conversion_insights?.word_count ?? '—'}</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="hidden sm:flex gap-4 mt-3 pt-3 border-t border-white/10 relative z-10 overflow-x-auto no-scrollbar pb-0.5">
          {stats.slice(1).map(stat => (
            <div key={stat.label} className="shrink-0">
              <div className="text-sm font-bold tabular-nums">{stat.value}</div>
              <div className="text-[8px] font-black text-amber-300/70 uppercase tracking-widest capitalize whitespace-nowrap">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Conversion Insight ── */}
      {result.conversion_insights?.top_strength && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]">
          <span className="text-amber-500 flex-shrink-0 font-black text-sm">↗</span>
          <div className="min-w-0">
            <p className="font-mono text-[8px] font-black text-amber-700 mb-0.5 uppercase tracking-wider">Why this JD converts</p>
            <p className="font-sans text-[11px] text-amber-800 leading-snug">{result.conversion_insights.top_strength}</p>
          </div>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl">
        {/* Toggle */}
        <div className="flex gap-1">
          <button
            onClick={() => setIsEditing(false)}
            className={`text-[10px] px-3 py-1.5 rounded-lg font-black transition-all ${
              !isEditing
                ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            Preview
          </button>
          <button
            onClick={enterEdit}
            className={`text-[10px] px-3 py-1.5 rounded-lg font-black transition-all flex items-center gap-1 ${
              isEditing
                ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <Edit3 className="w-3 h-3" />
            Edit
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="text-[10px] font-black px-2 py-1 text-neutral-500 hover:text-neutral-700 flex items-center gap-1 transition-all"
              >
                <X className="w-3 h-3" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="text-[10px] font-black px-3 py-1 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1 transition-all active:scale-95"
              >
                {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                {isSaving ? 'Saving…' : 'Save'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={copy}
                className={`text-[10px] font-black px-3 py-1 rounded-full transition-all active:scale-95 ${
                  copied ? 'bg-amber-100 text-amber-700' : 'bg-[#f59e0b] text-white hover:bg-[#d97706]'
                }`}
              >
                {copied ? '✓ Copied' : 'Copy JD'}
              </button>
              <ExportButton
                type="jd"
                id={reportId || ''}
                planTier={planId}
                variant="secondary"
                className="h-7 text-[10px] py-0 px-2 sm:px-3 flex items-center justify-center"
              />
            </>
          )}
        </div>
      </div>

      {/* ── Premium Document (preview + inline edit in same template) ── */}
      <JobDescriptionDocument
        result={result}
        reportId={reportId}
        planId={planId}
        onReset={onReset}
        copied={copied}
        onCopy={copy}
        isEditing={isEditing}
        editSections={editSections}
        editMeta={editMeta}
        onSectionChange={setEditSections}
        onMetaChange={setEditMeta}
      />

      {/* ── Bottom Action Buttons ── */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6 no-print">
        <button
          onClick={onReset}
          className="w-full sm:flex-1 h-12 border-2 border-black text-neutral-800 rounded-2xl text-xs font-black bg-white hover:bg-neutral-50 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
        >
          ← Generate another JD
        </button>
        <div className="w-full sm:flex-1">
          <ExportButton
            type="jd"
            id={reportId || ''}
            planTier={planId}
            variant="primary"
            label="Export JD Report"
            className="w-full h-12"
            buttonClassName="h-12 text-xs font-black uppercase tracking-widest rounded-2xl"
          />
        </div>
      </div>
    </div>
  )
}
