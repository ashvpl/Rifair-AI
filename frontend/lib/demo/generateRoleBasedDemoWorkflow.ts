import {
  DemoWorkflowInput,
  DemoWorkflowOutput,
  DemoInterviewQuestion,
  DemoScorecardCriterion,
  DemoBiasReviewItem,
  BiasRiskLevel
} from "@/types/demo";
import { ROLE_TEMPLATES } from "./roleTemplates";
import { SENIORITY_MODIFIERS } from "./seniorityModifiers";
import { COMPANY_TYPE_MODIFIERS } from "./companyTypeModifiers";
import { HIRING_FOCUS_MODIFIERS } from "./hiringFocusModifiers";

/**
 * Normalizes scorecard weights to total exactly 100%.
 * Constraints:
 * - No criterion should go below 5%.
 * - No criterion should exceed 45%.
 * - Avoid decimals (Math.round).
 * - Adjust highest-weight criterion if off-by-one due to rounding.
 */
function normalizeWeights(criteria: DemoScorecardCriterion[]): DemoScorecardCriterion[] {
  if (criteria.length === 0) return criteria;

  // First pass: round and clamp between 5 and 45
  let currentCriteria = criteria.map(c => {
    let w = Math.round(c.weight);
    if (w < 5) w = 5;
    if (w > 45) w = 45;
    return { ...c, weight: w };
  });

  // Re-check sum
  let sum = currentCriteria.reduce((acc, c) => acc + c.weight, 0);
  let diff = 100 - sum;

  if (diff !== 0) {
    // Find the highest weight criterion to adjust
    let highestIdx = 0;
    let highestVal = -1;
    for (let i = 0; i < currentCriteria.length; i++) {
      if (currentCriteria[i].weight > highestVal) {
        highestVal = currentCriteria[i].weight;
        highestIdx = i;
      }
    }
    
    // Try to adjust the highest one
    const adjustedVal = currentCriteria[highestIdx].weight + diff;
    if (adjustedVal >= 5 && adjustedVal <= 45) {
      currentCriteria[highestIdx].weight = adjustedVal;
    } else {
      // If highest exceeds limits, distribute diff to first one that can accept it
      for (let i = 0; i < currentCriteria.length; i++) {
        const newVal = currentCriteria[i].weight + diff;
        if (newVal >= 5 && newVal <= 45) {
          currentCriteria[i].weight = newVal;
          break;
        }
      }
    }
  }

  return currentCriteria;
}

