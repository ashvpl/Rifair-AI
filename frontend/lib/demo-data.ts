export interface CandidateScore {
  overall: number;
  relevance: number;
  experience: number;
  behavior: number;
  trust: number;
  availability: number;
  shipper: number;
}

export interface Candidate {
  id: string;
  rank: number;
  name: string;
  currentTitle: string;
  yearsExperience: number;
  industry: string;
  location: string;
  scores: CandidateScore;
  explainability: {
    strengths: string[];
    weaknesses: string[];
    missingRequirements: string[];
    behavioralInsights: string[];
    trustIndicators: string[];
  };
  authenticity: {
    score: number;
    timelineValidation: 'Verified' | 'Warning' | 'High Risk';
    skillValidation: 'Verified' | 'Warning' | 'High Risk';
    careerConsistency: 'Verified' | 'Warning' | 'High Risk';
    honeypotRisk: 'Verified' | 'Warning' | 'High Risk';
  };
  behavior: {
    recruiterResponseRate: string;
    interviewCompletionRate: string;
    lastActive: string;
    githubActivity: string;
    openToWorkStatus: string;
  };
}

export const DEMO_JD = {
  role: "Senior AI Engineer",
  experience: "5-9 Years",
  requiredSkills: [
    "Python",
    "Embeddings",
    "Vector Databases",
    "Retrieval Systems",
    "Evaluation Metrics"
  ],
  startupProductFit: "High",
  disqualifiers: [
    "Pure Research",
    "Keyword Stuffing",
    "Consulting-only Profiles"
  ]
};

