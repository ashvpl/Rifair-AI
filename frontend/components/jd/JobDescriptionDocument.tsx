'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Copy, RotateCcw, Building } from 'lucide-react'
import { cn } from '@/lib/utils'
import ExportButton from '@/components/pdf/ExportButton'

export interface JDSections {
  about_company?: string
  what_youll_do?: string[]
  must_have?: string[]
  nice_to_have?: string[]
  what_we_offer?: string[]
  hiring_process?: string | string[]
  cta?: string
}

export interface JDMeta {
  role?: string
  company?: string
  location?: string
  experience?: string
  work_mode?: string
}

interface JobDescriptionDocumentProps {
  result: {
    headline?: string
    full_jd?: string
    sections?: JDSections
    meta?: JDMeta
    conversion_insights?: {
      estimated_talent_pool_reach?: string
      word_count?: number
    }
  }
  reportId?: string | undefined
  planId?: string | undefined
  onReset?: (() => void) | undefined
  copied?: boolean | undefined
  onCopy?: (() => void) | undefined
  // Edit mode
  isEditing?: boolean | undefined
  editSections?: JDSections | undefined
  editMeta?: JDMeta | undefined
  onSectionChange?: ((sections: JDSections) => void) | undefined
  onMetaChange?: ((meta: JDMeta) => void) | undefined
}

function EditableText({
  value,
  onChange,
  placeholder,
  className,
  rows = 3,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
  rows?: number
}) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [value])

  return (
    <textarea
      ref={textareaRef}
      value={value}
      rows={rows}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        'w-full bg-transparent border border-dashed border-neutral-300 dark:border-neutral-700 hover:border-amber-400 focus:border-solid focus:border-amber-500 focus:bg-amber-50/20 dark:focus:bg-amber-950/10 focus:ring-1 focus:ring-amber-500/30 rounded-lg px-2.5 py-1.5 resize-none focus:outline-none transition-all placeholder:text-neutral-400 overflow-hidden leading-relaxed font-sans text-neutral-600 dark:text-neutral-300',
        className
      )}
    />
  )
}

function BulletItem({
  value,
  onChange,
  onKeyDown,
  placeholder,
}: {
  value: string
  onChange: (val: string) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  placeholder?: string
}) {
  const ref = React.useRef<HTMLTextAreaElement>(null)

  React.useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto'
      ref.current.style.height = `${ref.current.scrollHeight}px`
    }
  }, [value])

  return (
    <textarea
      ref={ref}
      data-bullet-item
      value={value}
      rows={1}
      onChange={e => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className="flex-1 bg-transparent border border-dashed border-neutral-300 dark:border-neutral-700 hover:border-amber-400 focus:border-solid focus:border-amber-500 focus:bg-amber-50/20 dark:focus:bg-amber-950/10 focus:ring-1 focus:ring-amber-500/30 rounded-lg px-2 py-1 text-sm sm:text-base leading-relaxed font-sans text-neutral-600 dark:text-neutral-300 resize-none focus:outline-none transition-all placeholder:text-neutral-400 overflow-hidden"
    />
  )
}

function EditableBulletList({
  items,
  onChange,
  placeholder,
}: {
  items: string[]
  onChange: (items: string[]) => void
  placeholder?: string
}) {
  const handleChange = (idx: number, val: string) => {
    const next = [...items]
    next[idx] = val
    onChange(next)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, idx: number) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const next = [...items]
      next.splice(idx + 1, 0, '')
      onChange(next)
      // Focus next
      setTimeout(() => {
        const textareas = document.querySelectorAll<HTMLTextAreaElement>('[data-bullet-item]')
        textareas[idx + 1]?.focus()
      }, 50)
    }
    if (e.key === 'Backspace' && items[idx] === '' && items.length > 1) {
      e.preventDefault()
      const next = items.filter((_, i) => i !== idx)
      onChange(next)
      setTimeout(() => {
        const textareas = document.querySelectorAll<HTMLTextAreaElement>('[data-bullet-item]')
        textareas[Math.max(0, idx - 1)]?.focus()
      }, 50)
    }
  }

  return (
    <ul className="space-y-2 list-none">
      {items.map((item, idx) => (
        <li key={idx} className="flex items-start gap-2.5">
          <span className="text-neutral-400 dark:text-neutral-500 font-mono select-none mt-1.5 text-sm">•</span>
          <BulletItem
            value={item}
            onChange={val => handleChange(idx, val)}
            onKeyDown={e => handleKeyDown(e, idx)}
            placeholder={placeholder || 'Type here…'}
          />
        </li>
      ))}
      <li>
        <button
          type="button"
          onClick={() => onChange([...items, ''])}
          className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500 hover:text-amber-700 pl-5 transition-colors"
        >
          + Add item
        </button>
      </li>
    </ul>
  )
}