export function generateRoleBasedDemoWorkflow(input: DemoWorkflowInput): DemoWorkflowOutput {
  const roleKey = input.role || "frontend-developer";
  const seniorityKey = input.seniority || "mid-level";
  const companyKey = input.companyType || "startup";
  const hiringFocus = input.hiringFocus || [];

  // 1. Fallback gracefully if unknown values are supplied
  const baseTemplate = ROLE_TEMPLATES[roleKey] || ROLE_TEMPLATES["frontend-developer"];
  const seniorityMod = SENIORITY_MODIFIERS[seniorityKey] || SENIORITY_MODIFIERS["mid-level"];
  const companyMod = COMPANY_TYPE_MODIFIERS[companyKey] || COMPANY_TYPE_MODIFIERS["startup"];

  // Display labels
  const roleLabel = baseTemplate.roleLabel;
  const seniorityLabel = seniorityMod.label;
  const companyTypeLabel = companyMod.label;

  // 2. Compose Job Description
  const title = `${seniorityLabel} ${roleLabel}`;
  let roleSummary = `A ${seniorityLabel} ${roleLabel} who ${seniorityMod.summaryAdjective} within ${companyMod.environmentDescription} You will be ${baseTemplate.baseRoleSummary}`;
  
  if (input.optionalContext?.trim()) {
    const cleanContext = input.optionalContext.trim().replace(/[<>]/g, "");
    roleSummary += ` (Focus area: ${cleanContext})`;
  }

  // Combine responsibilities (first 3 base, plus 1 seniority, plus 1 company)
  const responsibilities = [
    ...baseTemplate.coreResponsibilities.slice(0, 3),
    seniorityMod.responsibilitiesAdjustment[0] || "Execute daily role-related deliverables.",
    companyMod.responsibilitiesAdjustment[0] || "Support team targets in our organization."
  ].slice(0, 5); // Limit to 5

  const requiredSkills = baseTemplate.requiredSkills.slice(0, 5);
  const niceToHaveSkills = baseTemplate.niceToHaveSkills.slice(0, 3);
  const successMetrics = baseTemplate.successMetrics.slice(0, 4);

  // 3. Compose Scorecard Criteria
  // Modify weights and titles based on seniority, company, and hiring focus
  let scorecardCriteria: DemoScorecardCriterion[] = baseTemplate.scorecardCriteria.map(criterion => {
    let weight = criterion.weight;
    let name = criterion.name;

    // Apply seniority weight changes
    if (seniorityMod.weightAdjustments[name] !== undefined) {
      weight += seniorityMod.weightAdjustments[name];
    }

    // Apply company type weight changes
    if (companyMod.weightAdjustments[name] !== undefined) {
      weight += companyMod.weightAdjustments[name];
    }

    // Apply hiring focus weight changes
    hiringFocus.forEach(focusKey => {
      const focusMod = HIRING_FOCUS_MODIFIERS[focusKey];
      if (focusMod && focusMod.criteriaKeys.includes(name)) {
        weight += focusMod.weightBoost;
      }
    });

    // Seniority specific scorecard adaptations
    if (name === "Leadership") {
      if (seniorityKey === "junior") {
        name = "Collaboration Potential";
      }
    }

    // Culture Add reframing (never use "culture fit")
    if (name === "Culture Add") {
      name = "Culture Add & Collaboration";
    }

    // Merge standard signals with seniority/company specific ones
    const positiveSignals = [
      ...criterion.positiveSignals,
      ...seniorityMod.extraPositiveSignals.slice(0, 1),
      ...companyMod.extraPositiveSignals.slice(0, 1)
    ];

    const concernSignals = [
      ...criterion.concernSignals,
      ...seniorityMod.extraRedFlags.slice(0, 1),
      ...companyMod.extraRedFlags.slice(0, 1)
    ];

    return {
      name,
      weight,
      description: criterion.description,
      positiveSignals,
      concernSignals,
      scoringGuidance: criterion.scoringGuidance
    };
  });

  // Normalize scorecard criteria weights
  scorecardCriteria = normalizeWeights(scorecardCriteria);

  // 4. Compose Interview Kit Questions
  // Prioritize questions whose competency matches selected hiring focuses
  let questions: DemoInterviewQuestion[] = baseTemplate.interviewQuestions.map(q => {
    // Merge general red flags/positive signals with seniority/company type specific ones
    const strongAnswerSignals = [
      ...q.strongAnswerSignals,
      ...seniorityMod.extraPositiveSignals.slice(0, 1)
    ];

    const redFlags = [
      ...q.redFlags,
      ...seniorityMod.extraRedFlags.slice(0, 1),
      ...companyMod.extraRedFlags.slice(0, 1)
    ];

    return {
      ...q,
      strongAnswerSignals,
      redFlags
    };
  });

  // Sort questions: if competency is boosted by selected focus, move it up
  const boostedCompetencies = new Set<string>();
  hiringFocus.forEach(focusKey => {
    const focusMod = HIRING_FOCUS_MODIFIERS[focusKey];
    if (focusMod) {
      focusMod.competencies.forEach(comp => boostedCompetencies.add(comp));
    }
  });

  questions.sort((a, b) => {
    const aBoost = boostedCompetencies.has(a.competency) ? 1 : 0;
    const bBoost = boostedCompetencies.has(b.competency) ? 1 : 0;
    return bBoost - aBoost; // descending
  });

  // Limit questions to 5-6
  const activeQuestions = questions.slice(0, 6);

  // Interview Kit Structure
  const interviewStructure = [
    "Introduction & Outline (5 mins)",
    "Deep-dive into competencies & role-specific questions (30 mins)",
    "Behavioral, collaboration & values-add alignment (15 mins)",
    "Candidate Q&A & next steps (10 mins)"
  ];

  // 5. Compose Bias Review
  const biasReviewItems: DemoBiasReviewItem[] = baseTemplate.biasRisks.map(r => ({
    area: r.area,
    risk: r.risk,
    issue: r.issue,
    saferAlternative: r.saferAlternative
  }));

  // Determine overall risk
  let overallRisk: BiasRiskLevel = "Low";
  if (biasReviewItems.some(item => item.risk === "High")) {
    overallRisk = "High";
  } else if (biasReviewItems.some(item => item.risk === "Medium")) {
    overallRisk = "Medium";
  }

  const biasGeneralGuidelines = [
    "Ask every candidate the same core structured questions in the same order.",
    "Evaluate candidate scorecards individually before sharing feedback in debrief panels.",
    "Focus evaluations strictly on competency evidence rather than subjective personal alignment."
  ];

  // 6. Locked features list
  const lockedFeatures = [
    "Save this workflow to your dashboard",
    "Generate a fully customized AI workflow from your exact JD",
    "Export interview kits and scorecards",
    "Evaluate real candidates with structured notes",
    "Compare candidates side-by-side",
    "Reuse workflows across hiring rounds"
  ];

  return {
    metadata: {
      roleLabel,
      seniorityLabel,
      companyTypeLabel,
      previewNotice: "This is a curated role-based preview. Sign up to generate a fully customized AI workflow for your exact JD."
    },
    optimizedJD: {
      title,
      roleSummary,
      responsibilities,
      requiredSkills,
      niceToHaveSkills,
      successMetrics
    },
    interviewKit: {
      structure: interviewStructure,
      questions: activeQuestions
    },
    scorecard: {
      criteria: scorecardCriteria,
      totalWeight: 100,
      recommendationScale: ["Strong No Hire", "No Hire", "Neutral", "Hire", "Strong Hire"]
    },
    biasReview: {
      overallRisk,
      items: biasReviewItems,
      generalGuidelines: biasGeneralGuidelines
    },
    evaluationGuide: {
      beforeInterview: baseTemplate.evaluationGuide.beforeInterview,
      duringInterview: baseTemplate.evaluationGuide.duringInterview,
      afterInterview: baseTemplate.evaluationGuide.afterInterview,
      decisionGuidance: baseTemplate.evaluationGuide.decisionGuidance
    },
    lockedFeatures
  };
}