export const DEMO_CANDIDATES: Candidate[] = [
  {
    id: "CAND-8941",
    rank: 1,
    name: "Alex M.",
    currentTitle: "Staff AI Engineer",
    yearsExperience: 7,
    industry: "B2B SaaS",
    location: "San Francisco, CA",
    scores: {
      overall: 94,
      relevance: 96,
      experience: 92,
      behavior: 95,
      trust: 98,
      availability: 90,
      shipper: 93
    },
    explainability: {
      strengths: [
        "Strong retrieval systems experience in production",
        "Product engineering background with 3 successful launches",
        "Deep expertise in Pinecone and Qdrant"
      ],
      weaknesses: [
        "Slightly lighter on pure ML infrastructure scaling"
      ],
      missingRequirements: [],
      behavioralInsights: [
        "High recruiter response rate (98%)",
        "Consistent history of long tenures (avg 3.5 years)"
      ],
      trustIndicators: [
        "Low honeypot risk",
        "Verified GitHub contributions matching resume timeline"
      ]
    },
    authenticity: {
      score: 98,
      timelineValidation: "Verified",
      skillValidation: "Verified",
      careerConsistency: "Verified",
      honeypotRisk: "Verified"
    },
    behavior: {
      recruiterResponseRate: "95%",
      interviewCompletionRate: "100%",
      lastActive: "2 days ago",
      githubActivity: "High (240 commits/mo)",
      openToWorkStatus: "Actively Looking"
    }
  },
  {
    id: "CAND-3205",
    rank: 2,
    name: "Sarah K.",
    currentTitle: "Senior Machine Learning Engineer",
    yearsExperience: 6,
    industry: "Consumer Tech",
    location: "New York, NY",
    scores: {
      overall: 91,
      relevance: 94,
      experience: 88,
      behavior: 90,
      trust: 96,
      availability: 95,
      shipper: 89
    },
    explainability: {
      strengths: [
        "Excellent Python and PyTorch skills",
        "Built custom RAG pipelines from scratch",
        "Strong evaluation metrics understanding (NDCG, MAP)"
      ],
      weaknesses: [
        "Most experience is in larger teams, less '0 to 1' startup experience"
      ],
      missingRequirements: [],
      behavioralInsights: [
        "Very active on the platform recently",
        "High interview completion rate"
      ],
      trustIndicators: [
        "Endorsements from known industry leaders",
        "Consistent job titles across platforms"
      ]
    },
    authenticity: {
      score: 96,
      timelineValidation: "Verified",
      skillValidation: "Verified",
      careerConsistency: "Verified",
      honeypotRisk: "Verified"
    },
    behavior: {
      recruiterResponseRate: "88%",
      interviewCompletionRate: "90%",
      lastActive: "4 hours ago",
      githubActivity: "Medium (45 commits/mo)",
      openToWorkStatus: "Casually Looking"
    }
  },
  {
    id: "CAND-1192",
    rank: 3,
    name: "James L.",
    currentTitle: "Lead AI Systems Engineer",
    yearsExperience: 8,
    industry: "FinTech",
    location: "Remote (US)",
    scores: {
      overall: 89,
      relevance: 90,
      experience: 95,
      behavior: 82,
      trust: 91,
      availability: 85,
      shipper: 88
    },
    explainability: {
      strengths: [
        "Deep expertise in vector databases (Milvus, Weaviate)",
        "Strong system architecture skills",
        "Experience leading small, fast-moving teams"
      ],
      weaknesses: [
        "Some short tenures early in career",
        "Has not used the specific evaluation frameworks mentioned in JD"
      ],
      missingRequirements: [
        "Specific advanced evaluation metrics experience not clearly demonstrated"
      ],
      behavioralInsights: [
        "Slightly lower response rate to cold outreach",
        "Highly selective in interviews"
      ],
      trustIndicators: [
        "Verified work history",
        "Public speaking engagements align with claimed skills"
      ]
    },
    authenticity: {
      score: 92,
      timelineValidation: "Verified",
      skillValidation: "Warning",
      careerConsistency: "Verified",
      honeypotRisk: "Verified"
    },
    behavior: {
      recruiterResponseRate: "65%",
      interviewCompletionRate: "100%",
      lastActive: "1 week ago",
      githubActivity: "Low (Internal repos mostly)",
      openToWorkStatus: "Not Looking"
    }
  },
  {
    id: "CAND-9934",
    rank: 4,
    name: "Priya R.",
    currentTitle: "AI Researcher -> Product Engineer",
    yearsExperience: 5,
    industry: "AI Startup",
    location: "London, UK",
    scores: {
      overall: 87,
      relevance: 85,
      experience: 80,
      behavior: 98,
      trust: 94,
      availability: 99,
      shipper: 82
    },
    explainability: {
      strengths: [
        "Cutting-edge knowledge of embeddings and LLMs",
        "Recent transition to product-focused roles shows high adaptability",
        "Excellent Python fundamentals"
      ],
      weaknesses: [
        "Borderline on 'Pure Research' disqualifier, but shows recent product shift",
        "Less years of production engineering compared to peers"
      ],
      missingRequirements: [],
      behavioralInsights: [
        "Extremely responsive",
        "High engagement with startup opportunities"
      ],
      trustIndicators: [
        "Highly verified academic and recent startup history"
      ]
    },
    authenticity: {
      score: 95,
      timelineValidation: "Verified",
      skillValidation: "Verified",
      careerConsistency: "Warning",
      honeypotRisk: "Verified"
    },
    behavior: {
      recruiterResponseRate: "99%",
      interviewCompletionRate: "95%",
      lastActive: "Just now",
      githubActivity: "Very High (400+ commits/mo)",
      openToWorkStatus: "Actively Looking"
    }
  },
  {
    id: "CAND-4421",
    rank: 5,
    name: "David T.",
    currentTitle: "Senior Backend Engineer",
    yearsExperience: 9,
    industry: "E-commerce",
    location: "Austin, TX",
    scores: {
      overall: 84,
      relevance: 80,
      experience: 98,
      behavior: 85,
      trust: 99,
      availability: 70,
      shipper: 95
    },
    explainability: {
      strengths: [
        "Incredible backend scaling experience",
        "Strong 'shipper' mentality, known for delivering fast",
        "Solid Python background"
      ],
      weaknesses: [
        "AI/ML experience is more recent and less deep than top candidates",
        "Vector DB experience is limited to POCs"
      ],
      missingRequirements: [
        "Deep production Vector Database experience"
      ],
      behavioralInsights: [
        "Stable career, rarely looks for jobs",
        "Low availability signal"
      ],
      trustIndicators: [
        "Highly verifiable, long-term employment history"
      ]
    },
    authenticity: {
      score: 99,
      timelineValidation: "Verified",
      skillValidation: "Verified",
      careerConsistency: "Verified",
      honeypotRisk: "Verified"
    },
    behavior: {
      recruiterResponseRate: "40%",
      interviewCompletionRate: "100%",
      lastActive: "3 weeks ago",
      githubActivity: "Medium (Private repos)",
      openToWorkStatus: "Not Looking"
    }
  }
];

export const DEMO_RANKING_METHODOLOGY = [
  { name: "Relevance", weight: 40, color: "bg-blue-500", description: "Semantic match against JD requirements" },
  { name: "Experience", weight: 20, color: "bg-indigo-500", description: "Years of relevant production experience" },
  { name: "Behavioral", weight: 15, color: "bg-purple-500", description: "Responsiveness and engagement signals" },
  { name: "Shipper Score", weight: 10, color: "bg-emerald-500", description: "Evidence of building and shipping products" },
  { name: "Trust Score", weight: 10, color: "bg-amber-500", description: "Authenticity and anti-fraud validation" },
  { name: "Availability", weight: 5, color: "bg-rose-500", description: "Current job seeking status and activity" }
];