interface SectionHeaderProps {
  title: string
  sectionKey: string
  isEditing: boolean
  isCollapsed: boolean
  onToggle: (sectionKey: string) => void
}

function SectionHeader({
  title,
  sectionKey,
  isEditing,
  isCollapsed,
  onToggle,
}: SectionHeaderProps) {
  return (
    <div
      onClick={() => {
        if (!isEditing) onToggle(sectionKey)
      }}
      className={cn(
        'flex items-center justify-between py-3 border-b border-neutral-100 dark:border-neutral-800 mb-4 select-none',
        !isEditing && 'cursor-pointer'
      )}
    >
      <h3 className="font-sans text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
        {title}
      </h3>
      {!isEditing && (
        <div className="sm:hidden text-neutral-400">
          {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </div>
      )}
    </div>
  )
}

interface SectionWrapperProps {
  sectionKey: string
  isEditing: boolean
  isCollapsed: boolean
  children: React.ReactNode
}

function SectionWrapper({
  isEditing,
  isCollapsed,
  children,
}: SectionWrapperProps) {
  return (
    <div className={cn('transition-all duration-300', (!isEditing && isCollapsed) ? 'hidden sm:block' : 'block')}>
      {children}
    </div>
  )
}

export function JobDescriptionDocument({
  result,
  reportId,
  planId = 'free',
  onReset,
  copied = false,
  onCopy,
  isEditing = false,
  editSections,
  editMeta,
  onSectionChange,
  onMetaChange,
}: JobDescriptionDocumentProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    about: false,
    responsibilities: false,
    requirements: false,
    preferred: false,
    benefits: false,
    process: false
  })

  const toggleSection = (section: string) => {
    if (!isEditing) {
      setCollapsed(prev => ({ ...prev, [section]: !prev[section] }))
    }
  }

  const meta = (isEditing ? editMeta : result.meta) || {}
  const sections = (isEditing ? editSections : result.sections) || {}

  const handleSectionField = (key: keyof JDSections, value: any) => {
    onSectionChange?.({ ...sections, [key]: value })
  }

  const handleMetaField = (key: keyof JDMeta, value: string) => {
    onMetaChange?.({ ...meta, [key]: value })
  }

  const badges = [
    meta.work_mode && { label: meta.work_mode, key: 'work_mode' as keyof JDMeta },
    meta.experience && { label: meta.experience, key: 'experience' as keyof JDMeta },
    meta.location && { label: meta.location, key: 'location' as keyof JDMeta }
  ].filter(Boolean) as { label: string; key: keyof JDMeta }[]

  return (
    <div className="w-full space-y-0 pb-24 md:pb-8 font-sans antialiased text-neutral-800 dark:text-neutral-200">

      {/* ATS/LinkedIn Document Card */}
      <div className={cn(
        'bg-white dark:bg-neutral-900 border rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-sm relative',
        isEditing
          ? 'border-amber-300 dark:border-amber-700/50 ring-2 ring-amber-100 dark:ring-amber-900/30'
          : 'border-neutral-200/80 dark:border-neutral-800/80'
      )}>

        {isEditing && (
          <div className="mb-4 flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <span className="font-mono text-[9px] uppercase tracking-widest font-black">✏ Editing — click any field to edit</span>
          </div>
        )}

        {/* ── Document Header ── */}
        <div className="space-y-3 pb-6 border-b border-neutral-100 dark:border-neutral-800">
          {/* Role title */}
          {isEditing ? (
            <input
              type="text"
              value={meta.role || ''}
              onChange={e => handleMetaField('role', e.target.value)}
              placeholder="Role Title"
              className="w-full font-sans text-xl sm:text-3xl font-black text-neutral-900 dark:text-white bg-transparent border border-dashed border-neutral-300 dark:border-neutral-750 hover:border-amber-400 focus:border-solid focus:border-amber-500 focus:bg-amber-50/20 dark:focus:bg-amber-950/10 focus:ring-1 focus:ring-amber-500/30 rounded-xl px-2.5 py-1.5 focus:outline-none transition-all tracking-tight leading-tight"
            />
          ) : (
            <h1 className="text-xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight leading-tight">
              {meta.role || 'Job Posting'}
            </h1>
          )}

          {/* Company */}
          <div className="flex items-center gap-2">
            <Building className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
            {isEditing ? (
              <input
                type="text"
                value={meta.company || ''}
                onChange={e => handleMetaField('company', e.target.value)}
                placeholder="Company name"
                className="font-mono text-xs sm:text-sm font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest bg-transparent border border-dashed border-neutral-300 dark:border-neutral-750 hover:border-amber-400 focus:border-solid focus:border-amber-500 focus:bg-amber-50/20 dark:focus:bg-amber-950/10 focus:ring-1 focus:ring-amber-500/30 rounded-lg px-2 py-0.5 focus:outline-none transition-all w-full max-w-xs"
              />
            ) : (
              <span className="font-mono text-xs sm:text-sm font-bold text-neutral-500 uppercase tracking-widest">
                {meta.company || 'Confidential'}
              </span>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {isEditing ? (
              <>
                {(['work_mode', 'experience', 'location'] as (keyof JDMeta)[]).map(key => (
                  <input
                    key={key}
                    type="text"
                    value={(meta[key] as string) || ''}
                    onChange={e => handleMetaField(key, e.target.value)}
                    placeholder={key.replace('_', ' ')}
                    className="font-mono text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-transparent border border-dashed border-neutral-300 dark:border-neutral-750 hover:border-amber-400 focus:border-solid focus:border-amber-500 focus:bg-amber-50/20 dark:focus:bg-amber-950/10 focus:ring-1 focus:ring-amber-500/30 text-neutral-600 dark:text-neutral-300 px-2 py-1 rounded-md focus:outline-none transition-all w-24 sm:w-28 text-center"
                  />
                ))}
              </>
            ) : (
              badges.map((badge, idx) => (
                <span
                  key={idx}
                  className="font-mono text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 px-2.5 py-1 rounded-md border border-neutral-200/45 dark:border-neutral-700/40"
                >
                  {badge.label}
                </span>
              ))
            )}
          </div>
        </div>

        {/* ── Document Content ── */}
        <div className="pt-6 space-y-8">

          {/* About Company */}
          {(sections.about_company || isEditing) && (
            <section>
              <SectionHeader
                title="About the Company"
                sectionKey="about"
                isEditing={isEditing}
                isCollapsed={!!collapsed.about}
                onToggle={toggleSection}
              />
              <SectionWrapper
                sectionKey="about"
                isEditing={isEditing}
                isCollapsed={!!collapsed.about}
              >
                {isEditing ? (
                  <EditableText
                    value={sections.about_company || ''}
                    onChange={v => handleSectionField('about_company', v)}
                    placeholder="Describe the company, its mission, and why this is an exciting time to join…"
                    rows={4}
                    className="text-sm sm:text-base font-sans text-neutral-700 leading-relaxed"
                  />
                ) : (
                  <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed font-sans">
                    {sections.about_company}
                  </p>
                )}
              </SectionWrapper>
            </section>
          )}

          {/* What You'll Do */}
          {((sections.what_youll_do && sections.what_youll_do.length > 0) || isEditing) && (
            <section>
              <SectionHeader
                title="What You'll Do"
                sectionKey="responsibilities"
                isEditing={isEditing}
                isCollapsed={!!collapsed.responsibilities}
                onToggle={toggleSection}
              />
              <SectionWrapper
                sectionKey="responsibilities"
                isEditing={isEditing}
                isCollapsed={!!collapsed.responsibilities}
              >
                {isEditing ? (
                  <EditableBulletList
                    items={sections.what_youll_do || ['']}
                    onChange={v => handleSectionField('what_youll_do', v)}
                    placeholder="Responsibility (press Enter to add a new one)"
                  />
                ) : (
                  <ul className="space-y-2.5 list-none">
                    {(sections.what_youll_do || []).map((resp, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed font-sans">
                        <span className="text-neutral-400 font-mono select-none mt-0.5 text-sm">•</span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </SectionWrapper>
            </section>
          )}

          {/* Requirements */}
          {((sections.must_have && sections.must_have.length > 0) || isEditing) && (
            <section>
              <SectionHeader
                title="Requirements"
                sectionKey="requirements"
                isEditing={isEditing}
                isCollapsed={!!collapsed.requirements}
                onToggle={toggleSection}
              />
              <SectionWrapper
                sectionKey="requirements"
                isEditing={isEditing}
                isCollapsed={!!collapsed.requirements}
              >
                {isEditing ? (
                  <EditableBulletList
                    items={sections.must_have || ['']}
                    onChange={v => handleSectionField('must_have', v)}
                    placeholder="Required skill or qualification"
                  />
                ) : (
                  <ul className="space-y-2.5 list-none">
                    {(sections.must_have || []).map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed font-sans">
                        <span className="text-neutral-400 font-mono select-none mt-0.5 text-sm">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </SectionWrapper>
            </section>
          )}

          {/* Nice to Have */}
          {((sections.nice_to_have && sections.nice_to_have.length > 0) || isEditing) && (
            <section>
              <SectionHeader
                title="Nice to Have"
                sectionKey="preferred"
                isEditing={isEditing}
                isCollapsed={!!collapsed.preferred}
                onToggle={toggleSection}
              />
              <SectionWrapper
                sectionKey="preferred"
                isEditing={isEditing}
                isCollapsed={!!collapsed.preferred}
              >
                {isEditing ? (
                  <EditableBulletList
                    items={sections.nice_to_have || ['']}
                    onChange={v => handleSectionField('nice_to_have', v)}
                    placeholder="Preferred but not required"
                  />
                ) : (
                  <ul className="space-y-2.5 list-none">
                    {(sections.nice_to_have || []).map((pref, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed font-sans">
                        <span className="text-neutral-400 font-mono select-none mt-0.5 text-sm">•</span>
                        <span>{pref}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </SectionWrapper>
            </section>
          )}

          {/* Benefits */}
          {((sections.what_we_offer && sections.what_we_offer.length > 0) || isEditing) && (
            <section>
              <SectionHeader
                title="Compensation & Benefits"
                sectionKey="benefits"
                isEditing={isEditing}
                isCollapsed={!!collapsed.benefits}
                onToggle={toggleSection}
              />
              <SectionWrapper
                sectionKey="benefits"
                isEditing={isEditing}
                isCollapsed={!!collapsed.benefits}
              >
                {isEditing ? (
                  <EditableBulletList
                    items={sections.what_we_offer || ['']}
                    onChange={v => handleSectionField('what_we_offer', v)}
                    placeholder="Salary, benefits, perks…"
                  />
                ) : (
                  <ul className="space-y-2.5 list-none">
                    {(sections.what_we_offer || []).map((ben, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed font-sans">
                        <span className="text-neutral-400 font-mono select-none mt-0.5 text-sm">•</span>
                        <span>{ben}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </SectionWrapper>
            </section>
          )}

          {/* Hiring Process */}
          {(sections.hiring_process || isEditing) && (
            <section>
              <SectionHeader
                title="Hiring Process"
                sectionKey="process"
                isEditing={isEditing}
                isCollapsed={!!collapsed.process}
                onToggle={toggleSection}
              />
              <SectionWrapper
                sectionKey="process"
                isEditing={isEditing}
                isCollapsed={!!collapsed.process}
              >
                {isEditing ? (
                  <EditableText
                    value={typeof sections.hiring_process === 'string'
                      ? sections.hiring_process
                      : (sections.hiring_process || []).join('\n')}
                    onChange={v => handleSectionField('hiring_process', v)}
                    placeholder="Describe the interview stages…"
                    rows={3}
                    className="text-sm sm:text-base font-sans text-neutral-700 leading-relaxed"
                  />
                ) : (
                  <div className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed font-sans">
                    {Array.isArray(sections.hiring_process) ? (
                      <ol className="space-y-2 list-decimal list-inside pl-1">
                        {sections.hiring_process.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    ) : (
                      <p>{sections.hiring_process}</p>
                    )}
                  </div>
                )}
              </SectionWrapper>
            </section>
          )}

          {/* CTA */}
          {(sections.cta || isEditing) && (
            <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800">
              {isEditing ? (
                <EditableText
                  value={sections.cta || ''}
                  onChange={v => handleSectionField('cta', v)}
                  placeholder="Call to action — how to apply, what to include…"
                  rows={2}
                  className="text-sm font-sans text-neutral-700 leading-relaxed text-center"
                />
              ) : (
                <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 italic text-center font-sans">
                  {sections.cta}
                </p>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ── Mobile Sticky Bottom Bar ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 p-3 z-40 flex items-center justify-between gap-2 shadow-[0_-10px_25px_rgba(0,0,0,0.05)]">
        {onReset && (
          <button
            onClick={onReset}
            className="flex-1 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all bg-white dark:bg-neutral-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Regen
          </button>
        )}
        {onCopy && (
          <button
            onClick={onCopy}
            className={cn(
              'flex-1 py-2.5 rounded-xl text-white font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all',
              copied ? 'bg-emerald-600' : 'bg-[#f59e0b] hover:bg-[#d97706]'
            )}
          >
            <Copy className="w-3.5 h-3.5" />
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
        <ExportButton
          type="jd"
          id={reportId || ''}
          planTier={planId}
          variant="secondary"
          className="flex-1 h-9 text-[10px] uppercase font-bold tracking-wider py-0 rounded-xl"
        />
      </div>

    </div>
  )
}
