/**
 * kitMasterPrompt.js
 *
 * Complete role-aware kit generation system.
 * Contains:
 *   - parseExperienceLevel()  — free-text → structured level config
 *   - getRoleConfig()         — role-specific intelligence, day-to-day, skills
 *   - getCompanyConfig()      — company-type context and hiring needs
 *   - buildKitPrompt()        — assembles the master prompt
 *   - validateKitQuality()    — post-generation quality gate for banned patterns
 */

"use strict";

// ─── Experience Level Parser ──────────────────────────────────────────────────

function parseExperienceLevel(experience) {
  const exp = (experience || "").toLowerCase();
  const years = parseInt((exp.match(/\d+/) || [])[0] || "3", 10);

  if (exp.includes("fresher") || exp.includes("0") || years === 0) {
    return {
      label: "Fresher / Entry Level",
      differentiator:
        "Learning speed, problem-solving approach, academic projects, internship quality, and intellectual curiosity. NOT past performance — they have none.",
      distribution: { behavioral: 2, technical: 4, situational: 3, leadership: 1 },
    };
  }
  if (years <= 2) {
    return {
      label: "Junior (0–2 years)",
      differentiator:
        "Quality of early work, ownership of small features, debugging ability, asking good questions, speed of learning from mistakes.",
      distribution: { behavioral: 3, technical: 4, situational: 2, leadership: 1 },
    };
  }
  if (years <= 5) {
    return {
      label: "Mid-Level (2–5 years)",
      differentiator:
        "Independent execution, driving projects without hand-holding, handling ambiguity, cross-team communication, quality of technical decisions.",
      distribution: { behavioral: 4, technical: 3, situational: 2, leadership: 1 },
    };
  }
  if (years <= 8) {
    return {
      label: "Senior (5–8 years)",
      differentiator:
        "Technical leadership, influencing without authority, making architecture trade-offs, unblocking others, driving outcomes across teams.",
      distribution: { behavioral: 3, technical: 3, situational: 2, leadership: 2 },
    };
  }
  return {
    label: "Lead / Principal (8+ years)",
    differentiator:
      "Organizational impact, building systems and teams that outlast them, executive communication, strategic technical bets, culture of engineering excellence.",
    distribution: { behavioral: 2, technical: 2, situational: 2, leadership: 4 },
  };
}

// ─── Role Intelligence Config ─────────────────────────────────────────────────

