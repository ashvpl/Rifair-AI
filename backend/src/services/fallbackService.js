/**
 * Fallback Generator Service
 * Provides rule-based content when AI fails or validation rejects AI output.
 */
const { generateInterviewKit } = require("./fallback");
// Use the real deterministic engine for fallback analysis — NOT zeros.
const { analyzeDeterministally } = require("./deterministicEngine");

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
 * Now dynamically injects role context to avoid "fixed" appearance.
 */
function getFallbackKit(role = "", experience = "mid") {
  const normalizedRole = role.toLowerCase().trim();
  
  // 1. DATASET FUZZY/SEARCH MATCH
  try {
    const datasetMatch = generateInterviewKit(role, experience);
    if (datasetMatch && datasetMatch.categories) {
       let allQuestions = [];
       
       // Handle both categorized and search-grounded patterns
       for (const [cat, qs] of Object.entries(datasetMatch.categories)) {
          if (Array.isArray(qs)) {
            // Inject context into generic-looking grounded questions
            const contextualized = qs.map(q => {
               if (q.length < 50) return `${q} (Specifically in the context of being a ${role})`;
               return q;
            });
            allQuestions.push(...contextualized);
          }
       }
       
       const uniqueQuestions = Array.from(new Set(allQuestions)).slice(0, 7);
       
       if (uniqueQuestions.length >= 3) {
         return {
           role_summary: { 
             domain: datasetMatch.role || role, 
             skills: ["Dataset-backed Competency", "Domain Knowledge"], 
             responsibilities: [`Execute role-specific tasks as a ${role}`] 
           },
           questions: uniqueQuestions,
           rubric: DEFAULT_KIT.rubric,
           source: "dataset_grounded_search"
         };
       }
    }
  } catch (e) {
    console.warn("Dataset fallback failed:", e.message);
  }

  // 2. CURATED TEMPLATES
  for (const [key, kit] of Object.entries(FALLBACK_KITS)) {
    if (normalizedRole.includes(key)) return kit;
  }

  // 3. PURE DATA SYNTHESIS (No fixed templates)
  // If search grounded questions were found, they are already returned above.
  // If even that failed, we construct a "Conceptual Competency Kit"
  const concepts = [
    `Technical decision-making in ${role} environments`,
    `Handling failure or performance bottlenecks as a ${role}`,
    `Cross-functional collaboration challenges specific to ${role} work`,
    `The evolution of ${role} tools and methodologies over the next 3 years`,
    `Upholding high standards for quality/safety in ${role} deliverables`
  ];

  return {
    role_summary: {
      domain: role,
      skills: ["Situational Analysis", "Role Adaptation", "Expert Execution"],
      responsibilities: [`Drive excellence in ${role} operations`]
    },
    questions: concepts.map(c => `Explain your specific methodology regarding: ${c}. Give a recent example.`),
    rubric: DEFAULT_KIT.rubric,
    source: "autonomous_conceptual_fallback"
  };
}

/**
 * Generates fallback bias analysis results using the deterministic engine.
 * This is called when ALL AI providers are exhausted. It is NOT lenient —
 * every question still goes through the full Tier-0/1/2 keyword analysis.
 */
function getFallbackAnalysis(text = "") {
  const rawSentences = text.split(/[?!]|\n+/)
    .map(s => s.replace(/^\d+[.)]\s*/, "").trim())
    .filter(s => s.length > 10);

  if (rawSentences.length === 0) {
    return {
      overall_bias_score: 0,
      risk_level: "low",
      summary: "No processable questions found in fallback mode.",
      top_insights: [],
      questions: [],
      is_fallback: true,
    };
  }

  const analyzed = rawSentences.map(sentence => {
    const det = analyzeDeterministally(sentence);
    return {
      original:          sentence,
      bias_score:        det.bias_score,
      bias_level:        det.bias_score >= 65 ? "HIGH" : det.bias_score >= 35 ? "MEDIUM" : "LOW",
      bias_types:        det.bias_types,
      explanation:       det.explanation,
      improved_question: det.improved_question,
      improved_score:    det.bias_score > 0 ? 5 : 0,
      highlighted:       sentence,
      source:            "rule_based_fallback",
      detectionMethod:   "fallback",
      flags:             det.bias_types.map(t => ({
        category: t,
        severity: det.bias_score >= 65 ? "high" : det.bias_score >= 35 ? "medium" : "low",
      })),
    };
  });

  const biasedCount = analyzed.filter(q => q.bias_score > 30).length;
  const rawAvg = analyzed.reduce((sum, q) => sum + q.bias_score, 0) / analyzed.length;
  let overallBiasScore = Math.round(rawAvg);
  if (biasedCount >= 5) overallBiasScore = Math.max(overallBiasScore, 75);
  overallBiasScore = Math.min(100, overallBiasScore);

  // Re-align per-question verdicts if overall is severe
  const overallSevere = overallBiasScore >= 75;
  const consistentQuestions = analyzed.map(q => ({
    ...q,
    bias_level: (overallSevere && q.bias_score > 15 && q.bias_level === "LOW") ? "MEDIUM" : q.bias_level,
  }));

  return {
    overall_bias_score: overallBiasScore,
    risk_level: overallBiasScore >= 75 ? "high" : overallBiasScore > 30 ? "medium" : "low",
    summary:
      biasedCount === 0
        ? "Standard linguistic check complete. No critical bias terms detected."
        : `Fallback engine flagged ${biasedCount} of ${analyzed.length} question(s) with potential bias terms.`,
    top_insights: biasedCount > 0
      ? ["Critical bias terminology detected via rule-based engine.", "AI validation unavailable — results are keyword-driven."]
      : ["No critical bias keywords found.", "Consider AI validation for nuanced tone analysis."],
    questions: consistentQuestions,
    is_fallback: true,
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
