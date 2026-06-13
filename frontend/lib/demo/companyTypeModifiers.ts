export interface CompanyTypeModifier {
  label: string;
  environmentDescription: string;
  responsibilitiesAdjustment: string[];
  weightAdjustments: Record<string, number>;
  extraRedFlags: string[];
  extraPositiveSignals: string[];
}

export const COMPANY_TYPE_MODIFIERS: Record<string, CompanyTypeModifier> = {
  "startup": {
    label: "Startup",
    environmentDescription: "a fast-moving, high-growth startup environment where adaptability, rapid iteration, and cross-functional ownership are critical.",
    responsibilitiesAdjustment: [
      "Navigate ambiguous, rapidly shifting priorities to ship customer value quickly.",
      "Work cross-functionally across design, sales, or product as resources dictate.",
      "Take absolute end-to-end ownership of projects with minimal structural support.",
      "Balance development speed with technical or operational quality pragmatically."
    ],
    weightAdjustments: {
      "Ownership": 15,
      "Execution": 10,
      "Execution Discipline": 10,
      "Problem Solving": 5,
      "Process Discipline": -10,
      "Stakeholder Management": -10
    },
    extraRedFlags: [
      "Requires fully defined processes and specifications before starting any task",
      "Struggles to adapt when business or product priorities change rapidly",
      "Executes slowly due to over-analyzing decisions"
    ],
    extraPositiveSignals: [
      "Thrives in high-ambiguity environments and takes charge of outcomes",
      "Ships practical solutions quickly without waiting for perfect guidelines",
      "Enjoys working across multiple functional tasks to help the team succeed"
    ]
  },
  "smb": {
    label: "SMB",
    environmentDescription: "a growing mid-market business focusing on process reliability, sustainable improvement, and collaborative execution.",
    responsibilitiesAdjustment: [
      "Build repeatable processes that stabilize operations and product delivery.",
      "Balance structured requirements with execution flexibility daily.",
      "Coordinate with cross-team stakeholders to keep project delivery aligned.",
      "Analyze metrics to drive incremental improvements in day-to-day execution."
    ],
    weightAdjustments: {
      "Process Discipline": 5,
      "Communication": 5,
      "Communication & Collaboration": 5,
      "Execution Discipline": 5
    },
    extraRedFlags: [
      "Struggles to work within practical budget or resource constraints",
      "Creates poor documentation that fails to help the wider team",
      "Shows inconsistent follow-through on commitments"
    ],
    extraPositiveSignals: [
      "Balances structured planning with pragmatic execution rules",
      "Creates clear documentation to build repeatable processes",
      "Follows through on commitments consistently"
    ]
  },
  "enterprise": {
    label: "Enterprise",
    environmentDescription: "a large-scale corporate organization requiring strong stakeholder alignment, clear documentation, and strict adherence to security and compliance standards.",
    responsibilitiesAdjustment: [
      "Coordinate project deliverables across multiple cross-functional stakeholder groups.",
      "Document architectural or operational decisions clearly for peer reviews.",
      "Follow security, compliance, quality assurance, and governance frameworks.",
      "Manage expectations and build consensus with partners across business divisions."
    ],
    weightAdjustments: {
      "Stakeholder Management": 15,
      "Communication": 10,
      "Communication & Collaboration": 10,
      "Process Discipline": 10,
      "Ownership": -5,
      "Technical Skills": -5,
      "Frontend Technical Skills": -5,
      "Backend Technical Skills": -5
    },
    extraRedFlags: [
      "Fails to document design choices or document compliance requirements",
      "Ignores established organizational processes, security rules, or coding guidelines",
      "Struggles to coordinate or build alignment with non-technical stakeholders"
    ],
    extraPositiveSignals: [
      "Writes high-quality, comprehensive design documents and guides",
      "Coordinates large, cross-functional alignments smoothly",
      "Proactively adheres to enterprise security and compliance standards"
    ]
  }
};