function getRoleConfig(role) {
  const r = (role || "").toLowerCase();

  if (r.includes("frontend") || r.includes("front-end")) {
    return {
      intelligence:
        "Frontend engineers build user interfaces that millions interact with. They balance visual fidelity, performance, accessibility, and maintainability simultaneously.",
      dayToDay:
        "Component development in React/Vue/Angular, CSS architecture, API integration, performance optimization, cross-browser debugging, design system contribution, code reviews.",
      coreSkills:
        "React/framework depth, CSS mastery, JavaScript/TypeScript, Web performance (LCP/CLS/FID), Accessibility (WCAG), REST/GraphQL integration, Testing (Jest/Cypress), Git workflow.",
    };
  }
  if (r.includes("backend") || r.includes("back-end")) {
    return {
      intelligence:
        "Backend engineers build the systems, APIs, and data pipelines that power products. Reliability, scalability, and security are their primary concerns.",
      dayToDay:
        "API design and development, database schema design, service integrations, performance optimization, debugging production issues, writing technical specs.",
      coreSkills:
        "Node.js/Python/Java/Go, REST/GraphQL API design, SQL and NoSQL databases, caching (Redis), message queues (Kafka/RabbitMQ), authentication, system design, monitoring.",
    };
  }
  if (r.includes("machine learning") || r.includes("ml engineer") || r.includes("ml ")) {
    return {
      intelligence:
        "ML engineers bridge data science and production engineering. They build, deploy, monitor, and maintain ML systems that work reliably in production — not just in notebooks.",
      dayToDay:
        "Feature engineering, model training and evaluation, MLOps pipeline building, model deployment and serving, monitoring model drift, A/B testing models, collaborating with data scientists.",
      coreSkills:
        "Python, PyTorch/TensorFlow/scikit-learn, MLOps tools (MLflow/Kubeflow), model serving (FastAPI/TorchServe), data pipelines (Airflow/Spark), SQL, Docker/Kubernetes, experiment tracking.",
    };
  }
  if (r.includes("data analyst")) {
    return {
      intelligence:
        "Data analysts translate raw data into business decisions. They are the bridge between data teams and business stakeholders — trusted to tell true stories with numbers.",
      dayToDay:
        "SQL queries, dashboard creation, ad-hoc analysis requests, metric definition, data cleaning, presenting findings to non-technical stakeholders, A/B test analysis.",
      coreSkills:
        "SQL (advanced), Excel/Google Sheets, Python or R, Tableau/Power BI/Looker, statistical analysis, business communication, data storytelling, metric frameworks.",
    };
  }
  if (r.includes("product manager") || (r.includes("pm") && !r.includes("project"))) {
    return {
      intelligence:
        "Product managers own outcomes, not outputs. They are accountable for what gets built, why, and whether it creates value — with zero direct authority over the teams that build it.",
      dayToDay:
        "Writing PRDs and user stories, prioritizing backlog, running sprint planning, customer interviews, analyzing product metrics, working with design and engineering, stakeholder updates.",
      coreSkills:
        "Product sense, data analysis, roadmap planning, stakeholder management, user research, writing clarity, prioritization frameworks (RICE/ICE), market understanding, technical literacy.",
    };
  }
  if (r.includes("marketing analyst") || r.includes("marketing")) {
    return {
      intelligence:
        "Marketing analysts measure and optimize the effectiveness of marketing spend and campaigns. They are obsessed with attribution, ROI, and connecting marketing activity to revenue.",
      dayToDay:
        "Campaign performance analysis, A/B test setup and analysis, dashboard maintenance, budget tracking, channel attribution, competitive analysis, reporting to marketing leadership.",
      coreSkills:
        "Google Analytics/GA4, SQL, Excel/Google Sheets, Meta Ads Manager, Google Ads, attribution modeling, cohort analysis, statistical significance testing, data visualization.",
    };
  }
  if (r.includes("architect") && !r.includes("solution") && !r.includes("software")) {
    return {
      intelligence:
        "Architects (in construction/real estate) translate client vision and regulatory constraints into buildable, beautiful, and safe structures. They balance aesthetics, function, budget, and compliance.",
      dayToDay:
        "Design development, CAD/BIM modeling, client presentations, contractor coordination, site visits, regulatory submission preparation, material specification, design reviews.",
      coreSkills:
        "AutoCAD/Revit/BIM, building codes and regulations, structural principles, construction methods, client communication, project management, sustainable design, cost estimation.",
    };
  }
  if (r.includes("sales")) {
    return {
      intelligence:
        "Sales professionals convert prospects into customers and grow existing accounts. Top performers are disciplined, data-driven, and customer-obsessed — not just charismatic.",
      dayToDay:
        "Prospecting, cold outreach, discovery calls, proposal creation, negotiation, closing, CRM updates, pipeline reviews, account management, hitting monthly/quarterly quotas.",
      coreSkills:
        "Consultative selling, objection handling, CRM (Salesforce/HubSpot), pipeline management, negotiation, product knowledge, customer empathy, rejection resilience, forecasting.",
    };
  }
  if (r.includes("hr") || r.includes("human resource")) {
    return {
      intelligence:
        "HR professionals manage the entire employee lifecycle — from attraction to exit. Strategic HR partners align people strategy with business strategy.",
      dayToDay:
        "Recruitment coordination, onboarding, performance management, employee relations, policy implementation, compliance, L&D coordination, HRIS management.",
      coreSkills:
        "Employment law knowledge, conflict resolution, HRIS systems, recruitment tools, performance frameworks, communication, empathy, organizational development.",
    };
  }
  if (r.includes("devops") || r.includes("sre")) {
    return {
      intelligence:
        "DevOps/SRE engineers ensure systems are reliable, scalable, and deployable. They eliminate the gap between software development and reliable production operations.",
      dayToDay:
        "CI/CD pipeline management, infrastructure provisioning, incident response, monitoring and alerting, capacity planning, security hardening, developer tooling improvement.",
      coreSkills:
        "Docker/Kubernetes, Terraform/Ansible, AWS/GCP/Azure, CI/CD (GitHub Actions/Jenkins), monitoring (Prometheus/Grafana/Datadog), Linux, scripting (Bash/Python), security practices.",
    };
  }

  // Generic fallback
  return {
    intelligence: `${role} professionals are experts in their domain who bring specialized knowledge and skills to solve business problems in their field.`,
    dayToDay: `Core responsibilities include domain-specific execution, stakeholder collaboration, problem solving, continuous learning, and delivering measurable outcomes in the ${role} function.`,
    coreSkills: `Domain expertise in ${role}, communication, analytical thinking, project ownership, cross-functional collaboration, and continuous skill development.`,
  };
}

