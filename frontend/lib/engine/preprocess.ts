export function preprocessText(text: string): string[] {
  if (!text) return [];
  
  // Normalize whitespace
  const normalized = text.replace(/\s+/g, ' ').trim();
  
  // Segment into sentences based on newlines or common punctuation for lists natively.
  const lines = normalized.split(/(?<=[?.!])\s+|\n+/).filter(line => line.trim().length > 0);
  
  // Remove bullet points / numbering to just get the text
  const cleanedSentences = lines.map(line => line.replace(/^\d+[\.\)]\s*/, "").replace(/^-\s*/, "").trim()).filter(line => line.length > 3);
  
  return cleanedSentences;
}
