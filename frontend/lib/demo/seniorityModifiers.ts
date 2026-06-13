export interface SeniorityModifier {
  label: string;
  summaryAdjective: string;
  summaryVerb: string;
  responsibilitiesAdjustment: string[];
  weightAdjustments: Record<string, number>; // Adjustments to criteria weights
  extraRedFlags: string[];
  extraPositiveSignals: string[];
}

export const SENIORITY_MODIFIERS: Record<string, SeniorityModifier> = {
  "junior": {
    label: "Junior",
    summaryAdjective: "works with guidance to execute defined tasks, focusing on mastering core fundamentals and participating in team workflows.",
    summaryVerb: "works with guidance",
    responsibilitiesAdjustment: [
      "Assist in building and testing scoped features under senior supervision.",
      "Learn codebase conventions and modern engineering/sales best practices.",
      "Participate actively in code/work reviews and team planning sessions.",
      "Troubleshoot simple bugs or address direct customer queries with guidance.",
      "Document scoped tasks and outcomes for review by senior team members."
    ],
    weightAdjustments: {
      "Technical Skills": 15,
      "Frontend Technical Skills": 15,
      "Backend Technical Skills": 15,
      "Sourcing & Screening": 10,
      "SQL/Data Skills": 10,
      "Campaign Execution": 10,
      "Problem Solving": 5,
      "Ownership": -10,
      "Leadership": -15,
      "Stakeholder Management": -10,
      "Process Discipline": -5
    },
    extraRedFlags: [
      "Cannot explain core fundamentals of the field",
      "Avoids feedback and shows defensiveness during reviews",
      "Requires excessive handholding for previously documented tasks"
    ],
    extraPositiveSignals: [
      "Learns quickly and implements feedback immediately",
      "Asks clear, structured questions when blocked",
      "Demonstrates solid grasp of core fundamentals"
    ]
  },
  "mid-level": {
    label: "Mid-Level",
    summaryAdjective: "independently owns role-relevant work, handles moderate ambiguity, communicates tradeoffs, and improves execution quality.",
    summaryVerb: "independently owns role-relevant work",
    responsibilitiesAdjustment: [
      "Independently own and deliver features or operational workflows.",
      "Identify and solve ambiguous problems within the domain area.",
      "Communicate technical or process tradeoffs clearly to peers.",
      "Improve execution quality, performance, and standard workflows.",
      "Collaborate across immediate stakeholder groups to coordinate handoffs."
    ],
    weightAdjustments: {
      // Balanced, no major adjustments
    },
    extraRedFlags: [
      "Needs close supervision to complete standard deliverables",
      "Fails to communicate trade-offs when making decisions",
      "Delivers output without checking its quality or understanding business impact"
    ],
    extraPositiveSignals: [
      "Requires minimal oversight to deliver complex, defined tasks",
      "Consistently identifies performance bottlenecks or process gaps",
      "Explains trade-offs and alternative solutions clearly"
    ]
  },
  "senior": {
    label: "Senior",
    summaryAdjective: "leads complex initiatives, sets quality standards, mentors teammates, and makes scalable architectural or process decisions.",
    summaryVerb: "leads complex initiatives",
    responsibilitiesAdjustment: [
      "Lead complex initiatives from requirements analysis to final delivery.",
      "Set engineering or operational quality standards for the team.",
      "Mentor and guide junior team members to grow their capabilities.",
      "Make scalable architectural, database, or process design decisions.",
      "Collaborate with cross-functional leadership to align on team goals."
    ],
    weightAdjustments: {
      "Leadership": 20,
      "Stakeholder Management": 15,
      "System Design Thinking": 15,
      "Process Discipline": 10,
      "Ownership": 10,
      "Technical Skills": -10,
      "Frontend Technical Skills": -10,
      "Backend Technical Skills": -10,
      "SQL/Data Skills": -10,
      "Campaign Execution": -10,
      "Sourcing & Screening": -10
    },
    extraRedFlags: [
      "Cannot explain strategic tradeoffs or long-term operational risks",
      "Overfocuses on task-level execution without showing leadership or ownership",
      "Struggles with mentoring peers or aligning with cross-functional partners"
    ],
    extraPositiveSignals: [
      "Designs scalable architectures or processes that prevent future debt",
      "Actively mentors teammates and elevates overall group productivity",
      "Communicates strategic technical decisions to non-technical leaders easily"
    ]
  }
};