// ─── Company Type Config ──────────────────────────────────────────────────────

function getCompanyConfig(companyType) {
  const t = (companyType || "").toLowerCase();

  if (t.includes("startup") && (t.includes("early") || t.includes("seed") || t.includes("pre-series"))) {
    return {
      context:
        "Early-stage startup: 5-30 people, pre-product-market fit or early traction, limited resources, high ambiguity, everyone wears multiple hats, survival mode.",
      needsFromRole:
        "Someone who can operate without structure, build from scratch, make decisions with 60% information, move fast and fix things, and care deeply about the mission not the perks.",
    };
  }
  if (t.includes("startup") || t.includes("series")) {
    return {
      context:
        "Growth-stage startup: 30-300 people, product-market fit achieved, scaling fast, building processes for the first time, hiring rapidly, culture under construction.",
      needsFromRole:
        "Someone who has done this before at scale, can build processes while executing, thrives in a fast-changing environment, and can hire and grow a team around them.",
    };
  }
  if (t.includes("mnc") || t.includes("multinational") || t.includes("global")) {
    return {
      context:
        "MNC: 10,000+ employees, matrix org structure, multiple stakeholders, strong processes, global teams, compliance-heavy, slower decision making but massive resources.",
      needsFromRole:
        "Someone who can navigate complex org politics, communicate across cultures and time zones, deliver results within structured processes, and influence without direct authority.",
    };
  }
  if (t.includes("automobile") || t.includes("automotive")) {
    return {
      context:
        "Automobile company: manufacturing-heavy, safety-critical systems, regulatory compliance (ISO/IATF), long product cycles, hardware-software integration, global supply chains.",
      needsFromRole:
        "Someone who understands safety-critical constraints, can work within rigorous compliance frameworks, has patience for long product cycles, and communicates across engineering disciplines.",
    };
  }
  if (t.includes("real estate")) {
    return {
      context:
        "Real estate company: project-based work, long sales cycles, regulatory/approval heavy, client relationships are everything, market cycles create volatility, margins are thin.",
      needsFromRole:
        "Someone who is client-obsessed, detail-oriented on compliance, comfortable with long timelines, can manage multiple stakeholders simultaneously, and stays calm under regulatory pressure.",
    };
  }
  if (t.includes("bank") || t.includes("fintech") || t.includes("finance")) {
    return {
      context:
        "Financial services: heavily regulated, risk-averse culture, compliance is non-negotiable, customer trust is paramount, decisions are data-driven and auditable.",
      needsFromRole:
        "Someone who is meticulous about accuracy, understands regulatory constraints, can make data-backed decisions, and builds trust with risk-averse stakeholders.",
    };
  }
  if (t.includes("product company") || t.includes("saas")) {
    return {
      context:
        "Product/SaaS company: user obsession drives everything, metrics and data are the language of decision making, fast iteration, strong engineering culture.",
      needsFromRole:
        "Someone with a product mindset even if in a non-PM role, obsessed with metrics, comfortable shipping imperfect things and iterating, and fundamentally user-empathetic.",
    };
  }
  if (t.includes("service") || t.includes("consulting") || t.includes("agency")) {
    return {
      context:
        "Service/consulting company: client delivery is the product, billable utilization matters, managing client expectations is a core skill, breadth over depth.",
      needsFromRole:
        "Someone who is client-facing naturally, manages multiple projects simultaneously, delivers under tight deadlines, and can translate technical work into client value.",
    };
  }
  if (t.includes("gcc") || t.includes("global capability")) {
    return {
      context:
        "GCC: Indian delivery center for a global company, works with HQ stakeholders across time zones, follows global processes, must balance local execution with global alignment.",
      needsFromRole:
        "Someone with strong async communication skills, comfortable with ambiguity from global stakeholders, culturally aware, and able to drive impact without being co-located with decision makers.",
    };
  }

  // Generic fallback
  return {
    context: `${companyType}: A company in its domain with specific operational requirements, culture, and ways of working that the right candidate must understand and adapt to.`,
    needsFromRole:
      "Strong domain expertise, cultural alignment, collaborative mindset, and the ability to deliver measurable outcomes within this organizational context.",
  };
}

