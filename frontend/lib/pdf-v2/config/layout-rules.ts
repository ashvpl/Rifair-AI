// config/layout-rules.ts

export interface LayoutRuleSet {
  defaultOrientation: 'portrait' | 'landscape';
  maxTableRowsPerPage: number;
  chartMinHeight?: string;
  chartMaxHeight?: string;
  requiresTwoColumn: boolean;
  sectionOrder: string[];
  density: 'low' | 'medium' | 'high';
  keepTogetherSelectors: string[];
  specialRules?: Record<string, string>;
}

export const LAYOUT_RULES: Record<string, LayoutRuleSet> = {
  skills_analysis: {
    // High visual content — use landscape for charts
    defaultOrientation: 'landscape',
    maxTableRowsPerPage: 12, // Prevent table overflow
    chartMinHeight: '250px',
    chartMaxHeight: '400px',
    requiresTwoColumn: true, // Side-by-side chart + insight
    sectionOrder: ['executiveSummary', 'skillBreakdown', 'gapAnalysis', 'learningPath', 'benchmarkComparison'],
    density: 'high',
    // Prevent breaking chart from its legend
    keepTogetherSelectors: ['.chart-container', '.chart-legend-pair', '.skill-card']
  },
  
  kit_audit: {
    defaultOrientation: 'portrait',
    maxTableRowsPerPage: 18, // More rows allowed for checklists
    requiresTwoColumn: false,
    sectionOrder: ['auditMetadata', 'complianceScore', 'checklistResults', 'findings', 'actionPlan'],
    density: 'medium',
    // Findings must stay together (evidence + recommendation)
    keepTogetherSelectors: ['.finding-item', '.action-item'],
    // Special rule: findings with HIGH severity get full page treatment
    specialRules: {
      highSeverityFinding: 'fullPageHighlight'
    }
  },
  
  jd_analysis: {
    defaultOrientation: 'portrait',
    maxTableRowsPerPage: 15,
    requiresTwoColumn: false,
    sectionOrder: ['jobDescription', 'requirementBreakdown', 'marketBenchmark', 'candidateFitPrediction'],
    density: 'medium',
    keepTogetherSelectors: ['.requirement-category', '.benchmark-row']
  },
  
  candidate_evaluation: {
    defaultOrientation: 'portrait',
    maxTableRowsPerPage: 10, // Evaluation matrix needs breathing room
    requiresTwoColumn: true, // Profile left, scores right
    sectionOrder: ['candidateProfile', 'evaluationMatrix', 'interviewNotes', 'recommendation'],
    density: 'low', // Premium feel = more whitespace
    keepTogetherSelectors: ['.rubric-category', '.interview-qa-pair', '.verdict-block'],
    specialRules: {
      recommendation: 'highlightedBox'
    }
  }
};
