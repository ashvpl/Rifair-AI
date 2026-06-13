import { HiringFocus } from "@/types/demo";

export interface HiringFocusConfig {
  criteriaKeys: string[]; // Scorecard criteria names that are boosted by this focus
  competencies: string[]; // Question competencies that are boosted by this focus
  weightBoost: number;
}

export const HIRING_FOCUS_MODIFIERS: Record<HiringFocus, HiringFocusConfig> = {
  "technical-skills": {
    criteriaKeys: ["Frontend Technical Skills", "Backend Technical Skills", "SQL/Data Skills", "Sourcing & Screening", "Technical Skills"],
    competencies: ["Technical Skills", "SQL/Data Skills", "Sourcing & Screening", "Campaign Execution", "Prospecting Ability"],
    weightBoost: 15
  },
  "problem-solving": {
    criteriaKeys: ["Problem Solving", "Accuracy & Judgment"],
    competencies: ["Problem Solving", "Accuracy & Judgment"],
    weightBoost: 15
  },
  "communication": {
    criteriaKeys: ["Communication", "Communication & Collaboration", "Insight Communication"],
    competencies: ["Communication", "Insight Communication", "Content & Messaging"],
    weightBoost: 15
  },
  "ownership": {
    criteriaKeys: ["Ownership", "Execution", "Execution Discipline"],
    competencies: ["Ownership", "Execution Discipline"],
    weightBoost: 15
  },
  "leadership": {
    criteriaKeys: ["Leadership", "Stakeholder Management"],
    competencies: ["Leadership", "Stakeholder Management"],
    weightBoost: 15
  },
  "culture-add": {
    criteriaKeys: ["Culture Add", "Culture Add & Collaboration", "Communication & Collaboration"],
    competencies: ["Communication", "Culture Add"],
    weightBoost: 15
  },
  "execution": {
    criteriaKeys: ["Execution", "Execution Discipline", "Process Discipline"],
    competencies: ["Execution", "Execution Discipline", "Process Discipline"],
    weightBoost: 15
  },
  "analytical-thinking": {
    criteriaKeys: ["Analytical Thinking", "Accuracy & Judgment", "Database Reasoning"],
    competencies: ["Analytical Thinking", "Accuracy & Judgment"],
    weightBoost: 15
  },
  "stakeholder-management": {
    criteriaKeys: ["Stakeholder Management", "Process Discipline"],
    competencies: ["Stakeholder Management", "Process Discipline"],
    weightBoost: 15
  }
};
