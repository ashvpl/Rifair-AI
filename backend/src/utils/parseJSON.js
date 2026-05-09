'use strict';

/**
 * parseJSON.js
 *
 * Robust JSON extractor for AI responses.
 * Handles all common AI misbehaviours:
 *   - Markdown fences (```json ... ``` or ``` ... ```)
 *   - Preamble text before { or [
 *   - Trailing text after } or ]
 *   - Trailing commas before } or ]
 *   - Control characters inside strings
 *
 * Usage:
 *   const { parseJSON } = require('../utils/parseJSON');
 *   const result = parseJSON(rawAIResponse);
 *
 * Throws a descriptive Error (never returns undefined) so callers
 * can decide whether to re-throw or return a structured fallback.
 */

function parseJSON(raw) {
  if (!raw || typeof raw !== 'string') {
    throw new Error('Empty or invalid AI response');
  }

  let text = raw.trim();

  // ── Step 1: Strip markdown code fences ─────────────────────────────────────
  // Handles ```json ... ``` first, then generic ``` ... ```
  if (text.includes('```json')) {
    const parts = text.split('```json');
    if (parts[1]) {
      text = parts[1].split('```')[0].trim();
    }
  } else if (text.includes('```')) {
    const parts = text.split('```');
    if (parts.length >= 2) {
      text = parts[1].trim();
      // Strip language identifier if present (e.g. "json\n{...")
      if (text.startsWith('json')) {
        text = text.slice(4).trim();
      }
    }
  }

  // ── Step 2: Find the outermost JSON boundaries ──────────────────────────────
  // Lets the AI prepend "Here is the result:" without crashing.
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
    // Whichever delimiter comes first wins
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
  // Trailing commas: ,} or ,]
  text = text.replace(/,(\s*[}\]])/g, '$1');

  // ── Step 4: First parse attempt ────────────────────────────────────────────
  try {
    return JSON.parse(text);
  } catch (firstError) {
    // ── Step 5: Aggressive cleanup and retry ───────────────────────────────
    try {
      const cleaned = text
        // Remove ASCII control characters (0x00–0x1F, 0x7F) that break JSON
        .replace(/[\x00-\x1F\x7F]/g, ' ')
        // Remove trailing commas again after control char removal
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

module.exports = { parseJSON };
