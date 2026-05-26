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
      <div className="bg-[#f59e0b] border-2 border-black rounded-xl p-3 sm:p-4 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/15 flex items-center justify-center border border-white/10 flex-shrink-0 mt-0.5">
            <span className="font-mono text-[10px] font-black">JD</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-mono text-[8px] sm:text-[9px] bg-white/20 text-white px-2 py-0.5 rounded-full font-black tracking-wide uppercase">
                ✓ Bias-Free · AI Generated
              </span>
            </div>
            <h2 className="font-sans text-xs sm:text-sm font-extrabold leading-tight mt-1 line-clamp-1">
              {result.headline}
            </h2>
            <p className="font-mono text-[8px] sm:text-[9px] opacity-75 mt-0.5 line-clamp-1 tracking-tight">
              {result.meta?.role} · {result.meta?.company} · {result.meta?.location} · {result.meta?.work_mode}
            </p>
          </div>
        </div>
        <div className="border-t border-white/15 my-2.5" />
        <div className="flex items-center justify-between gap-2 text-white">
          {stats.map(stat => (
            <div key={stat.label} className="text-center flex-1 min-w-0">
              <div className="font-sans text-xs sm:text-sm font-black leading-none truncate">{stat.value}</div>
              <div className="font-mono text-[7px] sm:text-[8px] opacity-75 uppercase tracking-wide mt-0.5 truncate">{stat.label}</div>
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
      <div className="flex flex-col sm:flex-row gap-2.5 pt-1 no-print">
        <ExportButton
          type="jd"
          id={reportId || ''}
          planTier={planId}
          variant="primary"
          label="Export JD Report"
          className="w-full sm:flex-1"
        />
        <button
          onClick={onReset}
          className="w-full sm:flex-1 py-3 sm:py-4 border-2 border-black text-neutral-800 rounded-xl text-xs font-black bg-white hover:bg-neutral-50 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
        >
          ← Generate another JD
        </button>
      </div>
    </div>
  )
}
