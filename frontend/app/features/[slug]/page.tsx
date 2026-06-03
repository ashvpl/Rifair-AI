import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import Image from "next/image";
import { NavBarDemo } from "@/components/ui/navbar-demo";
import FooterSection from "@/components/ui/footer-section";
import { Button } from "@/components/ui/button";
import { CheckCircle, ShieldAlert, Sparkles, Check, ArrowRight, Play, FileText, BarChart3, Edit3 } from "lucide-react";
import { FEATURE_RELATED_BLOG_PREVIEWS } from "@/lib/site-images";

// Types for feature details
interface Step {
  title: string;
  desc: string;
}

interface UseCase {
  title: string;
  desc: string;
  role: string;
}

interface Testimonial {
  text: string;
  author: string;
  role: string;
  company: string;
}

interface FeatureData {
  slug: string;
  toolName: string;
  h1: string;
  subheadline: string;
  ctaText: string;
  dashboardRoute: string;
  metaTitle: string;
  metaDesc: string;
  problemTitle: string;
  problems: string[];
  solutionTitle: string;
  solutions: string[];
  stepsTitle: string;
  steps: Step[];
  useCasesTitle: string;
  useCases: UseCase[];
  testimonials: Testimonial[];
  outcomeName: string;
  gradientFrom: string;
  gradientTo: string;
}

