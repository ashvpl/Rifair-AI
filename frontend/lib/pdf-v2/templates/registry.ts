// templates/registry.ts

export interface LayoutConfiguration {
  pageSize: 'A4' | 'Letter';
  orientation: 'portrait' | 'landscape';
  margins: { top: number; right: number; bottom: number; left: number };
  fontFamily: string;
  baseFontSize: number;
  headerHeight: number;
  footerHeight: number;
  columns?: number;
  density?: 'low' | 'medium' | 'high';
  chartGrid?: string;
  whitespace?: string;
}

export interface ComponentMapping {
  header: string;
  footer: string;
  coverPage: string;
  tableOfContents?: string;
  chartContainer?: string;
  insightBox?: string;
  severityBadge?: string;
  checklistTable?: string;
  findingCard?: string;
  requirementList?: string;
  comparisonTable?: string;
  profileCard?: string;
  rubricTable?: string;
  verdictBox?: string;
}

export interface TemplateDefinition {
  id: string;
  reportTypes: string[];
  baseTemplate: string | null;
  layout: Partial<LayoutConfiguration>;
  components: Partial<ComponentMapping>;
  styles: string[]; // CSS file paths or names
}

export class TemplateRegistry {
  private templates: Map<string, TemplateDefinition> = new Map();
  
  constructor() {
    this.registerBaseTemplates();
    this.registerSpecializedTemplates();
  }
  
  private register(template: TemplateDefinition) {
    this.templates.set(template.id, template);
  }
  
  private registerBaseTemplates() {
    // Root template — all others inherit from this
    this.register({
      id: 'base-premium',
      reportTypes: ['*'],
      baseTemplate: null,
      layout: {
        pageSize: 'A4',
        orientation: 'portrait',
        margins: { top: 80, right: 60, bottom: 80, left: 60 },
        fontFamily: 'Inter, system-ui, sans-serif',
        baseFontSize: 11,
        headerHeight: 50,
        footerHeight: 40,
        density: 'medium'
      },
      components: {
        header: 'StandardHeader',
        footer: 'PageFooter',
        coverPage: 'MinimalCover',
        tableOfContents: 'TableOfContents'
      },
      styles: ['print-master.css', 'premium.css']
    });
  }
  
  private registerSpecializedTemplates() {
    // Skills Analysis — Landscape, chart-heavy
    this.register({
      id: 'skills-analysis-premium',
      reportTypes: ['skills_analysis'],
      baseTemplate: 'base-premium',
      layout: {
        orientation: 'landscape',
        columns: 2,
        chartGrid: '2x2' // 2x2 chart grid per page
      },
      components: {
        coverPage: 'DataCover',
        chartContainer: 'InteractiveChart',
        insightBox: 'InsightHighlight'
      },
      styles: ['data-heavy.css']
    });
    
    // KIT Audit — Portrait, compliance badges
    this.register({
      id: 'kit-audit-premium',
      reportTypes: ['kit_audit'],
      baseTemplate: 'base-premium',
      layout: {
        orientation: 'portrait',
        columns: 1,
        density: 'medium'
      },
      components: {
        coverPage: 'ComplianceCover',
        severityBadge: 'SeverityIndicator',
        checklistTable: 'ComplianceTable',
        findingCard: 'FindingEvidence'
      },
      styles: ['compliance.css']
    });
    
    // JD Analysis — Portrait, structured text
    this.register({
      id: 'jd-analysis-premium',
      reportTypes: ['jd_analysis'],
      baseTemplate: 'base-premium',
      layout: {
        orientation: 'portrait',
        columns: 1,
        density: 'medium'
      },
      components: {
        coverPage: 'ProfessionalCover',
        requirementList: 'CategorizedRequirements',
        comparisonTable: 'BenchmarkTable'
      },
      styles: ['professional.css']
    });
    
    // Candidate Evaluation — Portrait, premium whitespace
    this.register({
      id: 'candidate-eval-premium',
      reportTypes: ['candidate_evaluation'],
      baseTemplate: 'base-premium',
      layout: {
        orientation: 'portrait',
        columns: 2, // Profile left, evaluation right
        density: 'low', // Premium feel
        whitespace: 'generous'
      },
      components: {
        coverPage: 'ExecutiveCover',
        profileCard: 'CandidateProfile',
        rubricTable: 'EvaluationRubric',
        verdictBox: 'VerdictHighlight'
      },
      styles: ['executive.css']
    });
  }
  
  getTemplateForReport(reportType: string): TemplateDefinition {
    // Find most specific template
    let bestMatch: TemplateDefinition | null = null;
    
    for (const [id, template] of this.templates) {
      if (template.reportTypes.includes(reportType)) {
        bestMatch = template;
        break;
      }
    }
    
    if (!bestMatch) {
      bestMatch = this.templates.get('base-premium')!;
    }
    
    if (bestMatch.baseTemplate) {
      return this.mergeWithParent(bestMatch);
    }
    
    return bestMatch;
  }
  
  private mergeWithParent(template: TemplateDefinition): TemplateDefinition {
    const parent = this.templates.get(template.baseTemplate!);
    if (!parent) return template;
    
    const merged = {
      ...parent,
      ...template,
      layout: { ...parent.layout, ...template.layout },
      components: { ...parent.components, ...template.components },
      styles: Array.from(new Set([...(parent.styles || []), ...(template.styles || [])]))
    };
    
    if (parent.baseTemplate) {
      return this.mergeWithParent(merged as TemplateDefinition);
    }
    
    return merged as TemplateDefinition;
  }
}
