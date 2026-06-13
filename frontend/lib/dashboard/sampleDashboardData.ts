export interface WorkflowStage {
  id: number;
  stepNumber: number;
  title: string;
  label: string;
  description: string;
  iconName: string;
}

export interface CandidateScorecard {
  id: number;
  name: string;
  stage: string;
  overallScore: number;
  roleSkills: number;
  communication: number;
  problemSolving: number; // or cultureFit
  biasReview: "Passed" | "Needs Review";
  status: "Top Candidate" | "Strong Match" | "Good Match" | "Consider" | "Needs Review";
}

export interface PerformanceStats {
  score: number;
  structuredPercent: number;
  lowRiskPercent: number;
  underReviewPercent: number;
}

export interface KeyMetricItem {
  name: string;
  value: string;
  subtext: string;
}

export interface RecentActivityItem {
  id: number;
  title: string;
  subtitle: string;
  time: string;
  iconType: "workflow" | "shield" | "document";
}

export const sampleWorkflowStages: WorkflowStage[] = [
  {
    id: 1,
    stepNumber: 1,
    title: "Role Requirement",
    label: "Role Input",
    description: "Define role, seniority, skills, and hiring focus",
    iconName: "FileText"
  },
  {
    id: 2,
    stepNumber: 2,
    title: "JD Optimization",
    label: "AI JD",
    description: "Structure responsibilities and requirements",
    iconName: "FileSearch"
  },
  {
    id: 3,
    stepNumber: 3,
    title: "Interview Kit",
    label: "Questions",
    description: "Generate role-specific interview questions",
    iconName: "MessageSquare"
  },
  {
    id: 4,
    stepNumber: 4,
    title: "Candidate Scorecard",
    label: "Scorecard",
    description: "Create weighted evaluation criteria",
    iconName: "BarChart3"
  },
  {
    id: 5,
    stepNumber: 5,
    title: "Bias-Aware Review",
    label: "Review",
    description: "Flag vague or unfair evaluation areas",
    iconName: "ShieldCheck"
  },
  {
    id: 6,
    stepNumber: 6,
    title: "Evaluation Guide",
    label: "Guide",
    description: "Help interviewers evaluate consistently",
    iconName: "BookOpen"
  }
];

export const sampleCandidateScorecards: CandidateScorecard[] = [
  {
    id: 1,
    name: "Sarah Mitchell",
    stage: "Interview Kit",
    overallScore: 92,
    roleSkills: 95,
    communication: 90,
    problemSolving: 88,
    biasReview: "Passed",
    status: "Top Candidate"
  },
  {
    id: 2,
    name: "James Developer",
    stage: "Scorecard Review",
    overallScore: 85,
    roleSkills: 88,
    communication: 82,
    problemSolving: 85,
    biasReview: "Passed",
    status: "Strong Match"
  },
  {
    id: 3,
    name: "Emily Watson",
    stage: "Team Interview",
    overallScore: 78,
    roleSkills: 80,
    communication: 75,
    problemSolving: 80,
    biasReview: "Passed",
    status: "Good Match"
  },
  {
    id: 4,
    name: "Michael Lee",
    stage: "Evaluation Guide",
    overallScore: 71,
    roleSkills: 75,
    communication: 70,
    problemSolving: 68,
    biasReview: "Passed",
    status: "Consider"
  },
  {
    id: 5,
    name: "Robert Johnson",
    stage: "Initial Review",
    overallScore: 65,
    roleSkills: 70,
    communication: 60,
    problemSolving: 65,
    biasReview: "Needs Review",
    status: "Consider"
  }
];

export const samplePerformanceStats: PerformanceStats = {
  score: 85,
  structuredPercent: 85,
  lowRiskPercent: 10,
  underReviewPercent: 5
};

export const sampleKeyMetrics: KeyMetricItem[] = [
  {
    name: "Total Workflows",
    value: "24",
    subtext: "vs last month"
  },
  {
    name: "Avg. Time to Workflow",
    value: "4 min",
    subtext: "estimated creation time"
  },
  {
    name: "Scorecard Coverage",
    value: "87%",
    subtext: "workflows with scorecards"
  },
  {
    name: "Bias Review Rate",
    value: "98.2%",
    subtext: "workflows reviewed"
  }
];

export const sampleRecentActivity: RecentActivityItem[] = [
  {
    id: 1,
    title: "New workflow created",
    subtitle: "Senior Frontend Engineer",
    time: "2h ago",
    iconType: "workflow"
  },
  {
    id: 2,
    title: "Bias-aware review completed",
    subtitle: "Marketing Manager Role",
    time: "4h ago",
    iconType: "shield"
  },
  {
    id: 3,
    title: "Scorecard generated",
    subtitle: "Data Analyst Role",
    time: "6h ago",
    iconType: "document"
  }
];