// Data mapping for the 4 tools
const FEATURES_MAP: Record<string, FeatureData> = {
  "interview-kit-generator": {
    slug: "interview-kit-generator",
    toolName: "AI Interview Kit Generator",
    h1: "AI Interview Kit Generator | Create Structured Interviews in Seconds",
    subheadline: "Stop using unstructured interviews. Generate bias-free, role-specific interview kits in 30 seconds with AI.",
    ctaText: "Generate Interview Kit Now",
    dashboardRoute: "/kit",
    metaTitle: "AI Interview Kit Generator for Recruiters | Rifair AI",
    metaDesc: "Generate structured interview kits, role-specific questions, evaluation criteria, and candidate scorecards in seconds with AI. Try free for 14 days.",
    problemTitle: "The Problem with Unstructured Interviews",
    problems: [
      "Unstructured interviews lack standardized questions, leading to inconsistent candidate evaluations.",
      "Without clear rubrics, interviewer bias drives hiring decisions rather than real talent [shrm:1].",
      "Drafting role-specific questions and scorecards manually consumes 2 to 3 hours per role.",
    ],
    solutionTitle: "How Rifair AI Solves This",
    solutions: [
      "Define job parameters, seniorities, and core competencies in a simple interface.",
      "Our AI builds role-aligned structured questions and evaluation rubrics.",
      "Get a ready-to-use candidate scorecard with a 5-point rating scale.",
    ],
    stepsTitle: "How the Interview Kit Generator Works",
    steps: [
      { title: "Input Role & Competencies", desc: "Select target seniority, job titles, and essential skills from a checklist." },
      { title: "AI Compiles Structured Questions", desc: "Our engine processes job criteria to create competency-focused questions." },
      { title: "Establish 5-Point Scoring Rubric", desc: "Get detailed, objective criteria for grading candidate answers." },
      { title: "Export and Sync", desc: "Instantly share the generated scorecard with your interview panel." },
    ],
    useCasesTitle: "Who Uses the Interview Kit Generator?",
    useCases: [
      { title: "Hiring engineering/product first", desc: "Establish high-quality, standardized questions for early technical roles.", role: "Startup Founders" },
      { title: "Standardizing interview panels", desc: "Ensure all 5+ hiring managers grade candidates using identical guidelines.", role: "HR Generalists" },
      { title: "Screening candidate pools", desc: "Rapidly evaluate dozens of applicants with consistent, objective scorecards.", role: "Technical Recruiters" },
    ],
    testimonials: [
      {
        text: "Rifair AI cut our interview prep time by 70% and helped us hire 3x faster with standardized rubrics.",
        author: "Sarah Jenkins",
        role: "Head of Talent",
        company: "Veloce Technologies",
      }
    ],
    outcomeName: "fair, structured interviews",
    gradientFrom: "from-emerald-500",
    gradientTo: "to-cyan-500",
  },
  "bias-checker": {
    slug: "bias-checker",
    toolName: "Interview Question Bias Checker",
    h1: "Interview Question Bias Checker | Detect Hidden Hiring Biases",
    subheadline: "Detect and fix biased, unfair, or irrelevant interview questions before candidates hear them.",
    ctaText: "Check Question Bias Now",
    dashboardRoute: "/analyze",
    metaTitle: "Interview Question Bias Checker | Rifair AI",
    metaDesc: "Identify biased or gender-coded questions in your hiring process. Replace them with fair, skills-focused alternatives with AI. Try free.",
    problemTitle: "The Problem with Hidden Bias",
    problems: [
      "48% of HR managers admit that unconscious bias affects their hiring outcomes [shrm:1].",
      "Accidental personal questions (family, age, culture fit) create significant compliance risks.",
      "Gender-coded or culture-biased wording alienates diverse candidates early in the funnel.",
    ],
    solutionTitle: "How Rifair AI Solves This",
    solutions: [
      "Paste your existing interview questions into the bias analysis panel.",
      "The bias checker highlights cultural, gender, work-life, or age-based bias.",
      "Get direct recommendations and rewritten, objective alternatives.",
    ],
    stepsTitle: "How the Bias Checker Works",
    steps: [
      { title: "Input Questions", desc: "Paste questions from your interview script or text templates into the checker." },
      { title: "AI Scans for Risk", desc: "Our engine reviews wording against compliance and ethical hiring frameworks." },
      { title: "Identify Bias Types", desc: "Get flagged reports categorized by gender, age, or background indicators." },
      { title: "Apply Fair Alternatives", desc: "Instantly copy optimized, skills-focused rewrites to keep grading objective." },
    ],
    useCasesTitle: "Who Uses the Bias Checker?",
    useCases: [
      { title: "Ethical scaling workflows", desc: "Train interviewers and audit question sets to eliminate demographic filters.", role: "HR Leaders" },
      { title: "Neutral early screenings", desc: "Remove age or cultural bias indicators from initial recruitment scripts.", role: "Technical Recruiters" },
      { title: "Fair candidate experiences", desc: "Build inclusive question scripts to attract top-tier underrepresented groups.", role: "Hiring Managers" },
    ],
    testimonials: [
      {
        text: "Using the Bias Checker helped us identify and fix 34% of questions that were pushing away great candidates.",
        author: "David Vance",
        role: "Director of People",
        company: "Ascent Digital",
      }
    ],
    outcomeName: "bias-free interview questions",
    gradientFrom: "from-purple-500",
    gradientTo: "to-indigo-500",
  },
  "job-description-optimizer": {
    slug: "job-description-optimizer",
    toolName: "AI Job Description Optimizer",
    h1: "AI Job Description Optimizer | Write Clear, Inclusive Job Ads",
    subheadline: "Optimize job descriptions for clarity, inclusivity, required skills, and candidate relevance with AI.",
    ctaText: "Optimize Job Description Now",
    dashboardRoute: "/jd-analyser",
    metaTitle: "AI Job Description Optimizer for Hiring Teams | Rifair AI",
    metaDesc: "Write clear, inclusive, and bias-free job descriptions. Improve candidate applicant quality in seconds using AI. Try free for 14 days.",
    problemTitle: "The Problem with Standard Job Descriptions",
    problems: [
      "Overloaded skill checklists discourage highly qualified female and minority candidates.",
      "Vague job descriptions fail to clearly state core expectations, leading to misaligned resumes.",
      "Gender-biased language (e.g. hyper-masculine 'rockstar') reduces overall application rates.",
    ],
    solutionTitle: "How Rifair AI Solves This",
    solutions: [
      "Upload or paste your current job draft for instantaneous evaluation.",
      "AI flags unrealistic credential demands and clarifies necessary skills.",
      "Get an optimized, highly readable, structured, and inclusive JD.",
    ],
    stepsTitle: "How the JD Optimizer Works",
    steps: [
      { title: "Paste Your JD Draft", desc: "Submit your current draft of roles, qualifications, and tasks." },
      { title: "AI Optimizes Structure", desc: "Our models categorize skills, isolate core demands, and improve layout." },
      { title: "Bias Scan & Rewording", desc: "Flags exclusionary descriptors and suggests neutral, inviting terminology." },
      { title: "Publish Optimized Job Ad", desc: "Export the clean text to job boards and watch applicant conversion double." },
    ],
    useCasesTitle: "Who Uses the JD Optimizer?",
    useCases: [
      { title: "Sourcing talent with clarity", desc: "Define precise technical skills without overwhelming lists of credentials.", role: "Startups & Founders" },
      { title: "Building inclusive pipeline", desc: "Eliminate exclusionary terms to increase female applicant count by 30%.", role: "HR generalists" },
      { title: "Aligning roles on teams", desc: "Create uniform JD templates across departments for consistent hiring specs.", role: "Recruiter Heads" },
    ],
    testimonials: [
      {
        text: "Our JDs are much cleaner and focus strictly on skills. We saw a 45% increase in high-quality applications.",
        author: "Marcus Aureli",
        role: "Co-Founder",
        company: "Stasis Capital",
      }
    ],
    outcomeName: "optimized, inclusive job descriptions",
    gradientFrom: "from-blue-500",
    gradientTo: "to-teal-500",
  },
  "candidate-evaluation": {
    slug: "candidate-evaluation",
    toolName: "Candidate Evaluation Scorecard",
    h1: "AI Candidate Evaluation Scorecard | Structured Interview Grading",
    subheadline: "Evaluate candidates fairly with role-specific scorecards, scoring criteria, and consistent grading rubrics.",
    ctaText: "Create Evaluation Scorecard",
    dashboardRoute: "/evaluations",
    metaTitle: "AI Candidate Evaluation Assistant for Recruiters | Rifair AI",
    metaDesc: "Grade candidates objectively. Set standardized scoring criteria, rubrics, and feedback flows with Rifair AI. Try free.",
    problemTitle: "The Problem with Subjective Evaluations",
    problems: [
      "Hiring decisions are often made based on 'gut feeling' rather than skills scorecards.",
      "Scattershot feedback ('seemed nice', 'culture fit') makes candidate comparison impossible.",
      "Inconsistent panel reviews create massive confusion and delay time-to-offer.",
    ],
    solutionTitle: "How Rifair AI Solves This",
    solutions: [
      "Generate structured scorecards aligned to the role's primary requirements.",
      "Give panel interviewers specific guidelines for grading answers (1-5 scale).",
      "Compile feedback into a single dashboard view to compare candidates on skill.",
    ],
    stepsTitle: "How the Candidate Scorecard Works",
    steps: [
      { title: "Define Scorecard Metrics", desc: "Input job role, competencies, and interview round type." },
      { title: "Generate Grading Rubrics", desc: "Create distinct score metrics for technical, soft, and experience fits." },
      { title: "Conduct Structured Reviews", desc: "Interviewers grade candidates based on clear evidence guidelines." },
      { title: "Compare & Hire", desc: "View the side-by-side competency comparisons to make objective decisions." },
    ],
    useCasesTitle: "Who Uses Candidate Scorecards?",
    useCases: [
      { title: "Unbiased panel review", desc: "Compare candidate capability side-by-side using numerical criteria grids.", role: "Startups & Founders" },
      { title: "Standardizing feedback loops", desc: "Ensure every panel interviewer uploads structured feedback reports.", role: "HR Generalists" },
      { title: "Mitigating legal hire risk", desc: "Keep documented evidence of skills evaluations for compliance.", role: "Recruiter Directors" },
    ],
    testimonials: [
      {
        text: "Rifair AI's scorecards completely removed gut-feel arguments from our candidate review meetings.",
        author: "Emily Watson",
        role: "Recruiting Manager",
        company: "Novus Growth Partners",
      }
    ],
    outcomeName: "consistent, fair candidate evaluations",
    gradientFrom: "from-pink-500",
    gradientTo: "to-rose-500",
  },
};

