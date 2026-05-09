import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// Extended server-side blocked patterns
const SERVER_PATTERNS = {
  sexual: [
    /\b(sex|sexual|nude|naked|porn|explicit|erotic|nsfw|adult)\b/gi,
    /\b(intercourse|genitals|breasts|penis|vagina)\b/gi,
    /\b(hook\s*up|sleep\s*with|get\s*laid)\b/gi,
  ],
  harassment: [
    /\b(harass|stalk|threaten|blackmail|assault|rape|molest)\b/gi,
    /\b(force\s*(her|him|them)|coerce|intimidate)\b/gi,
    /\b(make\s*(her|him)\s*(do|give|show))\b/gi,
  ],
  hate: [
    /\b(kill\s*all|hate\s*all|inferior\s*race|subhuman)\b/gi,
    /\b(terrorist|bomb\s*threat|exterminate)\b/gi,
  ],
  prompt_injection: [
    /ignore\s*(all\s*)?(previous|above|prior)\s*instructions/gi,
    /you\s*are\s*now\s*(a|an)\s*(different|new|evil|jailbreak)/gi,
    /pretend\s*(you\s*are|to\s*be)\s*(a|an)\s*(different|unrestricted)/gi,
    /dan\s*mode|jailbreak|ignore\s*your\s*guidelines/gi,
    /system\s*prompt|override\s*instructions/gi,
    /act\s*as\s*(if\s*you\s*(have\s*no|are\s*without)|a\s*different)/gi,
  ]
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()

  const { input, context } = await req.json()

  if (!input || typeof input !== 'string') {
    return NextResponse.json({
      isClean: false,
      category: 'invalid',
      message: 'Input is required'
    })
  }

  const text = input.toLowerCase().trim()

  // Check prompt injection first — highest priority
  for (const pattern of SERVER_PATTERNS.prompt_injection) {
    if (pattern.test(text)) {
      // Log attempt
      if (userId) {
        await supabaseAdmin.from('moderation_logs').insert({
          user_id: userId,
          input: input.slice(0, 200),
          category: 'prompt_injection',
          action: 'blocked',
          context,
          created_at: new Date().toISOString()
        })
      }
      return NextResponse.json({
        isClean: false,
        category: 'prompt_injection',
        message: 'This input attempts to manipulate ' +
                 'our AI system. This action has been logged.',
        severity: 'block'
      })
    }
  }

  // Check other categories
  for (const [category, patterns] of Object.entries(SERVER_PATTERNS)) {
    if (category === 'prompt_injection') continue

    for (const pattern of patterns) {
      pattern.lastIndex = 0 // Reset regex state
      if (pattern.test(text)) {
        // Log violation
        if (userId) {
          await supabaseAdmin.from('moderation_logs').insert({
            user_id: userId,
            input: input.slice(0, 200),
            category,
            action: 'blocked',
            context,
            created_at: new Date().toISOString()
          })
        }

        return NextResponse.json({
          isClean: false,
          category,
          message: getServerMessage(category),
          severity: 'block'
        })
      }
    }
  }

  return NextResponse.json({
    isClean: true,
    category: null,
    message: null,
    severity: null
  })
}

function getServerMessage(category: string): string {
  const messages: Record<string, string> = {
    sexual:
      'Inappropriate sexual content detected. ' +
      'Please enter professional hiring content only.',
    harassment:
      'Content related to harassment or abuse detected. ' +
      'This platform is for professional hiring use only.',
    hate:
      'Harmful or hateful language detected. ' +
      'Please maintain professional standards.',
    prompt_injection:
      'Attempt to manipulate AI system detected. ' +
      'This action has been logged.'
  }
  return messages[category] ??
    'Inappropriate content detected. Please revise your input.'
}
