"use client";

import React, { useState } from "react";
import { ArrowRight, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { RifairCoreFeatures } from "@/components/ui/rifair-features";
import { InteractiveAccordion } from "@/components/ui/interactive-image-accordion";
import { BlurTextAnimation } from "@/components/ui/blur-text-animation";
import { HeroSection2 } from "@/components/ui/hero-section-2";
import FooterSection from "@/components/ui/footer-section";
import { TestimonialsSection } from "@/components/ui/testimonial-v2";
import { IntroVideoSection } from "@/components/landing/intro-video-section";
import {
  INTRO_VIDEO_POSTER,
  LANDING_AUDIENCE_IMAGES,
  LANDING_CTA_BACKGROUND,
} from "@/lib/site-images";
import { WorkflowPipeline } from "@/components/marketing/WorkflowPipeline";
import { InteractiveWorkflowDemo } from "@/components/marketing/InteractiveWorkflowDemo";
import { WorkflowComparison } from "@/components/marketing/WorkflowComparison";
import { ShieldAlert } from "lucide-react";

const FAQS_DATA = [
  {
    q: "What is Rifair AI?",
    a: "Rifair AI is an AI-powered hiring workflow copilot that helps HR teams generate structured interview kits, evaluate candidates with scorecards, optimize job descriptions, and detect hiring bias — all in one platform."
  },
  {
    q: "Who is Rifair AI built for?",
    a: "Rifair AI is built for HR professionals, recruiters, hiring managers, startup founders, talent teams, and recruitment agencies who want to structure and accelerate their hiring process."
  },
  {
    q: "How is Rifair AI different from using a general AI tool directly?",
    a: "General AI tools are powerful but require prompt engineering and produce inconsistent outputs. Rifair AI is purpose-built for hiring workflows — interview kits, scorecards, bias checks, and job description optimization in one repeatable, structured platform."
  },
  {
    q: "Can Rifair AI help reduce hiring bias?",
    a: "Rifair AI can help identify biased, leading, unclear, or inconsistent language in interview questions and job descriptions so hiring teams can make their process more structured and fair."
  },
  {
    q: "Does Rifair AI replace recruiters?",
    a: "No. Rifair AI supports recruiters by reducing repetitive work and helping them create more structured hiring materials. Final hiring decisions remain with human teams."
  }
];


export default function LandingBelowFold() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  return (
    <>
      {/* 1. Workflow Pipeline — from JD to hiring decision */}
      <WorkflowPipeline />

      {/* 2. Interactive Demo */}
      <InteractiveWorkflowDemo />

      {/* 3. Intro Video */}
      <IntroVideoSection
        youtubeUrl="https://youtu.be/WTbW7Ydch8s?si=6k1TJefVUNOSSL8a"
        posterImage={INTRO_VIDEO_POSTER}
        subtitle="From job descriptions and interview kits to candidate scorecards and hiring decisions — everything your team needs in one structured AI workflow."
      />

      {/* 5. Core Capabilities (reordered — Interview Kits first) */}
      <RifairCoreFeatures />

      {/* 6. Bias demo — repositioned as fairness layer illustration */}
      <section className="py-16 lg:py-32 px-6 lg:px-12 bg-[#101012] text-white relative border-y border-black/[0.03] overflow-hidden">
        <div
          className="absolute top-1/2 left-3/4 -translate-y-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full pointer-events-none opacity-20 z-0 blur-[120px]"
          style={{
            background: "radial-gradient(circle, #6366f1 0%, transparent 60%)",
          }}
        />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-4 lg:gap-12 items-center relative z-10">
          <div className="space-y-6 md:space-y-10 relative z-20">
            <h2 className="text-2xl md:text-3xl lg:text-4xl text-white text-left font-semibold -tracking-wider mb-8">
              <BlurTextAnimation
                text="See the fairness layer in action."
                fontSize="text-4xl md:text-5xl lg:text-6xl"
                textColor="text-white"
                className="font-black"
                containerClassName="justify-start"
                animationDelay={6000}
              />
            </h2>
            <div className="text-base text-white/60 leading-relaxed font-medium min-h-[4em]">
              <BlurTextAnimation
                text="The Bias Layer doesn't just flag bad questions — it rebuilds them, removing subtle signals that skew evaluations while keeping focus on core competencies."
                fontSize="text-xl"
                textColor="text-white/60"
                className="font-medium"
                containerClassName="justify-start text-left"
                animationDelay={8000}
              />
            </div>
          </div>

          <div className="group relative w-full transition-all duration-500">
            <span
              className="absolute top-0 left-[30px] w-1/2 h-full rounded-3xl transform skew-x-[12deg] transition-all duration-500 group-hover:skew-x-0 group-hover:left-[10px] group-hover:w-[calc(100%-20px)]"
              style={{
                background: "linear-gradient(315deg, #0a3d2e, #1D1D1F)",
              }}
            />
            <span
              className="absolute top-0 left-[30px] w-1/2 h-full rounded-3xl transform skew-x-[12deg] blur-[40px] transition-all duration-500 group-hover:skew-x-0 group-hover:left-[10px] group-hover:w-[calc(100%-20px)] opacity-50"
              style={{
                background: "linear-gradient(315deg, #0a3d2e, #1D1D1F)",
              }}
            />
            <span className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
              <span className="absolute top-0 left-0 w-0 h-0 rounded-full opacity-0 bg-white/10 backdrop-blur-xl shadow-2xl transition-all duration-700 group-hover:-top-20 group-hover:left-20 group-hover:w-40 group-hover:h-40 group-hover:opacity-100 animate-pulse" />
              <span className="absolute bottom-0 right-0 w-0 h-0 rounded-full opacity-0 bg-white/5 backdrop-blur-xl shadow-2xl transition-all duration-700 delay-150 group-hover:-bottom-20 group-hover:right-20 group-hover:w-48 group-hover:h-48 group-hover:opacity-100 animate-pulse" />
            </span>
            <div className="relative z-20 bg-black/40 backdrop-blur-3xl p-8 md:p-12 rounded-[3rem] border border-white/10 shadow-2xl space-y-10 transition-all duration-500 group-hover:left-[-10px]">
              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center border border-red-500/30">
                    <span className="font-bold">×</span>
                  </div>
                  <span className="text-sm font-bold text-red-400 uppercase tracking-widest">
                    Biased Question
                  </span>
                </div>
                <div className="p-6 bg-black/40 rounded-2xl border border-red-500/20 shadow-inner group-hover:border-red-500/40 transition-colors">
                  <p className="text-xl font-medium text-white/90">
                    &quot;Can you handle long hours under pressure?&quot;
                  </p>
                </div>
              </div>
              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="h-5 w-5 text-amber-400" />
                  <span className="text-sm font-bold text-amber-400 uppercase tracking-widest">
                    Detected Issues
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <span className="px-5 py-2.5 bg-amber-500/10 text-amber-300 rounded-full text-sm font-bold border border-amber-500/20 hover:bg-amber-500/20 transition-all">
                    Work-life bias
                  </span>
                  <span className="px-5 py-2.5 bg-amber-500/10 text-amber-300 rounded-full text-sm font-bold border border-amber-500/20 hover:bg-amber-500/20 transition-all">
                    Cultural pressure
                  </span>
                </div>
              </div>
              <div className="space-y-4 pt-8 mt-4 border-t border-white/10 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold text-emerald-400 uppercase tracking-widest">
                    AI Output
                  </span>
                </div>
                <div className="p-8 bg-emerald-50/10 rounded-2xl border border-emerald-500/20 shadow-[inset_0_0_20px_rgba(0,0,0,0.4)] group-hover:border-emerald-500/40 transition-all min-h-[140px] flex items-center">
                  <BlurTextAnimation
                    text='"How do you prioritize tasks during tight deadlines?"'
                    fontSize="text-2xl md:text-3xl"
                    textColor="text-emerald-50"
                    className="font-bold drop-shadow-md"
                    containerClassName="justify-start"
                    animationDelay={5000}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. General AI vs Rifair Comparison */}
      <WorkflowComparison />

      {/* 8. Why Rifair / Who is it for */}
      <section
        id="about-us"
        className="py-16 lg:py-32 px-6 lg:px-12 relative w-full bg-[#F5F5F7] border-y border-black/[0.05] overflow-hidden"
      >
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-20">
          <div className="flex flex-col h-full min-w-0">
            <div className="space-y-4 mb-12">
              <h2 className="text-3xl lg:text-4xl font-black text-[#1D1D1F] tracking-tighter">
                Why Rifair AI?
              </h2>
              <p className="text-[#86868B] text-xl font-medium leading-relaxed max-w-lg">
                We help you build a hiring process that is faster, more structured, and focused on talent.
              </p>
            </div>
            <div className="flex-1 grid gap-4">
              {[
                {
                  title: "Build Interview Kits in Minutes",
                  desc: "Stop wasting hours on interview prep. Get professional, structured interview kits in seconds.",
                  number: "01",
                },
                {
                  title: "Evaluate Consistently",
                  desc: "Score candidates fairly using structured scorecards — not gut feelings. Make better decisions with shared data.",
                  number: "02",
                },
                {
                  title: "Optimize Job Descriptions",
                  desc: "Write job descriptions that attract more diverse talent and remove language that narrows your pipeline.",
                  number: "03",
                },
                {
                  title: "Detect Hiring Bias",
                  desc: "Our AI identifies biased, vague, or inconsistent questions so your team can make the process fairer.",
                  number: "04",
                },
              ].map((point, i) => (
                <motion.div
                  key={point.number}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group p-4 sm:p-5 lg:p-6 rounded-2xl bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] lg:shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all duration-300"
                  style={{ willChange: 'transform' }}
                >
                  <div className="flex items-center gap-6">
                    <span className="text-2xl font-black text-black/10 group-hover:text-primary/20 transition-colors duration-500 tabular-nums">
                      {point.number}
                    </span>
                    <div className="space-y-1">
                      <h4 className="text-base lg:text-lg font-black text-[#1D1D1F] tracking-tight">{point.title}</h4>
                      <p className="text-[#86868B] text-sm lg:text-base leading-relaxed font-medium">{point.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="flex flex-col h-full min-w-0">
            <div className="space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-[#1D1D1F] tracking-tighter">
                Who is it for?
              </h2>
              <p className="text-[#86868B] text-xl font-medium leading-relaxed max-w-lg">
                Whether you&apos;re hiring your first employee or your thousandth.
              </p>
            </div>
            <div className="flex-1 flex flex-col justify-center">
            <InteractiveAccordion
                items={[
                  {
                    id: 1,
                    title: "HR Teams",
                    imageUrl: LANDING_AUDIENCE_IMAGES.hrTeams.src,
                    desc: "Build structured hiring workflows, generate interview kits, and evaluate candidates consistently across every role.",
                  },
                  {
                    id: 2,
                    title: "Startups",
                    imageUrl: LANDING_AUDIENCE_IMAGES.startups.src,
                    desc: "Move fast without sacrificing quality. Create repeatable hiring workflows from day one.",
                  },
                  {
                    id: 3,
                    title: "Enterprises",
                    imageUrl: LANDING_AUDIENCE_IMAGES.enterprises.src,
                    desc: "Standardize hiring practices across teams, regions, and roles with a shared structured workflow.",
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 9. Testimonials */}
      <TestimonialsSection />

      {/* 11. FAQ */}
      <section className="py-16 lg:py-24 px-6 lg:px-12 w-full bg-[#F5F5F7] border-t border-black/[0.05]">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl lg:text-4xl font-black text-[#1D1D1F] tracking-tighter">
              Frequently Asked Questions
            </h2>
            <p className="text-[#86868B] text-sm sm:text-base font-semibold">
              Everything you need to know about our AI hiring workflow platform.
            </p>
          </div>
          <div className="space-y-4">
            {FAQS_DATA.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_rgba(0,0,0,1)] overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full text-left p-6 flex justify-between items-center focus:outline-none"
                    style={{ touchAction: 'manipulation' }}
                    aria-expanded={isOpen}
                  >
                    <h3 className="text-base sm:text-lg font-black text-[#1D1D1F] tracking-tight pr-4">
                      {faq.q}
                    </h3>
                    <span className="text-xl font-bold transition-transform duration-300 shrink-0 select-none">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? "max-h-[300px] border-t-2 border-black/5" : "max-h-0"
                    }`}
                  >
                    <p className="p-6 text-[#86868B] text-xs sm:text-sm leading-relaxed font-semibold">
                      {faq.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 12. Trust row */}
      <section className="py-16 md:py-24 px-6 lg:px-12 relative w-full bg-[#F5F5F7] border-t border-black/[0.05]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 pb-12 md:pb-24 border-b border-black/[0.03]">
            <div className="flex items-center gap-3 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-default">
              <CheckCircle className="h-4 w-4" />
              <span className="text-[10px] font-black text-black uppercase tracking-[0.3em]">
                Made for modern hiring teams
              </span>
            </div>
            <div className="flex items-center gap-3 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-default">
              <CheckCircle className="h-4 w-4" />
              <span className="text-[10px] font-black text-black uppercase tracking-[0.3em]">
                Built for structured organizations
              </span>
            </div>
            <div className="flex items-center gap-3 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-default">
              <CheckCircle className="h-4 w-4" />
              <span className="text-[10px] font-black text-black uppercase tracking-[0.3em]">
                Ethical AI Principles
              </span>
            </div>
          </div>

          {/* Updated CTA section */}
          <HeroSection2
            title={
              <>
                Ready to structure<br /> your hiring process?
              </>
            }
            subtitle="Create interview kits, scorecards, job description audits, and bias-aware evaluations with Rifair AI."
            callToAction={{
              text: "Start Free Hiring Audit",
              href: "/sign-in?redirect_url=/kit",
              icon: <ArrowRight className="h-6 w-6" />,
            }}
            backgroundImage={LANDING_CTA_BACKGROUND}
            className="shadow-[0_20px_100px_rgba(0,0,0,0.08)]"
          />
        </div>
      </section>

      {/* Updated Footer */}
      <FooterSection
        tagline="Rifair AI helps HR teams and startup founders build structured hiring workflows with AI-powered interview kits, candidate scorecards, job description optimization, and bias analysis."
        menuItems={[
          {
            title: "Product",
            links: [
              { text: "Hiring Workflow", url: "/features/interview-kit-generator" },
              { text: "Interview Kit Generator", url: "/features/interview-kit-generator" },
              { text: "Candidate Scorecards", url: "/features/candidate-evaluation" },
              { text: "Job Description Optimizer", url: "/features/job-description-optimizer" },
              { text: "Bias Checker", url: "/features/bias-checker" },
            ],
          },
          {
            title: "Resources",
            links: [
              { text: "Blog", url: "/blog" },
              { text: "Hiring Guides", url: "/blog?category=guides" },
              { text: "Feature Pages", url: "/features/interview-kit-generator" },
            ],
          },
          {
            title: "Company",
            links: [
              { text: "About Us", url: "/about" },
              { text: "Pricing", url: "/pricing" },
              { text: "Contact", url: "/contact" },
            ],
          },
          {
            title: "Legal",
            links: [
              { text: "Privacy Policy", url: "/privacy" },
              { text: "Terms of Service", url: "/terms" },
              { text: "Refund Policy", url: "/refund" },
            ],
          },
        ]}
      />
    </>
  );
}
