import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { Edit3, Save, X, Loader2 } from 'lucide-react'
import { updateReportById } from '@/lib/api'
import { useAuth } from '@clerk/nextjs'

export function JDGeneratorResult({
  result: initialResult,
  onReset,
  reportId
}: {
  result: any
  onReset: () => void
  reportId?: string
}) {
  const { getToken } = useAuth()
  const [result, setResult] = useState(initialResult)
  const [copied, setCopied] = useState(false)
  const [view, setView] = useState<'preview' | 'raw' | 'edit'>('preview')
  const [editedContent, setEditedContent] = useState(initialResult.full_jd)
  const [isSaving, setIsSaving] = useState(false)

  const stripMarkdown = (text: string) => {
    if (!text) return ''
    return text
      .replace(/^#+\s+/gm, '') // Headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
      .replace(/\*(.*?)\*/g, '$1') // Italic
      .replace(/__(.*?)__/g, '$1') // Bold underscore
      .replace(/_(.*?)_/g, '$1') // Italic underscore
      .replace(/^[\s\t]*[-*+]\s+/gm, '') // Unordered lists
      .replace(/^[\s\t]*\d+\.\s+/gm, '') // Ordered lists
      .replace(/^-{3,}$/gm, '') // Horizontal rules
      .replace(/`{1,3}(.*?)`{1,3}/g, '$1') // Code blocks
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links
      .trim()
  }

  // Keep local result in sync if prop changes
  useEffect(() => {
    setResult(initialResult)
    // Strip markdown for the editor
    setEditedContent(stripMarkdown(initialResult.full_jd))
  }, [initialResult])

  const copy = () => {
    // Strip markdown before copying to clipboard
    const cleanText = stripMarkdown(result.full_jd)
    navigator.clipboard.writeText(cleanText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // 1. Update local state (preserving current structure)
      const updatedResult = { ...result, full_jd: editedContent }
      
      // 2. Persist if we have a reportId (history mode)
      if (reportId) {
        const token = await getToken()
        await updateReportById(reportId, {
          ...updatedResult,
          analysis_type: 'jd_generated'
        }, token)
      }
      
      setResult(updatedResult)
      setView('preview')
    } catch (err) {
      console.error("Failed to save JD:", err)
      alert("Failed to save changes. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedContent(stripMarkdown(result.full_jd))
    setView('preview')
  }

  return (
    <div className="space-y-4">

      {/* Header — clean, confident, no bias score */}
      <div className="bg-[#f59e0b] rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full font-semibold tracking-wide">
                ✓ Bias-Free · AI Generated
              </span>
            </div>
            <h2 className="text-lg font-semibold leading-snug mb-1">
              {result.headline}
            </h2>
            <p className="text-xs opacity-60">
              {result.meta?.role} · {result.meta?.company} · 
              {result.meta?.location} · {result.meta?.work_mode}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-3xl font-bold">
              {result.conversion_insights?.word_count ?? '—'}
            </div>
            <div className="text-xs opacity-50">words</div>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-6 mt-5 pt-4 
                        border-t border-white/10">
          <div>
            <div className="text-lg font-semibold">
              {result.sections?.must_have?.length ?? 0}
            </div>
            <div className="text-xs opacity-50">
              Requirements
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold">
              {result.sections?.what_youll_do?.length ?? 0}
            </div>
            <div className="text-xs opacity-50">
              Responsibilities
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold">
              {result.sections?.what_we_offer?.length ?? 0}
            </div>
            <div className="text-xs opacity-50">Benefits</div>
          </div>
          <div>
            <div className="text-lg font-semibold">
              {result.conversion_insights
                ?.estimated_talent_pool_reach ?? '—'}
            </div>
            <div className="text-xs opacity-50">
              Talent reach
            </div>
          </div>
        </div>
      </div>

      {/* Conversion insight */}
      {result.conversion_insights?.top_strength && (
        <div className="bg-amber-50 border border-amber-100 
                        rounded-2xl p-4 flex gap-3">
          <span className="text-amber-500 flex-shrink-0 
                           font-bold text-lg">↗</span>
          <div>
            <p className="text-xs font-semibold text-amber-700 
                          mb-0.5 uppercase tracking-wider">
              Why this JD converts
            </p>
            <p className="text-sm text-amber-800">
              {result.conversion_insights.top_strength}
            </p>
          </div>
        </div>
      )}

      {/* JD Content */}
      <div className="bg-white border border-gray-200 
                      rounded-2xl overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center justify-between 
                        px-5 py-3 border-b border-gray-100 
                        bg-gray-50">
          <div className="flex gap-1">
            <button
              onClick={() => setView('preview')}
              className={`text-xs px-4 py-1.5 rounded-lg 
                          font-bold transition-all ${
                view === 'preview'
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setView('edit')}
              className={`text-xs px-4 py-1.5 rounded-lg 
                          font-bold transition-all flex items-center gap-1.5 ${
                view === 'edit'
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit
            </button>
          </div>

          <div className="flex items-center gap-2">
            {view === 'edit' ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="text-xs font-bold px-3 py-1.5 
                             text-gray-500 hover:text-gray-700 
                             flex items-center gap-1 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="text-xs font-bold px-4 py-1.5 
                             rounded-full bg-blue-600 text-white 
                             hover:bg-blue-700 disabled:opacity-50
                             flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                >
                  {isSaving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <button
                onClick={copy}
                className={`text-xs font-bold px-5 py-1.5 
                            rounded-full transition-all shadow-sm active:scale-95 ${
                  copied
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-[#f59e0b] text-white hover:bg-[#d97706]'
                }`}
              >
                {copied ? '✓ Copied' : 'Copy full JD'}
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 max-h-[650px] overflow-y-auto bg-white">
          {view === 'preview' ? (
            // Rendered markdown — structured and clean
            <div className="prose prose-sm max-w-none
                            prose-headings:font-bold
                            prose-headings:text-gray-900
                            prose-h1:text-2xl
                            prose-h2:text-lg
                            prose-h2:text-[#f59e0b]
                            prose-h2:border-b
                            prose-h2:border-gray-100
                            prose-h2:pb-2
                            prose-p:text-gray-700
                            prose-p:leading-relaxed
                            prose-p:text-[15px]
                            prose-li:text-gray-700
                            prose-li:text-[15px]
                            prose-strong:text-gray-900
                            prose-hr:border-gray-100
                            animate-in fade-in duration-500">
              <ReactMarkdown>
                {result.full_jd}
              </ReactMarkdown>
            </div>
          ) : (
            // Edit mode — textarea styled to feel like the preview UI
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                disabled={isSaving}
                className="w-full h-[550px] p-0 text-[15px] leading-relaxed
                           text-gray-800 bg-transparent border-none
                           focus:ring-0 outline-none resize-none
                           font-sans selection:bg-blue-100 whitespace-pre-wrap"
                placeholder="Edit your job description here..."
                autoFocus
              />
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between opacity-50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Clean text mode — no symbols
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {editedContent.length} characters
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Single action — generate another only */}
      {/* NO re-analyse button */}
      <button
        onClick={onReset}
        className="w-full py-3.5 border border-gray-200 
                   text-gray-700 rounded-2xl text-sm 
                   font-medium hover:bg-gray-50 
                   transition-colors"
      >
        ← Generate another JD
      </button>

      {/* Small trust footer */}
      <p className="text-center text-xs text-gray-400 pb-2">
        This JD was generated bias-free by Rifair AI's 
        inclusive hiring engine. Safe to publish directly.
      </p>
    </div>
  )
}
