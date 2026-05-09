/**
 * parseJSON.ts
 *
 * Robust JSON extractor for AI responses in the frontend.
 * Ported from backend/src/utils/parseJSON.js
 */

export function parseJSON(raw: string): any {
  if (!raw || typeof raw !== 'string') {
    throw new Error('Empty or invalid AI response');
  }

  let text = raw.trim();

  // ── Step 1: Strip markdown code fences ─────────────────────────────────────
  if (text.includes('```json')) {
    const parts = text.split('```json');
    if (parts[1]) {
      text = parts[1].split('```')[0].trim();
    }
  } else if (text.includes('```')) {
    const parts = text.split('```');
    if (parts.length >= 2) {
      text = parts[1].trim();
      if (text.startsWith('json')) {
        text = text.slice(4).trim();
      }
    }
  }

  // ── Step 2: Find the outermost JSON boundaries ──────────────────────────────
  const firstBrace   = text.indexOf('{');
  const firstBracket = text.indexOf('[');

  let startIndex = -1;
  let isArray    = false;

  if (firstBrace === -1 && firstBracket === -1) {
    throw new Error('No JSON object or array found in AI response');
  }

  if (firstBrace === -1) {
    startIndex = firstBracket;
    isArray    = true;
  } else if (firstBracket === -1) {
    startIndex = firstBrace;
  } else {
    if (firstBracket < firstBrace) {
      startIndex = firstBracket;
      isArray    = true;
    } else {
      startIndex = firstBrace;
    }
  }

  const endChar  = isArray ? ']' : '}';
  const endIndex = text.lastIndexOf(endChar) + 1;

  if (endIndex <= startIndex) {
    throw new Error('Malformed AI JSON — could not find closing delimiter');
  }

  text = text.slice(startIndex, endIndex);

  // ── Step 3: Fix common AI JSON mistakes ────────────────────────────────────
  text = text.replace(/,(\s*[}\]])/g, '$1');

  // ── Step 4: First parse attempt ────────────────────────────────────────────
  try {
    return JSON.parse(text);
  } catch (firstError: any) {
    // ── Step 5: Aggressive cleanup and retry ───────────────────────────────
    try {
      const cleaned = text
        .replace(/[\x00-\x1F\x7F]/g, ' ')
        .replace(/,(\s*[}\]])/g, '$1')
        .trim();

      return JSON.parse(cleaned);
    } catch (secondError) {
      console.error('[parseJSON] Raw AI response (first 500 chars):', raw.slice(0, 500));
      console.error('[parseJSON] Cleaned text (first 500 chars):', text.slice(0, 500));
      throw new Error(
        `JSON parse failed: ${firstError.message}. ` +
        `Response preview: "${raw.slice(0, 120)}"`
      );
    }
  }
}
