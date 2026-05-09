'use client'

interface ContentWarningProps {
  warning: string | null
  severity: 'block' | 'warn' | null
  category: string | null
  isChecking: boolean
}

const categoryIcons: Record<string, string> = {
  sexual:           '🚫',
  harassment:       '⚠️',
  hate:             '🚫',
  prompt_injection: '🛡️',
  irrelevant:       'ℹ️',
}

const categoryLabels: Record<string, string> = {
  sexual:           'Inappropriate content',
  harassment:       'Harmful content',
  hate:             'Hateful language',
  prompt_injection: 'Security violation',
  irrelevant:       'Off-topic content',
}

export function ContentWarning({
  warning,
  severity,
  category,
  isChecking
}: ContentWarningProps) {

  if (isChecking) {
    return (
      <div className="flex items-center gap-2 
                      text-xs text-gray-400 mt-2">
        <div className="w-3 h-3 border border-gray-300 
                        border-t-gray-500 rounded-full 
                        animate-spin" />
        Checking content...
      </div>
    )
  }

  if (!warning) return null

  const isBlock = severity === 'block'
  const icon = category
    ? categoryIcons[category] ?? '⚠️'
    : '⚠️'
  const label = category
    ? categoryLabels[category] ?? 'Warning'
    : 'Warning'

  return (
    <div className={`rounded-xl p-3 mt-2 border flex items-start gap-3 animate-in slide-in-from-top-1 duration-200 ${
      isBlock ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
    }`}>
      <span className="text-base flex-shrink-0 mt-0.5">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold mb-0.5 ${
          isBlock ? 'text-red-700' : 'text-amber-700'
        }`}>
          {label}
        </p>
        <p className={`text-xs leading-relaxed ${
          isBlock ? 'text-red-600' : 'text-amber-600'
        }`}>
          {warning}
        </p>
      </div>
    </div>
  )
}
