import { RuleMatch, QuestionAnalysis } from "./types";

export function aggregateSignals(sentences: string[], allMatches: RuleMatch[]): QuestionAnalysis[] {
  // If we wanted to map matches precisely to sentences we would do so here.
  // For now we map standard rule matches to our QuestionAnalysis format.
  
  if (sentences.length === 0) return [];
  
  // Aggregate matches by their source. In a simple rule-based fallback, 
  // we might just iterate lines and matches.
  const analyses: QuestionAnalysis[] = [];
  
  for (const sentence of sentences) {
    const sentenceMatches = allMatches.filter(m => sentence.toLowerCase().includes(m.word.toLowerCase()));
    
    if (sentenceMatches.length > 0) {
      // Aggregate categories
      const categories = Array.from(new Set(sentenceMatches.map(m => m.category)));
      // Highest severity determines the score
      const maxSeverity = Math.max(...sentenceMatches.map(m => m.severity));
      // Primary issue
      const primaryIssue = sentenceMatches[0].word;
      
      analyses.push({
        question: sentence,
        bias_score: maxSeverity,
        bias_type: categories,
        issue: primaryIssue,
        explanation: sentenceMatches[0].explanation,
        impact: sentenceMatches[0].impact,
        rewrite: sentenceMatches[0].rewriteTemplate
      });
    }
  }

  // If no matches, we can optionally return the sentences as "unbiased" 
  // or leave them out. Often the analyzer just skips clean sentences in the highlight array.
  
  return analyses;
}
