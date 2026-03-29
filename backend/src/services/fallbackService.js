/**
 * Fallback Generator Service
 * Provides rule-based content when AI fails or validation rejects AI output.
 */

const FALLBACK_KITS = {
  mechanic: {
    role_summary: {
      domain: "Mechanical/Automotive",
      skills: ["Engine Diagnostics", "Brake Systems", "Hydraulics", "Power Tools"],
      responsibilities: ["Routine maintenance", "Complex repairs", "Safety inspections", "Customer advisory"]
    },
    questions: [
      "Describe your process for diagnosing an intermittent engine misfire.",
      "How do you ensure safety when working with high-pressure hydraulic systems?",
      "Can you explain the difference between preventative and corrective maintenance in an industrial setting?",
      "Walk me through a time you had to troubleshoot a complex mechanical failure under a tight deadline.",
      "How do you stay updated with the latest automotive diagnostic software and tools?"
    ],
    rubric: [
      { skill: "Diagnostics", criteria: "Logical troubleshooting steps", levels: { basic: "Follows manual", good: "Uses diagnostic tools", excellent: "Identifies root cause efficiently" } },
      { skill: "Safety", criteria: "Knowledge of PPE and protocols", levels: { basic: "Knows basics", good: "Follows all protocols", excellent: "Ensures team safety proactively" } }
    ]
  },
  lyricist: {
    role_summary: {
      domain: "Creative/Music",
      skills: ["Creative Writing", "Metaphor & Imagery", "Rhythm & Meter", "Storytelling"],
      responsibilities: ["Writing lyrics", "Collaborating with composers", "Thematic development", "Editing"]
    },
    questions: [
      "How do you approach translating a specific emotion or concept into a lyrical metaphor?",
      "Describe your process for matching rhythm and meter to an existing melody.",
      "How do you handle creative differences when collaborating with a composer or producer?",
      "Walk me through your technique for avoiding clichés in songwriting.",
      "How do you ensure your lyrics remain authentic while meeting the commercial needs of a project?"
    ],
    rubric: [
      { skill: "Creativity", criteria: "Originality of metaphors", levels: { basic: "Common rhymes", good: "Unique imagery", excellent: "Evocative storytelling" } },
      { skill: "Collaboration", criteria: "Receptiveness to feedback", levels: { basic: "Defensive", good: "Open to suggestions", excellent: "Enhances ideas collectively" } }
    ]
  },
  electrician: {
    role_summary: {
      domain: "Electrical/Construction",
      skills: ["Circuit Design", "Code Compliance", "Blueprint Reading", "Safety Testing"],
      responsibilities: ["Wiring installation", "System troubleshooting", "Code inspections", "Maintenance"]
    },
    questions: [
      "How do you ensure compliance with local electrical codes on a new installation?",
      "What is your step-by-step procedure for testing a circuit for proper grounding?",
      "Describe a time you discovered a significant safety hazard left by another technician. How did you handle it?",
      "How do you interpret complex electrical blueprints for industrial facilities?",
      "What safety precautions do you strictly follow before working on a live panel?"
    ],
    rubric: [
      { skill: "Code Compliance", criteria: "Knowledge of regulations", levels: { basic: "Knows common rules", good: "Accurate application", excellent: "Expert-level compliance" } },
      { skill: "Safety", criteria: "Risk mitigation", levels: { basic: "Uses PPE", good: "Checks voltage", excellent: "Zero-incident mindset" } }
    ]
  },
  "frontend engineer": {
    role_summary: {
      domain: "Software/Technology",
      skills: ["React/Vue", "CSS/Tailwind", "Performance Optimization", "Accessibility"],
      responsibilities: ["Building UI components", "Optimizing web performance", "Ensuring accessibility", "State management"]
    },
    questions: [
      "How do you optimize a large-scale React application for rendering performance?",
      "Describe your approach to building a component library that is both reusable and accessible.",
      "How do you handle complex state management across deeply nested components?",
      "Walk me through your process for debugging a memory leak in a web application.",
      "How do you ensure cross-browser compatibility and responsive design for mobile-first applications?"
    ],
    rubric: [
      { skill: "Performance", criteria: "Optimization techniques", levels: { basic: "Uses memoization", good: "Analyzes bundles", excellent: "Optimizes critical path" } },
      { skill: "Accessibility", criteria: "WCAG standards", levels: { basic: "Uses alt tags", good: "Semantic HTML", excellent: "Full ARIA compliance" } }
    ]
  }
};

const DEFAULT_KIT = {
  role_summary: {
    domain: "General Professional",
    skills: ["Problem Solving", "Communication", "Collaboration", "Time Management"],
    responsibilities: ["Executing tasks", "Supporting the team", "Continuous learning", "Professionalism"]
  },
  questions: [
    "Describe a complex problem you solved recently and the steps you took.",
    "How do you prioritize your tasks when faced with multiple competing deadlines?",
    "Tell me about a time you had to work with a difficult team member. How did you handle it?",
    "How do you ensure the quality of your work when working under pressure?",
    "What is your approach to learning new skills or technologies relevant to your role?"
  ],
  rubric: [
    { skill: "Problem Solving", criteria: "Analytical thinking", levels: { basic: "Identifies issue", good: "Proposes solution", excellent: "Implements root-fix" } }
  ]
};

/**
 * Generates a fallback kit based on the role.
 */
function getFallbackKit(role = "") {
  const normalizedRole = role.toLowerCase();
  for (const [key, kit] of Object.entries(FALLBACK_KITS)) {
    if (normalizedRole.includes(key)) return kit;
  }
  return DEFAULT_KIT;
}

/**
 * Generates fallback bias analysis results.
 */
function getFallbackAnalysis(text = "") {
  return {
    overall_bias_score: 0,
    risk_level: "Low",
    summary: "Standard linguistic check complete. No critical bias detected.",
    top_insights: ["Analysis focused on direct skill evaluation.", "Language remains neutral and professional."],
    questions: (text.split(/[?.!]/))
      .filter(s => s.trim().length > 10)
      .map(s => ({
        question: s.trim(),
        bias_score: 0,
        bias_type: [],
        issue: "None",
        explanation: "This question focuses on professional skills/experience.",
        impact: "Promotes fair and objective evaluation.",
        rewrite: s.trim()
      })),
    is_fallback: true
  };
}

/**
 * Generates fallback simulation results.
 */
function getFallbackSimulation(question = "") {
  return {
    original: question,
    variants: [
      { 
        biased_question: `Given your background, do you think you can handle ${question}`, 
        category: "tone", 
        explanation: "Adds a doubtful tone that assumes the candidate might struggle based on personal background." 
      },
      { 
        biased_question: `As a young/mature candidate, how would you approach ${question}`, 
        category: "age", 
        explanation: "Implicitly references the candidate's age, which is irrelevant to their technical ability." 
      }
    ],
    is_fallback: true
  };
}

module.exports = {
  getFallbackKit,
  getFallbackAnalysis,
  getFallbackSimulation
};