// ─── Prompt Builder ───────────────────────────────────────────────────────────

/**
 * Build the master kit generation prompt.
 *
 * @param {string} role           - Job role (free text)
 * @param {string} experience     - Experience (free text, e.g. "5+ years")
 * @param {string} companyType    - Company type (free text)
 * @param {string} industry       - Industry vertical
 * @param {string[]} specificSkills - (unused in new prompt but kept for API compat)
 * @param {string} interviewRound - (unused in new prompt but kept for API compat)
 * @param {number} count          - (unused — always 10)
 * @returns {string}
 */
function buildKitPrompt(
  role,
  experience,
  companyType,
  industry,
  specificSkills,
  interviewRound,
  count,
  constraints
) {
  const expLevel = parseExperienceLevel(experience);
  const roleConfig = getRoleConfig(role);
  const companyConfig = getCompanyConfig(companyType);

  const location = "India";
  const finalConstraints = constraints || "Standard inclusive hiring";

  return `
You are a world-class talent acquisition specialist who has designed 
interview frameworks for Google, Flipkart, Zomato, Tata, Infosys, 
and 200+ companies across India and globally.

You are generating a PREMIUM structured interview kit for:

ROLE: ${role}
EXPERIENCE: ${experience} (${expLevel.label})
COMPANY TYPE: ${companyType}
INDUSTRY: ${industry || "general"}
LOCATION: ${location}
CONSTRAINTS: ${finalConstraints}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROLE INTELLIGENCE FOR: ${role.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${roleConfig.intelligence}

WHAT THIS ROLE ACTUALLY DOES DAY-TO-DAY:
${roleConfig.dayToDay}

CORE SKILLS TO ASSESS FOR THIS ROLE:
${roleConfig.coreSkills}

WHAT SEPARATES GOOD FROM GREAT AT THIS LEVEL (${expLevel.label}):
${expLevel.differentiator}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPANY CONTEXT: ${companyType.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${companyConfig.context}

WHAT THIS COMPANY TYPE NEEDS FROM A ${role}:
${companyConfig.needsFromRole}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUESTION REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generate EXACTLY 10 questions distributed as:
- ${expLevel.distribution.behavioral} behavioral (STAR format, past experience)
- ${expLevel.distribution.technical} technical/domain (role-specific, not generic)
- ${expLevel.distribution.situational} situational (company-type realistic scenarios)
- ${expLevel.distribution.leadership} leadership/ownership (appropriate for ${expLevel.label})

STRICT QUESTION RULES:
1. Every question must be SPECIFIC to ${role} — not reusable for any other role
2. Every question must reflect ${expLevel.label} experience reality
3. Every question must make sense in ${companyType} context
4. NO question can start with "Explain your specific methodology"
5. NO question can end with "Give a recent example" as a suffix
6. NO two questions can follow the same sentence structure
7. NO generic questions: no "tell me about yourself", no "where do you see yourself in 5 years", no "what are your strengths/weaknesses"
8. Technical questions must use real tools/technologies used in ${role} roles in ${location}
9. Behavioral questions must reference real ${role} situations
10. Situational questions must be plausible at ${companyType}

BANNED PATTERNS (your output will be rejected if these appear):
- "Explain your specific methodology regarding:"
- "Give a recent example." as a standalone suffix
- Any question that works identically for a different role
- Questions that just append "(Specifically in the context of being a ${role})"
- Repeating the same question structure more than once

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT GOOD QUESTIONS LOOK LIKE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BAD (what you must NOT generate):
"Explain your specific methodology regarding: Technical 
decision-making in ${role} environments. Give a recent example."

GOOD (what you MUST generate — specific, varied, realistic):
For a Junior Frontend Engineer at a startup:
"Walk me through a time you had to optimize a React component 
that was causing significant render lag. What profiling tools 
did you use, what did you find, and what was the measurable 
improvement after your fix?"

For a Marketing Analyst at an MNC:
"You're presenting campaign performance data to senior leadership 
and the numbers are significantly below target. How do you 
structure that conversation, and what would your slide deck look like?"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Return ONLY valid JSON, no markdown, no extra text:

{
  "kit_title": "${role} Interview Kit — ${expLevel.label} | ${companyType}",
  "role": "${role}",
  "experience": "${experience}",
  "company_type": "${companyType}",
  "location": "${location}",
  "estimated_duration": "<total minutes>",
  "kit_summary": "<2 sentences specific to this role+level+company combination>",
  "questions": [
    {
      "id": 1,
      "question": "<the actual interview question>",
      "type": "behavioral|technical|situational|leadership",
      "competency": "<specific competency — NOT generic>",
      "why_asked": "<why this specific question for this role at this level>",
      "what_good_looks_like": "<2-3 sentences — what an excellent answer includes>",
      "what_poor_looks_like": "<1-2 sentences — red flags in a weak answer>",
      "follow_up_probes": [
        "<drill-down follow-up question>",
        "<challenge or edge case follow-up>"
      ],
      "scoring_guide": {
        "4_exceptional": "<what makes a 4/4 answer>",
        "3_strong": "<what makes a 3/4 answer>",
        "2_adequate": "<what makes a 2/4 answer>",
        "1_poor": "<what makes a 1/4 answer>"
      },
      "time_allocation": "<suggested minutes>",
      "bias_score": 0,
      "bias_verified": true
    }
  ],
  "interviewer_instructions": {
    "opening": "<how to open the interview professionally>",
    "note_taking": "<guidance on structured note taking>",
    "closing": "<how to close and set expectations>",
    "evaluation_criteria": "<how to score overall after the interview>"
  },
  "scorecard": {
    "competencies": [
      {
        "name": "<competency name>",
        "weight": <percentage 1-100, all weights sum to 100>,
        "assessed_by_questions": [<question ids>]
      }
    ]
  }
}

SELF-CHECK BEFORE RESPONDING:
- Are all 10 questions genuinely specific to ${role}?
- Would these questions make NO sense for a different role?
- Does each question reflect ${expLevel.label} experience level?
- Are all question structures different from each other?
- Does no question start with "Explain your specific methodology"?
- Does the output parse as valid JSON?
If any check fails — regenerate before responding.`;
}

