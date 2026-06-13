import { DemoInterviewQuestion, DemoScorecardCriterion, DemoBiasReviewItem } from "@/types/demo";

export interface BaseRoleTemplate {
  roleLabel: string;
  roleFamily: string;
  baseRoleSummary: string;
  coreResponsibilities: string[];
  requiredSkills: string[];
  niceToHaveSkills: string[];
  successMetrics: string[];
  interviewQuestions: DemoInterviewQuestion[];
  scorecardCriteria: DemoScorecardCriterion[];
  biasRisks: DemoBiasReviewItem[];
  evaluationGuide: {
    beforeInterview: string[];
    duringInterview: string[];
    afterInterview: string[];
    decisionGuidance: string[];
  };
}

export const ROLE_TEMPLATES: Record<string, BaseRoleTemplate> = {
  "frontend-developer": {
    roleLabel: "Frontend Developer",
    roleFamily: "Engineering",
    baseRoleSummary: "responsible for UI implementation, component architecture, API integration, and frontend performance, translating design guidelines into accessible and responsive digital products.",
    coreResponsibilities: [
      "Build responsive user-facing features using modern frontend frameworks like React and Next.js.",
      "Translate product and design requirements into maintainable, reusable UI components.",
      "Integrate frontend interfaces with APIs and backend services seamlessly.",
      "Improve frontend performance, accessibility (a11y), and browser compatibility.",
      "Collaborate with designers, backend engineers, and product stakeholders to ship features."
    ],
    requiredSkills: [
      "JavaScript / TypeScript",
      "React or equivalent frontend framework",
      "HTML5, CSS3, responsive layout design",
      "API integration and state management",
      "Browser DevTools and debugging capabilities"
    ],
    niceToHaveSkills: [
      "Web accessibility (WCAG 2.1 AA) standards",
      "Performance optimization (Core Web Vitals, code-splitting)",
      "Frontend unit and integration testing (Jest, Playwright)"
    ],
    successMetrics: [
      "Delivers user interfaces matching design specs with high fidelity and zero critical console errors.",
      "Maintains clean, documented component architecture that promotes code reusability.",
      "Resolves production frontend bugs and UI glitches within agreed SLA timelines.",
      "Meets Core Web Vitals targets for page load speeds and user interaction responsiveness."
    ],
    interviewQuestions: [
      {
        question: "Walk through a frontend feature you built from requirements to release. How did you structure it?",
        competency: "Technical Skills",
        whyItMatters: "Assesses component structuring, framework knowledge, state management, and real-world delivery flow.",
        strongAnswerSignals: [
          "Explains component separation cleanly",
          "Mentions state management strategy (local vs global)",
          "Highlights testing, responsiveness, and performance trade-offs"
        ],
        redFlags: [
          "Cannot explain why specific architecture choices were made",
          "Neglects testing or cross-browser compatibility concerns"
        ],
        scoringGuidance: "Score 4-5 if candidate articulates modular design principles, state flows, and specific optimization techniques.",
        biasRisk: "Low"
      },
      {
        question: "How would you structure reusable components for a growing product? Give an example.",
        competency: "Problem Solving",
        whyItMatters: "Verifies ability to create scalable UI patterns and avoid bloated, repetitive styles.",
        strongAnswerSignals: [
          "Uses composition over inheritance",
          "Applies clear prop interfaces",
          "Mentions documentation or design system alignment (like Storybook)"
        ],
        redFlags: [
          "Prefers copying-and-pasting code over abstracting common logic",
          "Creates over-engineered, rigid components that cannot easily adapt"
        ],
        scoringGuidance: "Score 4-5 if candidate presents a clear example of separating layout, container, and presentational elements.",
        biasRisk: "Low"
      },
      {
        question: "How do you debug a frontend issue that only appears in production?",
        competency: "Communication",
        whyItMatters: "Evaluates systematic troubleshooting under pressure and collaboration across engineering layers.",
        strongAnswerSignals: [
          "Uses logging, error reporting tools (Sentry/LogRocket), and analytics",
          "Mentions replicating environment settings or user agents",
          "Explains the issue to teammates without assigning blame"
        ],
        redFlags: [
          "Struggles to outline a structured debugging plan",
          "Relies on random code tweaks until the issue goes away"
        ],
        scoringGuidance: "Score 4-5 if candidate details an orderly isolation strategy (network tab, user session analysis) and team alignment.",
        biasRisk: "Low"
      },
      {
        question: "How do you handle API loading, error, and empty states in your UI components?",
        competency: "Ownership",
        whyItMatters: "Measures empathy for user experience and defensive coding habits.",
        strongAnswerSignals: [
          "Designs fallback UI elements proactively",
          "Mentions skeleton loaders, retry actions, and user-friendly error banners",
          "Ensures empty states provide call-to-actions to guide the user"
        ],
        redFlags: [
          "Assumes APIs always return 200 OK with perfect data payload",
          "Leaves pages blank or locked in perpetual loading loops on error"
        ],
        scoringGuidance: "Score 4-5 if candidate describes robust error boundary setups and graceful degradation strategies.",
        biasRisk: "Low"
      },
      {
        question: "How do you balance speed of delivery with maintainable UI code under a tight deadline?",
        competency: "Execution",
        whyItMatters: "Examines pragmatic decision-making, technical debt alignment, and delivery focus.",
        strongAnswerSignals: [
          "Identifies and documents trade-offs or technical debt clearly",
          "Focuses on core user value first, styling later",
          "Agrees with product managers on scope cuts rather than rushing quality"
        ],
        redFlags: [
          "Refuses to compromise on absolute perfection, missing deadlines",
          "Writes sloppy, unreadable code with no plan to refactor later"
        ],
        scoringGuidance: "Score 4-5 if candidate shows a collaborative approach to scoping and tracks technical debt actively.",
        biasRisk: "Low"
      },
      {
        question: "How would you improve performance on a slow React page?",
        competency: "Analytical Thinking",
        whyItMatters: "Tests performance profiling knowledge and understanding of virtual DOM rendering mechanics.",
        strongAnswerSignals: [
          "Profiles render cycles using React DevTools",
          "Uses memoization (useMemo, useCallback) appropriately",
          "Implements lazy loading, windowing/virtualization for long lists"
        ],
        redFlags: [
          "Applies memoization blindly to every component",
          "Struggles to identify layout shifts, heavy assets, or redundant re-renders"
        ],
        scoringGuidance: "Score 4-5 if candidate walks through a diagnostic path, from performance profiling to code-splitting and asset optimization.",
        biasRisk: "Low"
      }
    ],
    scorecardCriteria: [
      {
        name: "Frontend Technical Skills",
        weight: 35,
        description: "Mastery of HTML/CSS/JS/React, component design patterns, state management, and modern styling solutions.",
        positiveSignals: [
          "Understands React lifecycle and hook patterns deeply",
          "Writes semantically correct HTML and structured responsive layouts",
          "Integrates APIs cleanly with error resilience"
        ],
        concernSignals: [
          "Struggles with basic JS/TS logic or React re-render rules",
          "Ignores responsive layouts and cross-browser consistency"
        ],
        scoringGuidance: "Evaluate based on technical correctness, clean component breakdown, and familiarity with modern standards."
      },
      {
        name: "Problem Solving",
        weight: 25,
        description: "Ability to troubleshoot production glitches, analyze page performance, and structure complex application layouts.",
        positiveSignals: [
          "Systematic debugging approach using browser profiling tools",
          "Breaks down complex layout goals into structured steps",
          "Proposes simple solutions instead of over-engineered systems"
        ],
        concernSignals: [
          "Stumbles when isolating root causes in modern state containers",
          "Over-complicates minor styling or structural problems"
        ],
        scoringGuidance: "Assess candidate's ability to debug under pressure, navigate complex logic, and optimize slow pages."
      },
      {
        name: "Product/UI Thinking",
        weight: 15,
        description: "Empathy for end users, attention to design fidelity, and proactive integration of UI accessibility.",
        positiveSignals: [
          "Advocates for loading/empty/error states",
          "Familiar with web accessibility standards (WCAG guidelines)",
          "Questions design gaps constructively for user benefit"
        ],
        concernSignals: [
          "Ignores user experience nuances (e.g. key focus outlines, mobile taps)",
          "Builds code strictly off spec without checking visual quality"
        ],
        scoringGuidance: "Look for user empathy, interaction micro-details, and design alignment."
      },
      {
        name: "Code Maintainability",
        weight: 15,
        description: "Commitment to clean code rules, documentation, unit testing, and design systems integration.",
        positiveSignals: [
          "Writes clear prop-types and TypeScript interfaces",
          "Follows consistent coding conventions and structures components modularly",
          "Writes useful unit tests for complex state transitions"
        ],
        concernSignals: [
          "Writes monolithic files with inline styling and undocumented hacks",
          "Dismisses tests as optional or low-value"
        ],
        scoringGuidance: "Verify component structure, modular styling habits, and testing approaches."
      },
      {
        name: "Communication & Collaboration",
        weight: 10,
        description: "Active collaboration with design, backend engineers, and product stakeholders.",
        positiveSignals: [
          "Explains technical trade-offs to non-technical partners cleanly",
          "Communicates API schema requirements to backend peers proactively",
          "Accepts and acts on code review feedback constructively"
        ],
        concernSignals: [
          "Uses overly complex technical jargon unnecessarily",
          "Shows defensiveness when code is critiqued"
        ],
        scoringGuidance: "Evaluate active listening, clarity of explanations, and collaborative attitude."
      }
    ],
    biasRisks: [
      {
        area: "Screening",
        risk: "Medium",
        issue: "Mandating exact years of experience for specific libraries (e.g., 'React developer with 5+ years').",
        saferAlternative: "Verify core competency in modern JavaScript frameworks and complexity of features built, rather than counting years."
      },
      {
        area: "Coding Tests",
        risk: "High",
        issue: "Using high-pressure live coding challenges on algorithms unrelated to everyday UI building.",
        saferAlternative: "Perform a collaborative code review session of a small pre-existing mock UI repo, or a take-home task mapping to daily tasks."
      },
      {
        area: "Sourcing",
        risk: "Low",
        issue: "Filtering candidates based on educational background or top-tier university degrees.",
        saferAlternative: "Evaluate candidate portfolio items, GitHub repositories, and relevant engineering project contributions."
      }
    ],
    evaluationGuide: {
      beforeInterview: [
        "Review the candidate's portfolio links or GitHub to understand their experience style.",
        "Ensure the test environment is pre-configured so no time is wasted troubleshooting setup issues."
      ],
      duringInterview: [
        "Focus on how the candidate explains design patterns and state management, rather than rote syntax memory.",
        "Take detailed notes on their specific coding choices, error handling, and component abstraction logic."
      ],
      afterInterview: [
        "Fill out the scorecard immediately after the call to prevent recency bias.",
        "Evaluate based on objective evidence (e.g., 'Candidate explained hook triggers correctly') rather than generic gut feel."
      ],
      decisionGuidance: [
        "Select the candidate who balances UI design quality with performance and maintainable patterns.",
        "Ensure all evaluators align on scorecard rubrics before submitting final recommendations."
      ]
    }
  },
  "backend-developer": {
    roleLabel: "Backend Developer",
    roleFamily: "Engineering",
    baseRoleSummary: "responsible for API design, database schemas, system reliability, authentication flows, and backend service scalability, ensuring secure and stable data processing.",
    coreResponsibilities: [
      "Design and implement reliable, secure REST or GraphQL APIs and microservices.",
      "Model application data structures and manage relational or NoSQL database queries.",
      "Build secure authentication, authorization, and tenant-access control flows.",
      "Debug complex backend production issues, write integrations, and improve service uptime.",
      "Collaborate with frontend engineers and product teams to design complete feature workflows."
    ],
    requiredSkills: [
      "Backend language/framework experience (e.g., Node.js, Python, Go, or Java)",
      "REST or GraphQL API design patterns",
      "Relational database design (SQL schemas, indexing, migrations)",
      "Authentication and authorization mechanisms (OAuth, JWT, session auth)",
      "Debugging, logging, and application telemetry tools"
    ],
    niceToHaveSkills: [
      "Cloud services deployment (AWS, GCP, Docker/Kubernetes)",
      "Message queues and background job processing (Redis, RabbitMQ)",
      "High scalability and system design fundamentals"
    ],
    successMetrics: [
      "Deploys backend features with robust validation and secure API endpoints.",
      "Optimizes database queries to keep average response times (p95 latency) within goals.",
      "Integrates background jobs and event queues with minimal queue lag or failure rates.",
      "Maintains comprehensive logging coverage to guarantee issues are easily diagnosable."
    ],
    interviewQuestions: [
      {
        question: "Describe an API you designed recently. What technical tradeoffs did you consider?",
        competency: "Technical Skills",
        whyItMatters: "Verifies API design best practices, scalability considerations, and data structure reasoning.",
        strongAnswerSignals: [
          "Discusses versioning, pagination, and error handling patterns",
          "Mentions authentication, rate limiting, and security compliance",
          "Explains balancing database reads/writes for optimal speed"
        ],
        redFlags: [
          "Designs API structures without considering request validation",
          "Struggles to explain data serialization or response codes"
        ],
        scoringGuidance: "Score 4-5 if candidate presents structured reasoning around payload sizing, query efficiency, and error responses.",
        biasRisk: "Low"
      },
      {
        question: "How would you design a database schema for a complex hiring workflow product?",
        competency: "Problem Solving",
        whyItMatters: "Evaluates database modeling, relational design, indexing, and indexing tradeoffs.",
        strongAnswerSignals: [
          "Defines clean relationships (many-to-many, one-to-many)",
          "Discusses indexes for frequently read fields",
          "Addresses data integrity, transactions, and migration safety"
        ],
        redFlags: [
          "Creates circular references or redundant data shapes without normalization",
          "Ignores scale issues when queried repeatedly by concurrent users"
        ],
        scoringGuidance: "Score 4-5 if candidate structures a normalized schema and explains where index placement or caching is appropriate.",
        biasRisk: "Low"
      },
      {
        question: "How do you handle authentication and authorization securely in backend systems?",
        competency: "Ownership",
        whyItMatters: "Checks core security awareness and understanding of authorization roles (RBAC/ABAC).",
        strongAnswerSignals: [
          "Differentiates authentication (identity) from authorization (permissions)",
          "Explains secure token storage, verification, and rotation rules",
          "Emphasizes validating user scopes on every API endpoint call"
        ],
        redFlags: [
          "Relies on client-side security checks without backend enforcement",
          "Has vague knowledge of common security risks (like SQL injection or CSRF)"
        ],
        scoringGuidance: "Score 4-5 if candidate shows a security-first mindset and details multi-tenant data separation.",
        biasRisk: "Low"
      },
      {
        question: "How would you debug a slow API endpoint in a production environment?",
        competency: "Analytical Thinking",
        whyItMatters: "Tests monitoring, diagnostics, and optimization workflow.",
        strongAnswerSignals: [
          "Uses APM tools, database query plans (EXPLAIN), and slow logs",
          "Checks for network latency, blocking IO, and database locking issues",
          "Proposes caching (Redis) or index tweaks to resolve bottle-necks"
        ],
        redFlags: [
          "Guesses the bottleneck without using metrics or profiling tools",
          "Suggests adding database servers instead of optimizing query performance"
        ],
        scoringGuidance: "Score 4-5 if candidate outlines a structured diagnostic path, isolating database, code, and external API latencies.",
        biasRisk: "Low"
      },
      {
        question: "How do you design backend services so failures are easier to diagnose in production?",
        competency: "Execution",
        whyItMatters: "Evaluates system reliability thinking, logging strategies, and maintainability.",
        strongAnswerSignals: [
          "Mentions structured logging (JSON format) and correlation IDs",
          "Applies telemetry metrics, health checks, and alerting rules",
          "Uses circuit breakers or retry policies for third-party integrations"
        ],
        redFlags: [
          "Uses raw console logs with no structured formatting or context",
          "Neglects error catching, leading to unhandled service crashes"
        ],
        scoringGuidance: "Score 4-5 if candidate defines clear patterns for logging, warning thresholds, and service recovery plans.",
        biasRisk: "Low"
      },
      {
        question: "How do you balance shipping features quickly with keeping system reliability high?",
        competency: "Communication",
        whyItMatters: "Measures pragmatic tradeoffs, technical debt management, and engineering maturity.",
        strongAnswerSignals: [
          "Documents technical choices and writes automated tests",
          "Advocates for feature flags to roll out updates safely",
          "Communicates operational risks to product managers clearly"
        ],
        redFlags: [
          "Refuses to ship until architecture is flawless, delaying releases",
          "Slashes all test coverage and logging to speed up immediate shipping"
        ],
        scoringGuidance: "Score 4-5 if candidate emphasizes risk mitigation through modular updates and solid testing patterns.",
        biasRisk: "Low"
      }
    ],
    scorecardCriteria: [
      {
        name: "Backend Technical Skills",
        weight: 35,
        description: "Mastery of backend languages, API design patterns, security concepts, and authentication frameworks.",
        positiveSignals: [
          "Writes clean, modular backend code with request validation",
          "Ensures security guidelines (JWT, CORS, RBAC) are implemented",
          "Familiar with server architectures and database layers"
        ],
        concernSignals: [
          "Struggles with basic asynchronous control flow or API setups",
          "Lacks basic security awareness for data access control"
        ],
        scoringGuidance: "Assess coding style, API construction habits, and application security familiarity."
      },
      {
        name: "System Design Thinking",
        weight: 20,
        description: "Ability to design scalable services, handle background jobs, cache appropriately, and map complex workflows.",
        positiveSignals: [
          "Identifies scaling limits of databases and service connections",
          "Uses message queues for asynchronous background work",
          "Applies caching rules strategically to reduce service load"
        ],
        concernSignals: [
          "Proposes monolithic, tightly-coupled architectures for complex states",
          "Ignores network limits or connection pooling constraints"
        ],
        scoringGuidance: "Look for resource management skills, queue patterns, and scaling principles."
      },
      {
        name: "Database Reasoning",
        weight: 20,
        description: "Competency in relational/NoSQL modeling, indexing strategy, transaction isolation, and query efficiency.",
        positiveSignals: [
          "Designs normalized SQL schemas with explicit relationships",
          "Writes highly optimized queries using index analysis tools",
          "Ensures transaction integrity and avoids database locks"
        ],
        concernSignals: [
          "Struggles to model data relationships or explain table joins",
          "Writes heavy queries that ignore indexes, causing slow loads"
        ],
        scoringGuidance: "Evaluate database design depth, schema migration safety, and query tuning knowledge."
      },
      {
        name: "Reliability & Debugging",
        weight: 15,
        description: "Structured approach to troubleshooting production incidents, profiling API latency, and setting logging.",
        positiveSignals: [
          "Diagnoses slow endpoints using APM tools and explain plans",
          "Implements structured JSON logging with error context",
          "Uses correlation IDs to trace calls across microservices"
        ],
        concernSignals: [
          "Lacks debugging strategy beyond logging raw messages",
          "Fails to build robust error catch blocks, risking system stability"
        ],
        scoringGuidance: "Evaluate diagnostic reasoning, instrumentation patterns, and operational practices."
      },
      {
        name: "Collaboration",
        weight: 10,
        description: "Coordinating API schemas with frontend engineers and aligning technical decisions with product managers.",
        positiveSignals: [
          "Documents APIs using OpenAPI/Swagger specs early in the cycle",
          "Supports frontend engineers with test data or mocks",
          "Communicates service limits to product partners before build"
        ],
        concernSignals: [
          "Designs API payloads in isolation without consulting frontend consumers",
          "Exhibits rigidity when requested to change response structures"
        ],
        scoringGuidance: "Look for documentation habits, API negotiation skills, and team alignment."
      }
    ],
    biasRisks: [
      {
        area: "Screening",
        risk: "Medium",
        issue: "Judging backend capabilities solely on memory of specific system configurations or rare algorithmic trivia.",
        saferAlternative: "Review candidate's understanding of schema modeling, concurrent processing, and API design trade-offs."
      },
      {
        area: "Coding Tests",
        risk: "High",
        issue: "Using sandbox coding environments that block access to basic documentation or library search tools.",
        saferAlternative: "Permit open-internet search during challenges, as developer efficiency relies on researching docs and APIs."
      },
      {
        area: "Sourcing",
        risk: "Low",
        issue: "Relying on candidates having open-source contributions, which biases against developers with caregiving duties or lack of free time.",
        saferAlternative: "Assess technical skills via workplace projects and core system design interviews during business hours."
      }
    ],
    evaluationGuide: {
      beforeInterview: [
        "Align with the panel on the main backend areas to cover (modeling vs operations).",
        "Make sure the system design sandbox or diagramming tools are shared in advance."
      ],
      duringInterview: [
        "Focus on how the candidate isolates database and application layer issues.",
        "Take detailed notes on their security validation and API error handling choices."
      ],
      afterInterview: [
        "Complete the evaluation form immediately, citing concrete code examples from the chat.",
        "Avoid making hiring recommendations based on vague 'gut feel' or personality styles."
      ],
      decisionGuidance: [
        "Select candidates who prioritize security compliance, reliability, and robust API modeling.",
        "Ensure the hiring decision is based on the structured scorecard totals."
      ]
    }
  },
  "sales-executive-bdr": {
    roleLabel: "Sales Executive / BDR",
    roleFamily: "Sales",
    baseRoleSummary: "responsible for pipeline generation, outbound prospecting, lead qualification, CRM discipline, and handling customer objections, driving customer acquisition.",
    coreResponsibilities: [
      "Identify and qualify potential B2B SaaS accounts using outbound prospecting channels.",
      "Conduct highly personalized outreach via email, LinkedIn, and cold calls.",
      "Understand prospect hiring bottlenecks and map Rifair AI's value proposition.",
      "Maintain strict CRM updates and pipeline discipline to monitor lead status.",
      "Schedule qualified demo calls and transition prospects smoothly through the sales funnel."
    ],
    requiredSkills: [
      "Excellent written and verbal communication",
      "Lead generation and outbound prospecting workflows",
      "Objection handling and value-based selling",
      "CRM platform administration and discipline",
      "High resilience and structured follow-up routines"
    ],
    niceToHaveSkills: [
      "Experience selling B2B SaaS applications",
      "Familiarity with recruitment tech or HR operations",
      "Experience with modern outreach automation platforms"
    ],
    successMetrics: [
      "Consistently hits monthly and quarterly outbound pipeline creation targets.",
      "Maintains clean, up-to-date CRM notes for 100% of active deals.",
      "Improves outreach response rates through personalization experiments.",
      "Transitions qualified opportunities to demo stage with zero communication drops."
    ],
    interviewQuestions: [
      {
        question: "How would you identify and qualify high-potential B2B prospects for a SaaS tool like Rifair AI?",
        competency: "Prospecting Ability",
        whyItMatters: "Tests target market understanding, ICP identification, and outbound sourcing tactics.",
        strongAnswerSignals: [
          "Defines ideal customer profile (ICP) based on team size or hiring volume",
          "Uses data sources like LinkedIn Sales Navigator, job boards, or news alerts",
          "Mentions clear qualification criteria (e.g. BANT or CHAMP frameworks)"
        ],
        redFlags: [
          "Relies on generic contact lists without personalization",
          "Cannot explain the difference between a lead and a qualified prospect"
        ],
        scoringGuidance: "Score 4-5 if candidate presents a structured sourcing workflow and outlines a clear ICP qualification process.",
        biasRisk: "Low"
      },
      {
        question: "Describe a time you faced repeated objections or rejection during a campaign. How did you handle it?",
        competency: "Objection Handling",
        whyItMatters: "Measures persistence, mental resilience, and active listening capabilities.",
        strongAnswerSignals: [
          "Treats objections as requests for information, not personal attacks",
          "Asks open-ended questions to discover the underlying concern",
          "Shares an example of converting an objection into a scheduled call"
        ],
        redFlags: [
          "Becomes argumentative or quickly gives up on the prospect",
          "Lacks a structured response pattern for common pricing or feature objections"
        ],
        scoringGuidance: "Score 4-5 if candidate shares a real scenario showing empathy, structured validation, and a successful pivot.",
        biasRisk: "Low"
      },
      {
        question: "How do you personalize outreach messages at scale without spending too much time on each lead?",
        competency: "Communication",
        whyItMatters: "Verifies efficiency, time management, and copywriting skills.",
        strongAnswerSignals: [
          "Researches company hiring posts or news updates to establish context",
          "Uses templates with custom placeholders for specific trigger events",
          "Allocates specific blocks of time for high-value personalization"
        ],
        redFlags: [
          "Sends generic, bulk spam emails with zero customization",
          "Spends hours researching a single lead, reducing daily call volume"
        ],
        scoringGuidance: "Score 4-5 if candidate balances volume with structured personalization (e.g., the 10x3 personalization rule).",
        biasRisk: "Low"
      },
      {
        question: "How do you qualify whether a prospect is worth pursuing or if you should move on?",
        competency: "Customer Understanding",
        whyItMatters: "Evaluates pipeline prioritization, conversion focus, and deal qualification.",
        strongAnswerSignals: [
          "Checks for active hiring needs or strategic HR goals",
          "Identifies if the prospect has authority or budget decision-making input",
          "Documents reasons for disqualification to clean up the CRM pipeline"
        ],
        redFlags: [
          "Chases unresponsive leads indefinitely, wasting sales cycles",
          "Accepts meeting bookings with unqualified contacts just to inflate metrics"
        ],
        scoringGuidance: "Score 4-5 if candidate outlines specific qualification thresholds and shows willingness to let go of bad-fit leads.",
        biasRisk: "Low"
      },
      {
        question: "What daily sales metrics do you track closely to monitor your pipeline performance?",
        competency: "Execution Discipline",
        whyItMatters: "Tests self-discipline, data-driven habits, and goal alignment.",
        strongAnswerSignals: [
          "Tracks activity ratios (emails sent vs responses vs calls booked)",
          "Monitors CRM updates, call durations, and response times",
          "Adjusts daily schedules based on conversion drop-offs"
        ],
        redFlags: [
          "Has no visibility into personal conversion rates or volume metrics",
          "Relies on erratic motivation rather than consistent activity targets"
        ],
        scoringGuidance: "Score 4-5 if candidate uses metrics to run their pipeline like a business and explain optimization experiments.",
        biasRisk: "Low"
      },
      {
        question: "How would you explain the value of Rifair AI to a busy talent acquisition manager in 30 seconds?",
        competency: "Communication",
        whyItMatters: "Assesses elevator pitch, value-proposition translation, and verbal impact.",
        strongAnswerSignals: [
          "Focuses on candidate experience, speed to hire, and consistency",
          "Uses a clear Hook-Problem-Solution structure",
          "Keeps pitch jargon-free and invites the prospect to a demo call"
        ],
        redFlags: [
          "Lists features rather than business value",
          "Speaks rapidly without pauses or context, confusing the listener"
        ],
        scoringGuidance: "Score 4-5 if candidate delivers a concise, value-focused pitch that concludes with a clear call-to-action.",
        biasRisk: "Low"
      }
    ],
    scorecardCriteria: [
      {
        name: "Communication",
        weight: 25,
        description: "Clarity, persuasion, and active listening in written outreach, video pitches, and verbal calls.",
        positiveSignals: [
          "Writes concise, value-focused emails that avoid spam traps",
          "Asks discovery questions that uncover prospect workflows",
          "Expresses value propositions without stumbling over pricing"
        ],
        concernSignals: [
          "Uses pushy sales jargon or confusing feature lists",
          "Interrupts prospects or misses verbal cues during conversation"
        ],
        scoringGuidance: "Evaluate based on clarity of communication, active listening, and copywriting quality."
      },
      {
        name: "Prospecting Ability",
        weight: 20,
        description: "Identifying qualified accounts, researching decision-makers, and targeting specific industries.",
        positiveSignals: [
          "Sources high-quality leads matching the ICP using hiring trends",
          "Finds correct stakeholder contact details systematically",
          "Segments lead lists to run tailored outbound sequences"
        ],
        concernSignals: [
          "Targets random accounts without checking suitability",
          "Relies solely on outdated databases, causing high bounce rates"
        ],
        scoringGuidance: "Look for structured account planning and high-quality lead generation habits."
      },
      {
        name: "Objection Handling",
        weight: 20,
        description: "Navigating common pushbacks on pricing, timing, or competitor solutions with ease.",
        positiveSignals: [
          "Validates concerns before offering answers",
          "Reframes pricing objections to return to business value",
          "Handles objections with confidence without getting defensive"
        ],
        concernSignals: [
          "Becomes defensive or accepts pushbacks immediately",
          "Attempts to argue with prospects or dismisses valid questions"
        ],
        scoringGuidance: "Evaluate resilience, validation patterns, and pivot success during objections."
      },
      {
        name: "Execution Discipline",
        weight: 20,
        description: "Consistency in daily outreach volumes, CRM data entry, and pipeline update habits.",
        positiveSignals: [
          "Logs 100% of interactions and schedules tasks in the CRM",
          "Meets outreach targets day after day without drop-offs",
          "Organizes follow-ups to ensure no lead goes cold"
        ],
        concernSignals: [
          "Maintains a messy CRM with missing notes and outdated deals",
          "Shows highly inconsistent activity levels from week to week"
        ],
        scoringGuidance: "Check pipeline updates, follow-up consistency, and organization habits."
      },
      {
        name: "Customer Understanding",
        weight: 15,
        description: "Ability to learn recruitment workflows, identify talent challenges, and match product features to needs.",
        positiveSignals: [
          "Understands common recruiter pain points (time-to-hire, bias)",
          "Speaks the customer's language instead of product-centric code",
          "Qualifies deals strictly against business fit criteria"
        ],
        concernSignals: [
          "Does not know who the target user is or what they care about",
          "Attempts to sell to irrelevant business lines, wasting cycles"
        ],
        scoringGuidance: "Look for industry terminology accuracy and customer empathy."
      }
    ],
    biasRisks: [
      {
        area: "Screening",
        risk: "Medium",
        issue: "Evaluating sales potential based on highly subjective personality styles, favoring extroverts or specific cultural cues.",
        saferAlternative: "Measure core performance traits like objection handling, structured follow-up routines, and CRM discipline."
      },
      {
        area: "Mock Demos",
        risk: "High",
        issue: "Running aggressive roleplays without prior product training, penalizing candidates unfamiliar with internal jargon.",
        saferAlternative: "Provide prep materials 48 hours in advance, and evaluate structure, validation, and active listening over memorization."
      },
      {
        area: "Sourcing",
        risk: "Low",
        issue: "Preferring candidates with existing corporate network connections, which limits diversity in hiring pools.",
        saferAlternative: "Evaluate outbound research skills, personalization approaches, and structured lead qualification capability."
      }
    ],
    evaluationGuide: {
      beforeInterview: [
        "Provide mock scenario briefs or product details to the candidate ahead of time.",
        "Set clear scoring goals for the roleplay exercise, focusing on process over polish."
      ],
      duringInterview: [
        "Take detailed notes on how the candidate handles pushback during the mock scenario.",
        "Observe if they ask open discovery questions or jump straight into pitching."
      ],
      afterInterview: [
        "Document performance using the scorecard immediately after the call concludes.",
        "Avoid using subjective words like 'chemistry' or 'vibe' in evaluation notes."
      ],
      decisionGuidance: [
        "Hire candidates who show consistent pipeline discipline, resilience, and curiosity about the product.",
        "Compare candidate scorecard totals objectively rather than relying on final impressions."
      ]
    }
  },
  "digital-marketing-executive": {
    roleLabel: "Digital Marketing Executive",
    roleFamily: "Marketing",
    baseRoleSummary: "responsible for campaign execution, website analytics, social/content distribution, paid/organic channel optimization, and performance reporting.",
    coreResponsibilities: [
      "Plan, set up, and execute multi-channel digital marketing campaigns.",
      "Write, edit, and optimize content for search engines (SEO), email, and social channels.",
      "Track marketing campaign performance using analytics tools to report insights.",
      "Run conversion rate optimization (CRO) experiments to lower customer acquisition costs.",
      "Collaborate with product, sales, and design teams to align content messaging."
    ],
    requiredSkills: [
      "Digital marketing campaign setup and management",
      "SEO principles (on-page, keyword research, link-building)",
      "Marketing analytics and conversion tracking tools",
      "Copywriting for B2B email, social, and landing pages",
      "A/B testing and growth experimentation frameworks"
    ],
    niceToHaveSkills: [
      "Paid advertising platform experience (LinkedIn, Google Ads)",
      "Email marketing automation platform setups",
      "Basic graphic design or video editing tools"
    ],
    successMetrics: [
      "Increases qualified demo signups from organic search and content channels.",
      "Improves email campaign open and click-through rates through testing.",
      "Ensures conversion tracking setups are accurate for all new landing pages.",
      "Delivers marketing reporting dashboards on time with clear improvement actions."
    ],
    interviewQuestions: [
      {
        question: "Walk through a recent marketing campaign you managed. How did you define and measure success?",
        competency: "Campaign Execution",
        whyItMatters: "Verifies execution workflow, objective-setting, analytics discipline, and channel performance.",
        strongAnswerSignals: [
          "Mentions clear goals (leads, CPA, click-through rates)",
          "Details campaign configuration, audience targeting, and channels used",
          "Connects campaign performance directly to business pipeline growth"
        ],
        redFlags: [
          "Measures success using vanity metrics (likes, impressions) with no business value",
          "Cannot explain how the target audience was selected or reached"
        ],
        scoringGuidance: "Score 4-5 if candidate links campaign steps to conversions and discusses clear cost-per-acquisition metrics.",
        biasRisk: "Low"
      },
      {
        question: "How would you market a B2B SaaS tool like Rifair AI to corporate recruiters and HR managers?",
        competency: "Content & Messaging",
        whyItMatters: "Tests target market understanding, value translation, and channel strategy.",
        strongAnswerSignals: [
          "Focuses on pain points like time-to-hire, interviewer burnout, or hiring bias",
          "Identifies key channels like LinkedIn, HR newsletters, and search queries",
          "Proposes content styles (templates, case studies) that address recruiter needs"
        ],
        redFlags: [
          "Suggests generic consumer marketing channels (e.g. TikTok ads) without B2B focus",
          "Uses dry feature lists instead of pain-point-driven messaging"
        ],
        scoringGuidance: "Score 4-5 if candidate presents a tailored B2B content funnel targeting HR decision-makers.",
        biasRisk: "Low"
      },
      {
        question: "What metrics would you track closely for a new landing page launch?",
        competency: "Analytical Thinking",
        whyItMatters: "Checks web optimization knowledge, funnel analysis, and data-driven approach.",
        strongAnswerSignals: [
          "Tracks bounce rates, time on page, and call-to-action (CTA) conversions",
          "Monitors traffic sources, device breakdowns, and page speed loading times",
          "Mentions session replays or heatmaps to understand user scroll drop-off"
        ],
        redFlags: [
          "Focuses only on page visits with no tracking on conversion actions",
          "Does not know how to verify if tracking tags are firing correctly"
        ],
        scoringGuidance: "Score 4-5 if candidate explains tag setup verification and details post-launch tracking metrics.",
        biasRisk: "Low"
      },
      {
        question: "How do you decide whether a campaign is underperforming or needs more time to run?",
        competency: "Ownership",
        whyItMatters: "Evaluates budget management, data significance, and critical decision-making.",
        strongAnswerSignals: [
          "Uses statistical significance or sample size calculations",
          "Analyzes funnel stages to locate the drop-off point",
          "Proposes test adjustments (copy, design) before stopping budget spend"
        ],
        redFlags: [
          "Pulls campaign budget prematurely based on daily conversion swings",
          "Lets failing campaigns burn budget indefinitely without testing changes"
        ],
        scoringGuidance: "Score 4-5 if candidate uses data-driven criteria to guide optimization decisions.",
        biasRisk: "Low"
      },
      {
        question: "How do you balance creative ideas with performance data when building content?",
        competency: "Channel Knowledge",
        whyItMatters: "Measures alignment of brand voice with performance targets.",
        strongAnswerSignals: [
          "Uses data (keyword searches, past CTRs) to guide creative brainstorms",
          "Tests multiple creative angles in parallel to see what resonates",
          "Maintains high copywriting standards while optimizing for keywords"
        ],
        redFlags: [
          "Values creative expression over conversion performance data",
          "Writes robotic content optimized only for search bots, ignoring readability"
        ],
        scoringGuidance: "Score 4-5 if candidate describes a workflow where performance insights fuel creative copy updates.",
        biasRisk: "Low"
      },
      {
        question: "How would you improve organic traffic for a brand with a limited marketing budget?",
        competency: "Analytical Thinking",
        whyItMatters: "Tests resourcefulness, SEO execution, and content optimization hacks.",
        strongAnswerSignals: [
          "Targets low-competition, long-tail search queries with high intent",
          "Optimizes existing pages for better search position performance",
          "Utilizes social distribution, guest posting, and email lists"
        ],
        redFlags: [
          "Relies on expensive paid ads as the only traffic acquisition tool",
          "Suggests generic advice like 'post more content' without strategic targeting"
        ],
        scoringGuidance: "Score 4-5 if candidate shares a structured SEO plan focused on content quality and authority distribution.",
        biasRisk: "Low"
      }
    ],
    scorecardCriteria: [
      {
        name: "Campaign Execution",
        weight: 25,
        description: "Competency in configuring campaigns, tracking conversions, and coordinating content assets.",
        positiveSignals: [
          "Understands campaign tracking configurations (UTMs, events, pixels)",
          "Launches multi-channel campaigns on time and within budget",
          "Coordinates marketing assets across design and copy resources"
        ],
        concernSignals: [
          "Errors frequently when setting up campaign links or analytics tags",
          "Struggles to organize assets, delaying landing page launches"
        ],
        scoringGuidance: "Assess campaign launch workflow, execution tracking, and QA habits."
      },
      {
        name: "Analytical Thinking",
        weight: 25,
        description: "Analyzing web traffic patterns, calculating acquisition costs, and running experiments.",
        positiveSignals: [
          "Translates raw web analytics data into optimization actions",
          "Calculates customer acquisition costs (CAC) and lifetime value (LTV) accurately",
          "Runs structured A/B tests with statistical significance thresholds"
        ],
        concernSignals: [
          "Confuses basic marketing metrics or misinterprets traffic drops",
          "Decides campaign updates based on gut feel rather than performance logs"
        ],
        scoringGuidance: "Evaluate data translation skill, analytics tool usage, and testing logic."
      },
      {
        name: "Channel Knowledge",
        weight: 20,
        description: "Mastery of search engine optimization (SEO), email marketing, and social media distribution.",
        positiveSignals: [
          "Performs comprehensive keyword research based on intent and difficulty",
          "Designs high-engagement email sequences and monitors sender score",
          "Builds distribution loops to extend content shelf life"
        ],
        concernSignals: [
          "Has outdated SEO knowledge (keyword stuffing, spam link-building)",
          "Writes generic email blasts that result in high spam report rates"
        ],
        scoringGuidance: "Verify SEO capability, email setup knowledge, and distribution habits."
      },
      {
        name: "Content & Messaging",
        weight: 15,
        description: "Copywriting skill, translating features into benefits, and aligning with brand voice.",
        positiveSignals: [
          "Writes copy for ads and landing pages that drives action",
          "Communicates product value propositions to specific audiences",
          "Applies consistent brand messaging guidelines across channels"
        ],
        concernSignals: [
          "Writes dry, technical copy that fails to engage the audience",
          "Produces content filled with grammar errors or formatting issues"
        ],
        scoringGuidance: "Assess copywriting, messaging alignment, and editing focus."
      },
      {
        name: "Ownership",
        weight: 15,
        description: "Proactivity, managing campaigns end-to-end, and taking accountability for conversions.",
        positiveSignals: [
          "Takes full responsibility for meeting demo pipeline conversion goals",
          "Identifies and fixes broken links or tracking issues without being asked",
          "Monitors campaign performance daily and adjusts budgets proactively"
        ],
        concernSignals: [
          "Blames design or product teams when marketing campaigns underperform",
          "Allows budget leakage on failing configurations without intervening"
        ],
        scoringGuidance: "Look for initiative, performance responsibility, and budget focus."
      }
    ],
    biasRisks: [
      {
        area: "Screening",
        risk: "Medium",
        issue: "Filtering candidates based on their personal social media following or presence, which is irrelevant for B2B marketing.",
        saferAlternative: "Review their portfolio of campaign metrics, SEO case studies, and corporate copywriting examples."
      },
      {
        area: "Coding Tests",
        risk: "High",
        issue: "Demanding candidates create a full marketing campaign plan for the actual company as a free assignment.",
        saferAlternative: "Assign a mock case study with dummy data to evaluate campaign architecture and diagnostic approach."
      },
      {
        area: "Sourcing",
        risk: "Low",
        issue: "Assuming only younger candidates understand digital marketing tools and social media algorithms.",
        saferAlternative: "Assess technical competence in analytics setups, copy strategy, and channel optimization across all ages."
      }
    ],
    evaluationGuide: {
      beforeInterview: [
        "Review candidate's writing portfolio or past campaign reports to identify discussion topics.",
        "Ensure analytics tool mockups or spreadsheet data sets are ready for review."
      ],
      duringInterview: [
        "Focus on how the candidate interprets conversion drops and plans experiments.",
        "Verify their copywriting logic and understanding of B2B buyer psychology."
      ],
      afterInterview: [
        "Update the scorecard immediately, citing specific examples of their campaign design patterns.",
        "Avoid making hiring recommendations based on how well-spoken the candidate is."
      ],
      decisionGuidance: [
        "Select candidates who balance creativity with rigorous tracking and analytical optimization.",
        "Ensure final selections align with the quantitative scorecard totals."
      ]
    }
  },
  "hr-recruiter": {
    roleLabel: "HR Recruiter",
    roleFamily: "HR / Talent",
    baseRoleSummary: "responsible for sourcing talent pipelines, screening candidates, managing hiring manager relationships, and coordinating structured interview loops.",
    coreResponsibilities: [
      "Source and screen potential candidates for open engineering, sales, and operations roles.",
      "Manage candidate communications and coordinate interviews across panels.",
      "Collaborate with hiring managers to clarify role requirements and success metrics.",
      "Maintain candidate pipeline tracking and status details inside the ATS.",
      "Drive hiring process consistency to ensure fair and structured evaluations."
    ],
    requiredSkills: [
      "Candidate sourcing techniques (LinkedIn Recruiter, boolean search)",
      "Screening and resume shortlisting workflows",
      "Hiring manager alignment and expectations management",
      "Hiring process organization and coordination",
      "Structured interviewing and scorecard calibration principles"
    ],
    niceToHaveSkills: [
      "Applicant Tracking System (ATS) administration",
      "Employer branding and recruitment marketing",
      "Experience running structured hiring programs"
    ],
    successMetrics: [
      "Reduces time-to-hire while maintaining high conversion ratios across pipeline stages.",
      "Ensures 100% of candidate profiles have structured scorecard notes completed.",
      "Maintains candidate satisfaction scores (NPS) through clear communication.",
      "Builds diverse talent pools for all open roles through proactive sourcing."
    ],
    interviewQuestions: [
      {
        question: "How do you clarify requirements and align expectations with a difficult hiring manager?",
        competency: "Stakeholder Management",
        whyItMatters: "Tests communication, advisory capability, and requirement validation habits.",
        strongAnswerSignals: [
          "Asks targeted questions to map real business needs vs nice-to-have requests",
          "Uses market data (compensation, availability) to calibrate expectations",
          "Establishes clear agreements on review SLAs and feedback loops"
        ],
        redFlags: [
          "Takes orders blindly without advising on market reality",
          "Becomes defensive or conflicts with managers when expectations differ"
        ],
        scoringGuidance: "Score 4-5 if candidate acts as a strategic talent advisor and detail calibration techniques.",
        biasRisk: "Low"
      },
      {
        question: "How do you decide whether a candidate should advance to the next round after a screening call?",
        competency: "Sourcing & Screening",
        whyItMatters: "Assesses evaluation consistency, screening criteria, and documentation.",
        strongAnswerSignals: [
          "Scores candidates against pre-defined role competencies, not gut feel",
          "Documents objective evidence for strengths and concerns",
          "Flags potential bias risks in early resume reviews"
        ],
        redFlags: [
          "Relies on 'cultural fit' or personal impressions to pass candidates",
          "Fails to document clear screening notes, causing panel confusion"
        ],
        scoringGuidance: "Score 4-5 if candidate uses structured rubrics and provides specific examples of objective evaluation.",
        biasRisk: "Low"
      },
      {
        question: "How do you ensure candidate communication remains consistent and professional during high-volume periods?",
        competency: "Candidate Experience",
        whyItMatters: "Measures process organization, communication habits, and brand protection.",
        strongAnswerSignals: [
          "Uses template suites for key updates while personalizing personal details",
          "Sets communication expectations early (e.g., 'feedback within 3 days')",
          "Provides constructive, empathetic feedback to rejected candidates"
        ],
        redFlags: [
          "Ghosts candidates or leaves them without updates for weeks",
          "Sends automated rejection letters with zero personalization or empathy"
        ],
        scoringGuidance: "Score 4-5 if candidate shows empathy for job seekers and manages rejection workflows professionally.",
        biasRisk: "Low"
      },
      {
        question: "Describe a time you had to deliver difficult feedback to a hiring manager about their review process.",
        competency: "Stakeholder Management",
        whyItMatters: "Tests communication courage, advisory authority, and bias mitigation.",
        strongAnswerSignals: [
          "Presents data-driven arguments (e.g., pipeline dropout rates)",
          "Explains the impact of unstructured interviewing on selection quality",
          "Offers practical solutions like scorecard calibration sessions"
        ],
        redFlags: [
          "Avoids raising concerns, allowing poor review behaviors to continue",
          "Delivers feedback aggressively without proposing improvement paths"
        ],
        scoringGuidance: "Score 4-5 if candidate uses pipeline metrics to educate managers on structured review methods.",
        biasRisk: "Low"
      },
      {
        question: "How do you organize your day when managing recruiting pipelines for multiple roles at once?",
        competency: "Execution",
        whyItMatters: "Checks time management, pipeline prioritization, and coordination efficiency.",
        strongAnswerSignals: [
          "Groups recruiting tasks (sourcing blocks, screening blocks, manager check-ins)",
          "Uses ATS automation and triggers to manage candidate progression",
          "Prioritizes roles based on impact, team size, and hiring deadlines"
        ],
        redFlags: [
          "Reacts erratically to incoming requests without maintaining calendar control",
          "Allows pipelines to bottleneck because screening tasks are unstructured"
        ],
        scoringGuidance: "Score 4-5 if candidate outlines a systematic daily calendar setup and tracks pipeline velocity.",
        biasRisk: "Low"
      },
      {
        question: "How would you design a structured interview process to make selection more consistent and fair?",
        competency: "Process Discipline",
        whyItMatters: "Evaluates knowledge of structured hiring, bias checker strategies, and scorecard setups.",
        strongAnswerSignals: [
          "Defines standard questions mapped directly to role competencies",
          "Implements calibration reviews to align all interviewers on scoring scales",
          "Ensures scorecards are completed independently before team discussions"
        ],
        redFlags: [
          "Thinks structured hiring is unnecessary or slows down execution too much",
          "Suggests hiring decisions should be based on consensus voting rather than scorecards"
        ],
        scoringGuidance: "Score 4-5 if candidate details structured hiring principles and shows how to run calibration meetings.",
        biasRisk: "Low"
      }
    ],
    scorecardCriteria: [
      {
        name: "Sourcing & Screening",
        weight: 25,
        description: "Locating qualified candidates, using search parameters, and screening for core competencies.",
        positiveSignals: [
          "Writes precise boolean queries to find targeted profiles",
          "Screens candidates against structured criteria during calls",
          "Builds pipelines for hard-to-fill technical roles"
        ],
        concernSignals: [
          "Slices search queries too broadly, delivering irrelevant leads",
          "Relies on subjective screening criteria rather than skills checks"
        ],
        scoringGuidance: "Evaluate sourcing technique, query logic, and phone screening habits."
      },
      {
        name: "Stakeholder Management",
        weight: 25,
        description: "Aligning requirements with hiring managers, managing calibration, and advising on market trends.",
        positiveSignals: [
          "Builds trust with hiring managers through regular pipeline reviews",
          "Validates role requirements constructively to guide search scope",
          "Shares market rate and candidate feedback to adjust target profiles"
        ],
        concernSignals: [
          "Fails to resolve conflicting feedback from managers, stalling pipeline",
          "Acts as a task receiver rather than a consultative hiring partner"
        ],
        scoringGuidance: "Look for stakeholder advisory capabilities and expectation alignment."
      },
      {
        name: "Process Discipline",
        weight: 20,
        description: "Adherence to structured hiring, keeping ATS pipelines clean, and enforcing scorecard compliance.",
        positiveSignals: [
          "Ensures all panel members complete scorecards on time",
          "Keeps ATS pipeline stages updated with clear notes",
          "Runs calibrated debrief sessions to make evidence-based decisions"
        ],
        concernSignals: [
          "Tolerates missing or incomplete scorecard logs across panels",
          "Allows candidate data to become stale, causing status confusion"
        ],
        scoringGuidance: "Evaluate commitment to structured hiring guidelines and pipeline monitoring."
      },
      {
        name: "Candidate Experience",
        weight: 15,
        description: "Empathetic communication, structured preparation guidelines, and prompt feedback loop management.",
        positiveSignals: [
          "Guides candidates through the interview process expectations clearly",
          "Provides constructive, respectful rejection feedback to applicants",
          "Resolves candidate scheduling issues quickly and professionally"
        ],
        concernSignals: [
          "Leaves candidates without updates for weeks or misses meetings",
          "Delivers copy-pasted rejection notices without care or context"
        ],
        scoringGuidance: "Check candidate feedback logs, communication tone, and response speed."
      },
      {
        name: "Communication",
        weight: 15,
        description: "Clarity and persuasion when writing outreach templates and pitching roles to prospects.",
        positiveSignals: [
          "Writes personalized cold outreach that gets high response rates",
          "Pitches the company mission and role growth opportunities clearly",
          "Keeps all hiring partners informed of pipeline progress"
        ],
        concernSignals: [
          "Sends generic, bulk messages that fail to engage candidates",
          "Explains role details vaguely, leading to misaligned expectations"
        ],
        scoringGuidance: "Assess written outreach quality, verbal pitch impact, and email communication."
      }
    ],
    biasRisks: [
      {
        area: "Screening",
        risk: "High",
        issue: "Evaluating candidates on 'cultural fit' or shared interests, which naturally favors profiles matching the interviewer's background.",
        saferAlternative: "Evaluate candidates on structured 'Culture Add' rubrics and specific collaboration values, using clear scorecard criteria."
      },
      {
        area: "Sourcing",
        risk: "Medium",
        issue: "Excluding candidates who took career gaps for parenting, caregiving, or health reasons.",
        saferAlternative: "Review candidates based on their current skills, projects, and screen capabilities rather than strict career continuity."
      },
      {
        area: "Interviewing",
        risk: "High",
        issue: "Allowing interviewers to share impressions before completing individual scorecards, causing herd thinking.",
        saferAlternative: "Require all panels to submit independent scorecards in the ATS before opening the calibration meeting."
      }
    ],
    evaluationGuide: {
      beforeInterview: [
        "Review the candidate's recruitment background and sourcing samples.",
        "Set clear goals for the calibration exercise, focusing on advisor traits."
      ],
      duringInterview: [
        "Take detailed notes on how they guide managers through hiring blockers.",
        "Observe if they emphasize objective screening vs gut-feel selections."
      ],
      afterInterview: [
        "Complete the scorecard immediately after the call to prevent recall decay.",
        "Focus on their structured process discipline and candidate management skills."
      ],
      decisionGuidance: [
        "Hire candidates who show strategic stakeholder management, process ownership, and empathy.",
        "Avoid choosing recruiters who rely on subjective 'feel' to select talent."
      ]
    }
  },
  "data-analyst": {
    roleLabel: "Data Analyst",
    roleFamily: "Analytics",
    baseRoleSummary: "responsible for data cleaning, SQL/spreadsheet analysis, building dashboards, and communicating business insights to cross-functional stakeholders.",
    coreResponsibilities: [
      "Collect, clean, and transform raw data from database systems for analysis.",
      "Build reports, interactive dashboards, and automated monitoring workflows.",
      "Translate ambiguous business questions into measurable analytical queries.",
      "Communicate insights and recommendations clearly to non-technical teams.",
      "Identify trends, user anomalies, and operational optimization opportunities."
    ],
    requiredSkills: [
      "Advanced SQL queries and data extraction",
      "Data cleaning and transformation workflows",
      "BI dashboard tools (Tableau, Looker, Power BI, etc.)",
      "Statistical reasoning and analytical thinking",
      "Explaining technical findings to business stakeholders"
    ],
    niceToHaveSkills: [
      "Python or R for data manipulation",
      "A/B testing and experimentation analysis",
      "Data warehousing concepts (dbt, Snowflake)"
    ],
    successMetrics: [
      "Delivers dashboard reports that lead to specific, measurable business actions.",
      "Ensures all dashboard query calculations are verified for data accuracy.",
      "Reduces dashboard load speeds through SQL query optimizations.",
      "Translates user behavior data into clear conversion optimization ideas."
    ],
    interviewQuestions: [
      {
        question: "Walk through a complex analysis you completed. What business decisions did it influence?",
        competency: "Analytical Thinking",
        whyItMatters: "Verifies problem-solving workflow, data extraction, analysis depth, and commercial translation.",
        strongAnswerSignals: [
          "Starts with the business problem, not just the code",
          "Explains data extraction, cleaning steps, and modeling decisions",
          "Connects analytical recommendations to concrete revenue or product outcomes"
        ],
        redFlags: [
          "Presents data findings without explaining the 'so what' or business value",
          "Cannot explain the data sources or logic checks used in the analysis"
        ],
        scoringGuidance: "Score 4-5 if candidate links analytical steps directly to business recommendations and outcomes.",
        biasRisk: "Low"
      },
      {
        question: "How would you investigate a sudden 15% drop in product checkout conversion rate?",
        competency: "Problem Solving",
        whyItMatters: "Tests systematic troubleshooting, data segmentation, and product reasoning.",
        strongAnswerSignals: [
          "Segments data by device, browser, region, and acquisition source",
          "Checks for technical bugs, payment failure logs, and latency spikes",
          "Details a structured step-by-step diagnostic sequence"
        ],
        redFlags: [
          "Suggests random solutions without investigating the root cause first",
          "Relies on single factors rather than segmenting across user variables"
        ],
        scoringGuidance: "Score 4-5 if candidate structures a diagnostic path, isolating technical, user UX, and external factors.",
        biasRisk: "Low"
      },
      {
        question: "How do you approach cleaning messy or incomplete datasets before starting your analysis?",
        competency: "SQL/Data Skills",
        whyItMatters: "Measures data quality awareness, integrity testing, and ETL fundamentals.",
        strongAnswerSignals: [
          "Identifies duplicate rows, missing fields, and type anomalies",
          "Explains rules for handling null values (imputation vs drop)",
          "Writes validation tests to verify transformed data integrity"
        ],
        redFlags: [
          "Ignores data errors, running calculations on raw, unvalidated tables",
          "Struggles to explain how to detect inconsistencies in customer inputs"
        ],
        scoringGuidance: "Score 4-5 if candidate demonstrates rigorous validation steps and understands data type integrity.",
        biasRisk: "Low"
      },
      {
        question: "How do you explain technical analytical findings to a completely non-technical stakeholder?",
        competency: "Insight Communication",
        whyItMatters: "Evaluates translation skill, data storytelling, and stakeholder empathy.",
        strongAnswerSignals: [
          "Avoids complex statistical terms, using visual charts instead",
          "Focuses on business outcomes (conversion, churn, cost)",
          "Asks questions to check if the stakeholder understands the data context"
        ],
        redFlags: [
          "Uses dense query code or math terms that alienate the audience",
          "Assumes stakeholders know database naming rules or calculation definitions"
        ],
        scoringGuidance: "Score 4-5 if candidate uses simple analogies, clear charts, and outlines action paths.",
        biasRisk: "Low"
      },
      {
        question: "What makes a dashboard useful for business teams instead of just visually attractive?",
        competency: "Business Understanding",
        whyItMatters: "Checks UI/UX design logic for reports, goal tracking, and information design.",
        strongAnswerSignals: [
          "Ensures the dashboard answers specific day-to-day decisions",
          "Displays key performance indicators (KPIs) at the top",
          "Includes clear documentation on how fields are defined"
        ],
        redFlags: [
          "Builds complex, cluttered dashboards with too many irrelevant charts",
          "Ignores user feedback on dashboard usability or readability"
        ],
        scoringGuidance: "Score 4-5 if candidate designs dashboards with clear user-intent pathways and filters.",
        biasRisk: "Low"
      },
      {
        question: "How do you avoid reaching misleading conclusions from limited or biased datasets?",
        competency: "Accuracy & Judgment",
        whyItMatters: "Tests statistical awareness, sampling integrity, and critical thinking.",
        strongAnswerSignals: [
          "Checks sample sizes and notes statistical confidence limits",
          "Identifies selection bias or seasonal trends in the data set",
          "Presents findings with clear assumptions and error bands"
        ],
        redFlags: [
          "Presents small data anomalies as solid proof of user trends",
          "Ignores data bias and ignores alternative hypotheses"
        ],
        scoringGuidance: "Score 4-5 if candidate shows statistical caution and documents analysis limitations.",
        biasRisk: "Low"
      }
    ],
    scorecardCriteria: [
      {
        name: "Analytical Thinking",
        weight: 30,
        description: "Breaking down complex questions, structuring hypotheses, and segmenting data tables.",
        positiveSignals: [
          "Asks clarifying questions to map business goals to data variables",
          "Segments datasets across relevant dimensions (time, user, device)",
          "Avoids confusing correlations with direct causal relationships"
        ],
        concernSignals: [
          "Jumps to conclusions without verifying alternative data paths",
          "Accepts raw averages without checking distributions or outliers"
        ],
        scoringGuidance: "Assess hypothesis structuring, data segmentation strategy, and logical reasoning."
      },
      {
        name: "SQL/Data Skills",
        weight: 25,
        description: "Mastery of relational queries, data formatting, transformations, and schema designs.",
        positiveSignals: [
          "Writes clean, readable SQL queries using CTEs and comments",
          "Handles data type transformations, joins, and aggregates correctly",
          "Optimizes query structures to run efficiently on large tables"
        ],
        concernSignals: [
          "Struggles with basic joins, aggregates, or database schemas",
          "Fails to identify or clean duplicate rows in datasets"
        ],
        scoringGuidance: "Verify SQL query structure, transformation patterns, and data accuracy habits."
      },
      {
        name: "Business Understanding",
        weight: 15,
        description: "Familiarity with company KPIs, conversion funnels, and translating data into growth recommendations.",
        positiveSignals: [
          "Knows how data findings affect company metrics (LTV, CAC, churn)",
          "Identifies key user drop-off steps in conversion funnels",
          "Suggests analysis projects based on business value potential"
        ],
        concernSignals: [
          "Treats analytics as a math task without considering company goals",
          "Suggests recommendations that are commercially impractical"
        ],
        scoringGuidance: "Evaluate metric translation, funnel logic, and product awareness."
      },
      {
        name: "Insight Communication",
        weight: 15,
        description: "Explaining database discoveries using dashboard designs, storytelling, and reports.",
        positiveSignals: [
          "Creates clear, uncluttered dashboard views tailored to users",
          "Uses data stories that lead directly to strategic actions",
          "Explains technical database queries simply to business partners"
        ],
        concernSignals: [
          "Presents raw tables or chaotic charts without explanation",
          "Relies on technical terminology that confuses business stakeholders"
        ],
        scoringGuidance: "Check dashboard layout choice, presentation style, and reporting simplicity."
      },
      {
        name: "Accuracy & Judgment",
        weight: 15,
        description: "Verifying calculations, noting sample size limits, and identifying potential data errors.",
        positiveSignals: [
          "Performs query integrity checks before delivering dashboards",
          "Communicates confidence levels and sample size constraints",
          "Identifies database logging bugs that skew query results"
        ],
        concernSignals: [
          "Delivers reports containing mathematical errors or broken links",
          "Ignores data issues, leading to false findings"
        ],
        scoringGuidance: "Evaluate data validation rigor, statistical caution, and QA practices."
      }
    ],
    biasRisks: [
      {
        area: "Screening",
        risk: "Medium",
        issue: "Filtering candidates based on their mastery of specific proprietary tools (e.g. Looker vs Tableau) rather than analytical fundamentals.",
        saferAlternative: "Evaluate transferable skills in SQL query logic, data transformations, and data visualization best practices."
      },
      {
        area: "Coding Tests",
        risk: "High",
        issue: "Evaluating candidates on their speed in solving complex, timed SQL puzzles that do not match daily business reporting tasks.",
        saferAlternative: "Provide a mock database dataset and evaluate their ability to write clean queries and explain insights."
      },
      {
        area: "Sourcing",
        risk: "Low",
        issue: "Preferring candidates with advanced mathematics degrees, which biases against self-taught analysts or career-switchers.",
        saferAlternative: "Review practical analysis portfolios, SQL script examples, and business dashboard designs."
      }
    ],
    evaluationGuide: {
      beforeInterview: [
        "Review the candidate's analysis portfolio or GitHub SQL repositories.",
        "Ensure the SQL compiler sandbox or database datasets are configured for the session."
      ],
      duringInterview: [
        "Observe how they explain data extraction choices and validate datasets.",
        "Take detailed notes on their SQL query cleanliness and indexing reasoning."
      ],
      afterInterview: [
        "Update the scorecard immediately, citing specific examples of their query architecture.",
        "Avoid letting the candidate's visual slides overshadow their SQL accuracy."
      ],
      decisionGuidance: [
        "Hire analysts who show SQL precision, statistical caution, and excellent stakeholder communication.",
        "Compare scorecard criteria scores objectively before confirming selection."
      ]
    }
  }
};
