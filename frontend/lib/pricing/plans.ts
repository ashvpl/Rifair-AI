import type { Plan, PlanId } from './types'

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: {
      inr: { monthly: 0, annual: 0 },
      usd: { monthly: 0, annual: 0 },
    },
    analysesLimit: 10,
    kitLimit: 3,
    jdAnalysesLimit: 0,
    evaluationsLimit: 1,
    apiCallsLimit: 0,
    seatsLimit: 1,
    features: [
      'bias_score', 'kit_basic'
    ],
    ctaLabel: 'Get started free',
    ctaVariant: 'outline'
  },
  {
    id: 'lite',
    name: 'Lite',
    price: {
      inr: { monthly: 499, annual: 399 },
      usd: { monthly: 6, annual: 5 },
    },
    analysesLimit: 20,
    kitLimit: 10,
    jdAnalysesLimit: 0,
    evaluationsLimit: 3,
    apiCallsLimit: 0,
    seatsLimit: 1,
    features: [
      'bias_score', 'explanation', 'bias_trends',
      'kit_advanced', 'candidate_analysis', 'candidate_reports'
    ],
    ctaLabel: 'Get plan',
    ctaVariant: 'default'
  },
  {
    id: 'starter',
    name: 'Starter',
    price: {
      inr: { monthly: 999, annual: 799 },
      usd: { monthly: 12, annual: 10 },
    },
    analysesLimit: 40,
    kitLimit: 20,
    jdAnalysesLimit: 0,
    evaluationsLimit: 5,
    apiCallsLimit: 0,
    seatsLimit: 1,
    features: [
      'bias_score', 'explanation', 'bias_trends',
      'kit_advanced', 'candidate_analysis', 'candidate_reports'
    ],
    ctaLabel: 'Get plan',
    ctaVariant: 'default'
  },
  {
    id: 'growth',
    name: 'Growth',
    price: {
      inr: { monthly: 2999, annual: 2399 },
      usd: { monthly: 36, annual: 29 },
    },
    analysesLimit: 150,
    kitLimit: 50,
    jdAnalysesLimit: 20,
    evaluationsLimit: null,
    apiCallsLimit: 500,
    seatsLimit: 5,
    features: [
      'bias_score', 'explanation', 'bias_trends',
      'kit_advanced', 'candidate_analysis', 'candidate_reports',
      'india_full', 'batch', 'kit_unlimited',
      'dashboard_full', 'pdf_reports',
      'api_access', 'confidence_score'
    ],
    badge: 'Most popular',
    isFeatured: true,
    ctaLabel: 'Get plan',
    ctaVariant: 'primary'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: {
      inr: { monthly: 0, annual: 0 },
      usd: { monthly: 0, annual: 0 },
    },
    analysesLimit: null,
    kitLimit: null,
    jdAnalysesLimit: null,
    evaluationsLimit: null,
    apiCallsLimit: null,
    seatsLimit: null,
    features: [
      'everything', 'custom_model', 'compliance_reports',
      'sso', 'audit_logs', 'ats_integrations',
      'dedicated_csm', 'sla'
    ],
    ctaLabel: 'Contact Sales',
    ctaVariant: 'sales'
  },
  {
    id: 'internal_qa_plan',
    name: 'Internal QA Plan',
    price: {
      inr: { monthly: 1, annual: 1 },
      usd: { monthly: 1, annual: 1 },
    },
    analysesLimit: 5,
    kitLimit: 1,
    jdAnalysesLimit: 0,
    evaluationsLimit: 1,
    apiCallsLimit: 0,
    seatsLimit: 1,
    features: [
      'bias_score', 'kit_basic'
    ],
    internal: true,
    testPlan: true,
    qaOnly: true,
    ctaLabel: 'Test Payment ₹1',
    ctaVariant: 'primary'
  },
]

