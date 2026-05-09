'use client'

import { useState, useCallback, useRef } from 'react'
import { clientSideCheck } from '@/lib/moderation/client-guard'

interface ModerationState {
  isChecking: boolean
  isBlocked: boolean
  warning: string | null
  category: string | null
  severity: 'block' | 'warn' | null
}

export function useContentModeration(context: string) {
  const [state, setState] = useState<ModerationState>({
    isChecking: false,
    isBlocked: false,
    warning: null,
    category: null,
    severity: null
  })

  const debounceRef = useRef<NodeJS.Timeout>()

  const checkContent = useCallback(async (
    input: string
  ): Promise<boolean> => {

    // Clear previous warnings
    setState(prev => ({
      ...prev,
      isBlocked: false,
      warning: null,
      category: null
    }))

    if (!input || input.trim().length < 10) return true

    // Layer 1: instant client check
    const clientResult = clientSideCheck(input)
    if (!clientResult.isClean) {
      setState({
        isChecking: false,
        isBlocked: clientResult.severity === 'block',
        warning: clientResult.message,
        category: clientResult.category,
        severity: clientResult.severity
      })
      return clientResult.severity !== 'block'
    }

    // Layer 2: server check (debounced 800ms)
    return new Promise(resolve => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      debounceRef.current = setTimeout(async () => {
        setState(prev => ({ ...prev, isChecking: true }))

        try {
          const res = await fetch('/api/moderate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input, context })
          })

          const result = await res.json()

          setState({
            isChecking: false,
            isBlocked: !result.isClean &&
                       result.severity === 'block',
            warning: result.message,
            category: result.category,
            severity: result.severity
          })

          resolve(result.isClean ||
                  result.severity === 'warn')

        } catch {
          // If moderation check fails, allow through
          // Never block user due to our own error
          setState(prev => ({
            ...prev,
            isChecking: false
          }))
          resolve(true)
        }
      }, 800)
    })
  }, [context])

  const clearModeration = useCallback(() => {
    setState({
      isChecking: false,
      isBlocked: false,
      warning: null,
      category: null,
      severity: null
    })
  }, [])

  return {
    ...state,
    checkContent,
    clearModeration
  }
}