// Generate metadata for each dynamic slug
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const resolvedParams = await params;
  const data = FEATURES_MAP[resolvedParams.slug];
  if (!data) return {};

  return {
    title: data.metaTitle,
    description: data.metaDesc,
    alternates: {
      canonical: `https://rifairai.com/features/${resolvedParams.slug}`,
    },
    openGraph: {
      title: data.metaTitle,
      description: data.metaDesc,
      url: `https://rifairai.com/features/${resolvedParams.slug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: data.metaTitle,
      description: data.metaDesc,
    },
  };
}

// SSG Pre-rendering Paths
export async function generateStaticParams() {
  return Object.keys(FEATURES_MAP).map((slug) => ({ slug }));
}

export default async function FeaturePage({ params }: { params: { slug: string } }) {
  const resolvedParams = await params;
  const data = FEATURES_MAP[resolvedParams.slug];
  if (!data) {
    notFound();
  }

  const { userId } = await auth();
  
  // Route CTAs based on login status
  const ctaLink = userId 
    ? data.dashboardRoute 
    : `/signup?redirect_url=${encodeURIComponent(data.dashboardRoute)}&tool=${data.slug}&utm_source=landing&utm_medium=cta&utm_campaign=${data.slug}`;

  // JSON-LD SoftwareApplication schema markup
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": data.toolName,
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "14-day free trial"
    },
    "provider": {
      "@type": "Organization",
      "name": "Rifair AI",
      "url": "https://rifairai.com"
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F7] font-sans selection:bg-primary/20 selection:text-primary transition-colors duration-500">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NavBarDemo />

      <main className="flex-1 pt-24 md:pt-32">
        
        {/* Above the Fold: Hero Section */}
        <section className="px-6 lg:px-12 py-16 lg:py-24 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 md:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 text-xs font-bold uppercase tracking-wider text-black/60">
              <Sparkles className="w-3.5 h-3.5" />
              SaaS Hiring Intelligence
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#1D1D1F] tracking-tight leading-tight">
              {data.h1}
            </h1>
            <p className="text-[#86868B] text-lg font-medium leading-relaxed max-w-xl">
              {data.subheadline}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href={ctaLink}>
                <Button className={`font-bold bg-gradient-to-r ${data.gradientFrom} ${data.gradientTo} text-white border-0 shadow-xl rounded-full px-8 py-6 text-base hover:scale-105 active:scale-95 transition-all`}>
                  {data.ctaText}
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="outline" className="font-bold border-2 border-black rounded-full px-8 py-6 text-base bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
                  See How It Works
                </Button>
              </a>
            </div>
            <p className="text-xs text-black/40 font-bold uppercase tracking-widest pl-2">
              No credit card required • 14-day free trial
            </p>
          </div>

          {/* Premium CSS Mockup of the tool interface */}
          <div className="relative group w-full">
            <div className="absolute inset-0 bg-gradient-to-r from-black/5 to-black/10 blur-xl opacity-30 rounded-3xl" />
            <div className="relative bg-white border-2 border-black rounded-[2.5rem] shadow-[12px_12px_0px_rgba(0,0,0,1)] overflow-hidden">
              {/* Interface Header */}
              <div className="bg-[#101012] text-white px-6 py-4 flex items-center justify-between border-b-2 border-black">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-xs font-mono text-white/50 ml-2">rifair.ai/app/{data.slug}</span>
                </div>
                <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Active Session
                </div>
              </div>

              {/* Mockup Body */}
              <div className="p-6 md:p-8 bg-[#F5F5F7] min-h-[300px] flex flex-col justify-between">
                {data.slug === "interview-kit-generator" && (
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-sm space-y-3">
                      <div className="h-4 w-1/4 bg-black/10 rounded-full" />
                      <div className="h-6 w-3/4 bg-black/5 rounded-md" />
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-sm space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="h-4 w-1/3 bg-black/10 rounded-full" />
                        <div className="h-5 w-12 bg-green-100 text-green-700 rounded-full text-[10px] font-bold flex items-center justify-center">98% Fit</div>
                      </div>
                      <div className="h-3 w-full bg-black/5 rounded-full" />
                      <div className="h-3 w-5/6 bg-black/5 rounded-full" />
                    </div>
                    <div className="p-4 bg-white rounded-2xl border border-black/5 flex items-center justify-between">
                      <span className="text-xs font-bold text-black/60">Evaluation Scorecard generated.</span>
                      <span className="text-xs font-bold text-[#059669]">Download PDF →</span>
                    </div>
                  </div>
                )}

                {data.slug === "bias-checker" && (
                  <div className="space-y-4">
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-red-500 uppercase tracking-widest">
                        <ShieldAlert className="w-4 h-4" /> Flagged Bias Wording
                      </div>
                      <p className="text-sm font-medium text-black/80">&quot;Are you willing to sacrifice work-life balance for project deadlines?&quot;</p>
                    </div>
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-green-600 uppercase tracking-widest">
                        <CheckCircle className="w-4 h-4" /> Suggested Rewrite
                      </div>
                      <p className="text-sm font-bold text-black">&quot;How do you prioritize competing tasks during tight product cycles?&quot;</p>
                    </div>
                  </div>
                )}

                {data.slug === "job-description-optimizer" && (
                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded-2xl border border-black/5 space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="h-4 w-1/3 bg-black/10 rounded-full" />
                        <div className="h-5 w-16 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold flex items-center justify-center">Optimized</div>
                      </div>
                      <p className="text-xs font-medium text-black/60">Removed gender-biased phrases (e.g. rockstar developer, ninja coder). Trimmed required credentials checklist by 40%.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-emerald-50 rounded-xl text-center border border-emerald-100">
                        <div className="text-xs font-black text-emerald-800">Inclusivity Score</div>
                        <div className="text-2xl font-black text-emerald-600 mt-1">96%</div>
                      </div>
                      <div className="p-3 bg-indigo-50 rounded-xl text-center border border-indigo-100">
                        <div className="text-xs font-black text-indigo-800">Readability Scale</div>
                        <div className="text-2xl font-black text-indigo-600 mt-1">Grade 9</div>
                      </div>
                    </div>
                  </div>
                )}

                {data.slug === "candidate-evaluation" && (
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-sm space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="font-bold text-xs">Technical Assessment</div>
                        <div className="text-xs font-bold text-black/50">Score: 4.5/5</div>
                      </div>
                      <div className="grid grid-cols-5 gap-1.5">
                        <div className="h-2 bg-emerald-500 rounded-full" />
                        <div className="h-2 bg-emerald-500 rounded-full" />
                        <div className="h-2 bg-emerald-500 rounded-full" />
                        <div className="h-2 bg-emerald-500 rounded-full" />
                        <div className="h-2 bg-black/10 rounded-full" />
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-sm space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="font-bold text-xs">Communication Skill</div>
                        <div className="text-xs font-bold text-black/50">Score: 5/5</div>
                      </div>
                      <div className="grid grid-cols-5 gap-1.5">
                        <div className="h-2 bg-emerald-500 rounded-full" />
                        <div className="h-2 bg-emerald-500 rounded-full" />
                        <div className="h-2 bg-emerald-500 rounded-full" />
                        <div className="h-2 bg-emerald-500 rounded-full" />
                        <div className="h-2 bg-emerald-500 rounded-full" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-black/40 font-mono mt-6 pt-4 border-t border-black/5">
                  <div className="flex items-center gap-1">
                    <Play className="w-3.5 h-3.5 fill-current" /> Auto-sync enabled
                  </div>
                  <span>Rev: 1.0.4</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Problem -> Solution */}
        <section className="py-20 lg:py-28 px-6 lg:px-12 bg-white border-y border-black/[0.03]">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
            
            {/* Problem side */}
            <div className="space-y-6">
              <h2 className="text-2xl md:text-3xl font-black text-[#1D1D1F] tracking-tight">
                {data.problemTitle}
              </h2>
              <div className="space-y-4">
                {data.problems.map((prob, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                      <span className="text-red-600 text-xs font-bold">×</span>
                    </div>
                    <p className="text-[#86868B] text-sm font-medium leading-relaxed">
                      {prob}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Solution side */}
            <div className="space-y-6">
              <h2 className="text-2xl md:text-3xl font-black text-[#1D1D1F] tracking-tight">
                {data.solutionTitle}
              </h2>
              <div className="space-y-4">
                {data.solutions.map((sol, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                      <span className="text-green-600 text-xs font-bold">✓</span>
                    </div>
                    <p className="text-[#86868B] text-sm font-medium leading-relaxed">
                      {sol}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* Section 3: How It Works */}
        <section id="how-it-works" className="py-20 lg:py-28 px-6 lg:px-12 max-w-7xl mx-auto space-y-12 md:space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-black text-[#1D1D1F] tracking-tight">
              {data.stepsTitle}
            </h2>
            <p className="text-[#86868B] text-lg font-medium max-w-2xl mx-auto">
              Our streamlined AI engines handle the prep so your hiring managers can focus purely on talent.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {data.steps.map((step, idx) => (
              <div
                key={idx}
                className="bg-white border-2 border-black p-6 rounded-3xl shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all duration-300 relative flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <span className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-black text-white border-2 border-white flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </span>
                  <h3 className="text-base font-black text-[#1D1D1F] tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-[#86868B] text-xs leading-relaxed font-medium">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Use Cases */}
        <section className="py-20 lg:py-28 px-6 lg:px-12 bg-white border-y border-black/[0.03]">
          <div className="max-w-7xl mx-auto space-y-12 md:space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-black text-[#1D1D1F] tracking-tight">
                {data.useCasesTitle}
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {data.useCases.map((uc, idx) => (
                <div
                  key={idx}
                  className="bg-[#F5F5F7] border border-black/5 p-8 rounded-3xl space-y-4 hover:border-black/20 transition-colors"
                >
                  <span className="px-3 py-1 bg-black/5 rounded-full text-xs font-bold text-black/60 uppercase tracking-widest">
                    {uc.role}
                  </span>
                  <h3 className="text-lg font-black text-[#1D1D1F]">
                    {uc.title}
                  </h3>
                  <p className="text-[#86868B] text-sm leading-relaxed font-medium">
                    {uc.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 5: Testimonials / Trust */}
        <section className="py-20 lg:py-28 px-6 lg:px-12 max-w-5xl mx-auto text-center space-y-8">
          <h2 className="text-[11px] font-black text-black/50 uppercase tracking-[0.3em]">
            Trusted by hiring panels globally
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {data.testimonials.map((test, idx) => (
              <div key={idx} className="space-y-4">
                <p className="text-xl md:text-2xl font-medium italic text-black/85 leading-relaxed">
                  &quot;{test.text}&quot;
                </p>
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center font-bold text-sm">
                    {test.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="text-left text-xs font-bold leading-none">
                    <div className="text-black">{test.author}</div>
                    <div className="text-black/50 mt-1">{test.role}, {test.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 6: Internal Links to Related Blogs */}
        <section className="py-20 lg:py-28 px-6 lg:px-12 bg-white border-t border-black/[0.03]">
          <div className="max-w-7xl mx-auto space-y-12">
            <h2 className="text-2xl md:text-3xl font-black text-[#1D1D1F] text-center tracking-tight">
              Learn More About Fair Hiring
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {FEATURE_RELATED_BLOG_PREVIEWS.map((blog, idx) => (
                <Link
                  key={idx}
                  href={`/blog/${blog.slug}`}
                  className="group bg-[#F5F5F7] border border-black/5 rounded-3xl flex flex-col overflow-hidden hover:border-black/20 hover:shadow-md transition-all duration-300"
                >
                  <div className="relative w-full h-40 overflow-hidden">
                    <Image
                      src={blog.src}
                      alt={blog.alt}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <span className="absolute bottom-3 left-4 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-bold text-black/80 uppercase tracking-wider">
                      {blog.category}
                    </span>
                  </div>
                  <div className="p-6 flex flex-col flex-1 justify-between space-y-3">
                    <h4 className="text-base font-black text-[#1D1D1F] tracking-tight group-hover:text-primary transition-colors">
                      {blog.title}
                    </h4>
                    <span className="text-xs font-bold text-black hover:underline">
                      Read Guide →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Section 7: Final CTA Section */}
        <section className="py-20 lg:py-28 px-6 lg:px-12 bg-[#F5F5F7]">
          <div className="max-w-4xl mx-auto rounded-[3rem] bg-[#101012] text-white p-8 md:p-16 border border-white/10 text-center relative overflow-hidden shadow-2xl">
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                background: "radial-gradient(circle at 50% 50%, #6366f1 0%, transparent 60%)",
              }}
            />
            <div className="relative z-10 space-y-6">
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                Ready to build {data.outcomeName}?
              </h2>
              <p className="text-white/60 font-medium text-base md:text-lg max-w-xl mx-auto">
                Join 500+ HR teams and fast-growing hiring panels using Rifair AI for objective, skills-first recruitment.
              </p>
              <div className="pt-4">
                <Link href={ctaLink}>
                  <Button className={`bg-gradient-to-r ${data.gradientFrom} ${data.gradientTo} text-white font-bold px-8 py-6 rounded-full text-base border-0 hover:scale-105 active:scale-95 transition-all shadow-xl`}>
                    Try {data.toolName} Free
                  </Button>
                </Link>
              </div>
              <p className="text-xs text-white/40 uppercase tracking-widest font-bold">
                No credit card required • 14-day free trial
              </p>
            </div>
          </div>
        </section>

      </main>
      <FooterSection />
    </div>
  );
}
