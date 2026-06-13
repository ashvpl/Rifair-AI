"use client";

import React, { useState } from "react";
import { ArrowRight, CheckCircle } from "lucide-react";
import { RifairCoreFeatures } from "@/components/ui/rifair-features";
import { HeroSection2 } from "@/components/ui/hero-section-2";
import FooterSection from "@/components/ui/footer-section";
import { TestimonialsSection } from "@/components/ui/testimonial-v2";
import { IntroVideoSection } from "@/components/landing/intro-video-section";
import {
  INTRO_VIDEO_POSTER,
  LANDING_CTA_BACKGROUND,
} from "@/lib/site-images";

// Workflow components
import { WorkflowPipeline } from "@/components/marketing/WorkflowPipeline";
import { RecruiterPainSection } from "@/components/marketing/RecruiterPainSection";
import { InteractiveWorkflowDemo } from "@/components/marketing/InteractiveWorkflowDemo";
import { CandidateScorecardPreview } from "@/components/marketing/CandidateScorecardPreview";
import { HiringHealthPreview } from "@/components/marketing/HiringHealthPreview";
import { WhyNotGenericAI } from "@/components/marketing/WhyNotGenericAI";
import { BuiltForHiringTeams } from "@/components/marketing/BuiltForHiringTeams";

const FAQS_DATA = [
  {
    q: "What is Rifair AI?",
    a: "Rifair AI is a structured hiring evaluation platform that helps recruiters and hiring teams create structured interview kits, candidate scorecards, job description improvements, and bias-aware hiring workflows in minutes."
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

      {/* 2. Recruiter Pain Section */}
      <RecruiterPainSection />

      {/* 3. Interactive Demo */}
      <InteractiveWorkflowDemo />

      {/* 4. Intro Video */}
      <IntroVideoSection
        youtubeUrl="https://youtu.be/WTbW7Ydch8s?si=6k1TJefVUNOSSL8a"
        posterImage={INTRO_VIDEO_POSTER}
        subtitle="From job descriptions and interview kits to candidate scorecards and hiring decisions — everything your team needs in one structured AI workflow."
      />

      {/* 5. Candidate Scorecard Preview */}
      <CandidateScorecardPreview />

      {/* 6. Hiring Health Preview */}
      <HiringHealthPreview />

      {/* 7. Why Not Generic AI */}
      <WhyNotGenericAI />

      {/* 8. Built For Hiring Teams */}
      <BuiltForHiringTeams />

      {/* 9. Core Capabilities */}
      <RifairCoreFeatures />

      {/* 10. Testimonials */}
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

      {/* 12. Trust row & CTA */}
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
                Bias-aware evaluation layer
              </span>
            </div>
          </div>

          {/* Final CTA */}
          <HeroSection2
            title={
              <>
                Ready to structure<br /> your hiring process?
              </>
            }
            subtitle="Create interview kits, scorecards, job description audits, and bias-aware evaluations with Rifair AI."
            callToAction={{
              text: "Build Your First Hiring Workflow",
              href: "/sign-in?redirect_url=/kit",
              icon: <ArrowRight className="h-6 w-6" />,
            }}
            backgroundImage={LANDING_CTA_BACKGROUND}
            className="shadow-[0_20px_100px_rgba(0,0,0,0.08)]"
          />
        </div>
      </section>

      {/* Footer Section */}
      <FooterSection
        tagline="Rifair AI helps recruiters, HR teams, and startup founders build structured hiring workflows with AI-powered interview kits, candidate scorecards, job description optimization, and bias-aware evaluations."
        menuItems={[
          {
            title: "Product",
            links: [
              { text: "Hiring Workflow", url: "/features/interview-kit-generator" },
              { text: "Interview Kit Generator", url: "/features/interview-kit-generator" },
              { text: "Candidate Scorecards", url: "/features/candidate-evaluation" },
              { text: "Job Description Optimizer", url: "/features/job-description-optimizer" },
              { text: "Bias-Aware Review", url: "/features/bias-checker" },
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
