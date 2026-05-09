const BLOCKED_PATTERNS = {
  sexual: [
    'sexual', 'nude', 'naked', 'porn', 'explicit',
    'intercourse', 'genitals', 'erotic', 'nsfw',
    'onlyfans', 'adult content', 'sex with',
    'sleep with', 'hook up'
  ],
  harassment: [
    'harass', 'stalk', 'threaten', 'blackmail',
    'intimidate', 'abuse', 'assault', 'rape',
    'molest', 'grope', 'touch inappropriately',
    'make her', 'force her', 'force him',
    'coerce'
  ],
  hate_speech: [
    'kill all', 'hate all', 'inferior race',
    'subhuman', 'go back to your country',
    'terrorist', 'bomb', 'attack',
    'exterminate', 'slur'
  ],
  irrelevant: [
    'write me a story', 'write code for',
    'tell me a joke', 'what is the weather',
    'generate image', 'make a video',
    'relationship advice', 'dating',
    'homework', 'essay for school',
    'crypto', 'bitcoin', 'investment advice',
    'medical advice', 'legal advice'
  ]
}

export interface ModerationResult {
  isClean: boolean
  category: string | null
  message: string | null
  severity: 'block' | 'warn' | null
}

export function clientSideCheck(
  input: string
): ModerationResult {
  const text = input.toLowerCase().trim()

  // Too short to be meaningful
  if (text.length < 3) {
    return { isClean: true, category: null,
             message: null, severity: null }
  }

  // Check each category
  for (const [category, terms] of
       Object.entries(BLOCKED_PATTERNS)) {
    for (const term of terms) {
      if (text.includes(term)) {
        return {
          isClean: false,
          category,
          message: getModerationMessage(category),
          severity: category === 'irrelevant'
            ? 'warn' : 'block'
        }
      }
    }
  }

  return {
    isClean: true,
    category: null,
    message: null,
    severity: null
  }
}

function getModerationMessage(category: string): string {
  const messages: Record<string, string> = {
    sexual:
      'This input contains inappropriate sexual content. ' +
      'Rifair AI is a professional hiring tool. ' +
      'Please enter a valid interview question or job description.',
    harassment:
      'This input contains content related to harassment or abuse. ' +
      'Please enter appropriate hiring-related content.',
    hate_speech:
      'This input contains harmful or hateful language. ' +
      'Please enter professional hiring-related content.',
    irrelevant:
      'This doesn\'t look like hiring-related content. ' +
      'Rifair AI analyses interview questions and job descriptions only.'
  }
  return messages[category] ?? 'This input is not appropriate for this platform.'
}