/** Feature gate map — which plans unlock each feature */
export const FEATURE_GATES: Record<string, PlanId[]> = {
  // ── Core ──
  bias_score:           ['free', 'starter', 'growth', 'enterprise'],
  category_label:       ['starter', 'growth', 'enterprise'],
  kit_basic:            ['free', 'starter', 'growth', 'enterprise'],
  explanation:          ['starter', 'growth', 'enterprise'],
  rewrite:              ['starter', 'growth', 'enterprise'],
  india_basic:          ['starter', 'growth', 'enterprise'],
  bias_trends:          ['starter', 'growth', 'enterprise'],
  kit_advanced:         ['starter', 'growth', 'enterprise'],
  candidate_analysis:   ['starter', 'growth', 'enterprise'],
  candidate_reports:    ['starter', 'growth', 'enterprise'],

  // ── Spectral Report — Free (visible, some blurred) ──
  spectral_score:       ['free', 'starter', 'growth', 'enterprise'],
  spectral_tags:        ['free', 'starter', 'growth', 'enterprise'],
  spectral_issue_line:  ['free', 'starter', 'growth', 'enterprise'],
  session_score:        ['free', 'starter', 'growth', 'enterprise'],
  blurred_rewrite:      ['free', 'starter', 'growth', 'enterprise'], // free sees it blurred

  // ── Spectral Report — Starter (₹999/mo) ──
  explanation_full:     ['starter', 'growth', 'enterprise'],
  rewrite_full:         ['starter', 'growth', 'enterprise'],
  law_violation:        ['starter', 'growth', 'enterprise'],
  competency_rescue:    ['starter', 'growth', 'enterprise'],
  india_bias_flags:     ['starter', 'growth', 'enterprise'],
  session_report:       ['starter', 'growth', 'enterprise'],

  // ── Spectral Report — Growth (₹2,999/mo) ──
  india_full:           ['growth', 'enterprise'],
  batch_analysis:       ['growth', 'enterprise'],
  batch:                ['growth', 'enterprise'],
  bias_dna:             ['growth', 'enterprise'],
  keyword_highlighter:  ['growth', 'enterprise'],
  jd_analyzer:          ['growth', 'enterprise'],
  bias_chat:            ['growth', 'enterprise'],
  kit_unlimited:        ['growth', 'enterprise'],
  dashboard_full:       ['growth', 'enterprise'],
  pdf_reports:          ['growth', 'enterprise'],
  api_access:           ['growth', 'enterprise'],
  confidence_score:     ['growth', 'enterprise'],

  // ── Enterprise ──
  compliance_reports:   ['enterprise'],
  sso:                  ['enterprise'],
  audit_logs:           ['enterprise'],
  ats_integrations:     ['enterprise'],
  custom_model:         ['enterprise'],
  dedicated_csm:        ['enterprise'],

  // ── Custom Evaluations (P0) ──
  custom_eval:          ['free', 'lite', 'starter', 'growth', 'enterprise'],
  custom_eval_rewrite:  ['starter', 'growth', 'enterprise'],
}

/** Human-readable display labels for features (used on pricing page) */
export const FEATURE_LABELS: Record<string, string> = {
  bias_score:         'Bias Score Analysis',
  category_label:     'Bias Category Labels',
  kit_basic:          'Basic Interview Kits',
  explanation:        'Detailed Bias Explanations',
  bias_trends:        'Detailed Bias Trend Analysis',
  kit_advanced:       'Advanced Interview Kit Generation',
  candidate_analysis: 'Advanced Candidate Evaluation & Hiring Recs',
  candidate_reports:  'Interview Analysis Report Export',
  india_full:         'Full India Compliance Suite',
  kit_unlimited:      'Unlimited Kit Generation',
  batch:              'Batch Analysis',
  dashboard_full:     'Full Analytics Dashboard',
  pdf_reports:        'PDF Report Export',
  api_access:         'REST API Access',
  confidence_score:   'Confidence Scoring',
  compliance_reports: 'Compliance Reports',
  sso:                'SSO / SAML Integration',
  audit_logs:         'Audit Logs',
  ats_integrations:   'ATS Integrations',
  custom_model:       'Custom AI Model',
  dedicated_csm:      'Dedicated CSM',
  sla:                'Enterprise SLA',
  everything:         'Everything in Growth',
}

/** Features to display per plan on the pricing page (ordered) */
export const PLAN_DISPLAY_FEATURES: Record<PlanId, string[]> = {
  free: [
    '5 analyses / month',
    '1 interview kit',
    '1 candidate evaluation',
    'Bias score analysis',
  ],
  lite: [
    '20 analyses / month',
    '10 interview kits',
    '3 candidate evaluations',
    'Everything in Free, plus:',
    'Detailed bias trend analysis',
    'Advanced interview kit generation',
    'Candidate evaluation & reporting',
  ],
  starter: [
    '40 analyses / month',
    '20 interview kits',
    '5 candidate evaluations',
    'Everything in Lite, plus:',
    'Detailed bias trend analysis',
    'Advanced interview kit generation',
    'Advanced candidate evaluation with hiring recommendations',
    'Candidate interview analysis report generation and export',
  ],
  growth: [
    '200 analyses / month',
    '80 interview kits',
    '20 candidate evaluations',
    '20 JD Ops (Gen + Audit) / month',
    'Everything in Starter, plus:',
    'Full India compliance',
    'Batch analysis',
    'Full analytics dashboard',
    'PDF report export',
    'REST API (500 calls/mo)',
    'Confidence scoring',
    '5 team seats',
  ],
  enterprise: [
    'Unlimited everything',
    'Everything in Growth, plus:',
    'Custom AI model training',
    'Compliance reports',
    'SSO / SAML',
    'Audit logs',
    'ATS integrations',
    'Dedicated CSM',
    'Enterprise SLA',
    'Unlimited seats',
  ],
  internal_qa_plan: [
    'Internal testing only',
    '₹1 production validation',
    'Real payment pipeline',
    'No premium credits',
  ],
  analyses_20: ['20 additional analyses'],
  kits_5: ['5 additional interview kits'],
  kits_15: ['15 additional interview kits'],
}
