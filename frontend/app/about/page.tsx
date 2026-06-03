import React from "react";
import { Metadata } from "next";
import { NavBarDemo } from "@/components/ui/navbar-demo";
import FooterSection from "@/components/ui/footer-section";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle, Shield, Sparkles, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | Rifair AI",
  description: "Learn how Rifair AI is helping hiring teams and recruiters build fairer, faster, and more objective hiring processes.",
  alternates: {
    canonical: "https://rifairai.com/about",
  },
  openGraph: {
    title: "About Us | Rifair AI",
    description: "Learn how Rifair AI is helping hiring teams and recruiters build fairer, faster, and more objective hiring processes.",
    url: "https://rifairai.com/about",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F7] font-sans selection:bg-primary/20 selection:text-primary transition-colors duration-500">
      <NavBarDemo />

      <main className="flex-1 pt-24 md:pt-32">
        {/* Hero Section */}
        <section className="px-6 lg:px-12 py-16 text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 text-xs font-bold uppercase tracking-wider text-black/60">
            <Sparkles className="w-3.5 h-3.5" />
            Our Mission
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#1D1D1F] tracking-tight leading-tight">
            Fair Hiring is the Future of Talent
          </h1>
          <p className="text-[#86868B] text-lg md:text-xl font-medium leading-relaxed">
            Rifair AI combines advanced AI language technologies with established HR principles to remove unconscious bias, standardize interview kits, and streamline hiring operations.
          </p>
        </section>

        {/* Core Pillars */}
        <section className="px-6 lg:px-12 py-16 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white border-2 border-black p-8 rounded-3xl shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-xl font-black mb-3">Bias Elimination</h3>
              <p className="text-[#86868B] font-medium text-sm leading-relaxed">
                Unconscious bias affects over 48% of hiring decisions. We scan interview questions and job descriptions to eliminate subtle demographic, cultural, and experience bias.
              </p>
            </div>

            <div className="bg-white border-2 border-black p-8 rounded-3xl shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-xl font-black mb-3">Skills-First Focus</h3>
              <p className="text-[#86868B] font-medium text-sm leading-relaxed">
                We believe candidates should be evaluated on capability rather than credentials. Our generators build role-specific scorecards targeting core competencies.
              </p>
            </div>

            <div className="bg-white border-2 border-black p-8 rounded-3xl shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-xl font-black mb-3">Standardized Workflows</h3>
              <p className="text-[#86868B] font-medium text-sm leading-relaxed">
                Subjective scorecards cause unstructured comparisons. Rifair provides objective rubrics, helping interview panels grade consistently and fairly.
              </p>
            </div>
          </div>
        </section>

        {/* Our Approach (Human-in-the-Loop) */}
        <section className="px-6 lg:px-12 py-16 bg-[#101012] text-white">
          <div className="max-w-5xl mx-auto space-y-8 text-center md:text-left md:flex md:items-center md:justify-between md:gap-12">
            <div className="flex-1 space-y-4">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                Human-in-the-Loop Intelligence
              </h2>
              <p className="text-white/60 font-medium leading-relaxed">
                At Rifair AI, we stand firm in our design principle: AI should assist, not automate away, human decisions. Our platform supports recruiters with high-quality checklists, structured evaluations, and objective analytics. The final hiring choice remains purely human.
              </p>
            </div>
            <div className="shrink-0 flex justify-center">
              <Link href="/sign-up">
                <Button className="bg-white text-black hover:bg-white/90 font-bold px-8 py-6 rounded-full text-base shadow-lg transition-transform hover:scale-105 active:scale-95">
                  Try Rifair AI Free
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Team / Mission */}
        <section className="px-6 lg:px-12 py-20 max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl font-black text-[#1D1D1F]">
            Built for High-Growth Teams
          </h2>
          <p className="text-[#86868B] font-medium leading-relaxed">
            Rifair AI is developed for talent teams, HR generalists, and technical hiring managers at fast-growing startups and established enterprises alike. We build tools that make your daily recruiting process faster, fairer, and fully compliant with modern global standards.
          </p>
        </section>
      </main>

      <FooterSection />
    </div>
  );
}