// ─── Post-generation Quality Validator ────────────────────────────────────────

/**
 * Validate a generated kit for banned patterns and role specificity.
 * Returns an array of issue strings (empty = pass).
 *
 * @param {object} kit  - Parsed kit JSON
 * @param {string} role - The target role
 * @returns {string[]}  - Issues found
 */
function validateKitQuality(kit, role) {
  const issues = [];
  const questions = kit.questions || [];

  const bannedPatterns = [
    "explain your specific methodology regarding",
    "give a recent example.",
    "specifically in the context of being",
  ];

  questions.forEach((q, i) => {
    const qLower = (q.question || "").toLowerCase();

    bannedPatterns.forEach((pattern) => {
      if (qLower.includes(pattern)) {
        issues.push(`Q${i + 1} contains banned pattern: "${pattern}"`);
      }
    });

    if (qLower.startsWith("explain your")) {
      issues.push(`Q${i + 1} starts with "Explain your" — vary the structure`);
    }
  });

  if (questions.length < 8) {
    issues.push(`Only ${questions.length} questions generated — need at least 8`);
  }

  // Check for role specificity
  const roleWord = (role || "").toLowerCase().split(" ")[0];
  if (roleWord) {
    const roleSpecificCount = questions.filter(
      (q) =>
        (q.question || "").toLowerCase().includes(roleWord) ||
        (q.competency || "").toLowerCase().includes(roleWord)
    ).length;

    if (roleSpecificCount < 3) {
      issues.push(`Less than 3 questions are genuinely role-specific to ${role}`);
    }
  }

  return issues;
}

module.exports = {
  buildKitPrompt,
  parseExperienceLevel,
  getRoleConfig,
  getCompanyConfig,
  validateKitQuality,
};
