"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle, ShieldAlert, Cpu, Layers, Scale, Zap, Search, Users, Briefcase, FileText, BookOpen, Activity, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { NavBarDemo } from "@/components/ui/navbar-demo";
import { cn } from "@/lib/utils";
import SpotlightBackground from "@/components/ui/spotlight-background";
import { BubbleText } from "@/components/ui/bubble-text";
import { RifairCoreFeatures as RifairCoreFeatures } from "@/components/ui/rifair-features";
import FeatureCarousel from "@/components/ui/feature-carousel";
import { InteractiveAccordion } from "@/components/ui/interactive-image-accordion";
import { HeroSection, LogosSection } from "@/components/ui/hero-1";
import { BlurTextAnimation } from "@/components/ui/blur-text-animation";
import { HeroSection2 } from "@/components/ui/hero-section-2";
import FooterSection from "@/components/ui/footer-section";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F7] relative overflow-hidden font-sans selection:bg-primary/20 selection:text-primary transition-colors duration-500">
      {/* Background Effects */}
      <SpotlightBackground />
      <div className="relative z-50 w-full">
        <NavBarDemo />
      </div>

      <main className="flex-1 flex flex-col pt-4 pb-20 relative z-10 w-full">
        <section className="relative w-full overflow-hidden">
            <HeroSection />
            <LogosSection />
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="how-it-works" className="py-16 md:py-24 relative overflow-hidden bg-[#F5F5F7]" style={{ paddingLeft: 'clamp(16px, 5vw, 80px)', paddingRight: 'clamp(16px, 5vw, 80px)' }}>
          <div className="max-w-7xl mx-auto space-y-12 md:space-y-20">
            <div className="text-center space-y-4">
              <h2 className="font-black text-[#1D1D1F] tracking-tight">How It Works</h2>
              <p className="text-[#86868B] font-medium" style={{ fontSize: 'clamp(15px, 3vw, 20px)' }}>Eight steps to institutionalizing fairness.</p>
            </div>
            
            <FeatureCarousel />
          </div>
        </section>

        {/* CORE FEATURES SECTION - ANIMATED */}
        <RifairCoreFeatures />

        {/* LIVE EXAMPLE SECTION */}
        <section className="py-16 md:py-32 bg-[#101012] text-white relative border-y border-black/[0.03] overflow-hidden" style={{ paddingLeft: 'clamp(16px, 5vw, 80px)', paddingRight: 'clamp(16px, 5vw, 80px)' }}>
            {/* Subtle glow behind the card */}
            <div 
                className="absolute top-1/2 left-3/4 -translate-y-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full pointer-events-none opacity-20 z-0 blur-[120px]"
                style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 60%)' }}
            />
            
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 md:gap-16 items-center relative z-10">
                {/* Text side — force z-index above blurs */}
                <div className="space-y-6 md:space-y-10 relative z-20">
                    <h2
                      className="font-black tracking-tight leading-tight"
                      style={{
                        color: '#ffffff',
                        opacity: 1,
                        position: 'relative',
                        zIndex: 20,
                        fontSize: 'clamp(28px, 5vw, 64px)',
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        minHeight: '1.2em',
                      }}
                    >
                        <BlurTextAnimation 
                            text="See the difference in real-time."
                            fontSize="text-[clamp(28px,5vw,64px)]"
                            textColor="text-white"
                            className="font-black"
                            containerClassName="justify-start"
                            animationDelay={6000}
                        />
                    </h2>
                    <div
                      style={{
                        color: 'rgba(255,255,255,0.6)',
                        opacity: 1,
                        position: 'relative',
                        zIndex: 20,
                        minHeight: '4em',
                        fontSize: 'clamp(15px, 3vw, 20px)',
                      }}
                    >
                        <BlurTextAnimation 
                            text="Our engine doesn't just block bad questions. It fundamentally rebuilds them, cutting out subtle signals of bias while purely focusing on core competencies."
                            fontSize="text-[clamp(15px,3vw,20px)]"
                            textColor="text-white/60"
                            className="font-medium"
                            containerClassName="justify-start text-left"
                            animationDelay={8000}
                        />
                    </div>
                </div>

                <div className="group relative w-full transition-all duration-500">
                    {/* Skewed gradient panels from SkewCards */}
                    <span
                        className="absolute top-0 left-[30px] w-1/2 h-full rounded-3xl transform skew-x-[12deg] transition-all duration-500 group-hover:skew-x-0 group-hover:left-[10px] group-hover:w-[calc(100%-20px)]"
                        style={{
                            background: 'linear-gradient(315deg, #6366f1, #ec4899)',
                        }}
                    />
                    <span
                        className="absolute top-0 left-[30px] w-1/2 h-full rounded-3xl transform skew-x-[12deg] blur-[40px] transition-all duration-500 group-hover:skew-x-0 group-hover:left-[10px] group-hover:w-[calc(100%-20px)] opacity-50"
                        style={{
                            background: 'linear-gradient(315deg, #6366f1, #ec4899)',
                        }}
                    />

                    {/* Animated blurs */}
                    <span className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
                        <span className="absolute top-0 left-0 w-0 h-0 rounded-full opacity-0 bg-white/10 backdrop-blur-xl shadow-2xl transition-all duration-700 group-hover:-top-20 group-hover:left-20 group-hover:w-40 group-hover:h-40 group-hover:opacity-100 animate-pulse" />
                        <span className="absolute bottom-0 right-0 w-0 h-0 rounded-full opacity-0 bg-white/5 backdrop-blur-xl shadow-2xl transition-all duration-700 delay-150 group-hover:-bottom-20 group-hover:right-20 group-hover:w-48 group-hover:h-48 group-hover:opacity-100 animate-pulse" />
                    </span>

                    {/* Main Content Container */}
                    <div className="relative z-20 bg-black/40 backdrop-blur-3xl p-8 md:p-12 rounded-[3rem] border border-white/10 shadow-2xl space-y-10 transition-all duration-500 group-hover:left-[-10px]">
                        <div className="space-y-4 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center border border-red-500/30">
                                    <span className="font-bold">×</span>
                                </div>
                                <span className="text-sm font-bold text-red-400 uppercase tracking-widest">Biased Question</span>
                            </div>
                            <div className="p-6 bg-black/40 rounded-2xl border border-red-500/20 shadow-inner group-hover:border-red-500/40 transition-colors">
                                <p className="text-xl font-medium text-white/90">"Can you handle long hours under pressure?"</p>
                            </div>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <div className="flex items-center gap-3">
                                <ShieldAlert className="h-5 w-5 text-amber-400" />
                                <span className="text-sm font-bold text-amber-400 uppercase tracking-widest">Detected Issues</span>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <span className="px-5 py-2.5 bg-amber-500/10 text-amber-300 rounded-full text-sm font-bold border border-amber-500/20 hover:bg-amber-500/20 transition-all">Work-life bias</span>
                                <span className="px-5 py-2.5 bg-amber-500/10 text-amber-300 rounded-full text-sm font-bold border border-amber-500/20 hover:bg-amber-500/20 transition-all">Cultural pressure</span>
                            </div>
                        </div>

                        <div className="space-y-4 pt-8 mt-4 border-t border-white/10 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                                    <CheckCircle className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-bold text-emerald-400 uppercase tracking-widest">AI Output</span>
                            </div>
                            <div className="p-8 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-[inset_0_0_20px_rgba(0,0,0,0.4)] group-hover:border-emerald-500/40 transition-all min-h-[140px] flex items-center">
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


        {/* WHY / WHO ADVANCED SECTIONS */}
        <section id="about-us" className="py-16 md:py-32 relative w-full bg-[#F5F5F7] border-y border-black/[0.05]" style={{ paddingLeft: 'clamp(16px, 5vw, 80px)', paddingRight: 'clamp(16px, 5vw, 80px)' }}>
            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20">
                <div className="space-y-8 md:space-y-12">
                    <h2 className="font-black text-[#1D1D1F] tracking-tight">Why Rifair AI</h2>
                    <ul className="space-y-6 md:space-y-8">
                        <li className="flex items-start gap-4 md:gap-5">
                            <div className="h-10 w-10 rounded-full bg-muted text-primary flex items-center justify-center shrink-0 mt-1">
                                <CheckCircle className="h-5 w-5" />
                            </div>
                            {/* min-w-0 prevents text overflow on mobile */}
                            <div className="min-w-0 flex-1">
                                <h4 className="text-xl font-bold text-[#1D1D1F]" style={{ wordBreak: 'break-word' }}>Removes Unconscious Bias</h4>
                                <p className="text-[#86868B] mt-2 leading-relaxed" style={{ fontSize: 'clamp(14px, 2.5vw, 18px)' }}>Eliminate subtle biases that humans inherently miss.</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-4 md:gap-5">
                            <div className="h-10 w-10 rounded-full bg-muted text-primary flex items-center justify-center shrink-0 mt-1">
                                <CheckCircle className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="text-xl font-bold text-[#1D1D1F]" style={{ wordBreak: 'break-word' }}>Improves Hiring Fairness</h4>
                                <p className="text-[#86868B] mt-2 leading-relaxed" style={{ fontSize: 'clamp(14px, 2.5vw, 18px)' }}>Create a perfectly level playing field for all candidates.</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-4 md:gap-5">
                            <div className="h-10 w-10 rounded-full bg-muted text-primary flex items-center justify-center shrink-0 mt-1">
                                <CheckCircle className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="text-xl font-bold text-[#1D1D1F]" style={{ wordBreak: 'break-word' }}>Ensures Compliance</h4>
                                <p className="text-[#86868B] mt-2 leading-relaxed" style={{ fontSize: 'clamp(14px, 2.5vw, 18px)' }}>Stay seamlessly aligned with modern employment standards and ethical guidelines.</p>
                            </div>
                        </li>
                    </ul>
                </div>

                <div className="space-y-8 md:space-y-12">
                    <h2 className="font-black text-[#1D1D1F] tracking-tight">Who is it for</h2>
                    <InteractiveAccordion 
                        items={[
                            {
                                id: 1,
                                title: 'HR Teams',
                                imageUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1974&auto=format&fit=crop',
                                desc: 'Perfect for recruiting teams looking to remove unconscious bias from their workflow.'
                            },
                            {
                                id: 2,
                                title: 'Startups',
                                imageUrl: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=2074&auto=format&fit=crop',
                                desc: 'Agile teams ensuring cultural fairness and diversity from day one.'
                            },
                            {
                                id: 3,
                                title: 'Enterprises',
                                imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop',
                                desc: 'Scale fair hiring practices across thousands of employees and teams.'
                            }
                        ]}
                    />
                </div>
            </div>
        </section>

        {/* TRUST SECTION & BOTTOM CTA */}
        <section className="py-12 md:py-24 relative w-full bg-[#F5F5F7] border-t border-black/[0.05]" style={{ paddingLeft: 'clamp(16px, 5vw, 80px)', paddingRight: 'clamp(16px, 5vw, 80px)' }}>
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Trust / Authority Section inside the bottom CTA */}
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 pb-12 md:pb-24 border-b border-black/[0.03]">
                    <div className="flex items-center gap-3 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-default">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-[10px] font-black text-black uppercase tracking-[0.3em]">Made for modern hiring teams</span>
                    </div>
                    <div className="flex items-center gap-3 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-default">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-[10px] font-black text-black uppercase tracking-[0.3em]">Built for inclusive organizations</span>
                    </div>
                    <div className="flex items-center gap-3 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-default">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-[10px] font-black text-black uppercase tracking-[0.3em]">Ethical AI Principles</span>
                    </div>
                </div>

                <HeroSection2 
                    title={<>Ready to build <br/> fair hiring systems?</>}
                    subtitle="Join a movement of world-class organizations building the future of unbiased, skills-first recruitment."
                    callToAction={{
                        text: "Start Free Audit",
                        href: "/analyze",
                        icon: <ArrowRight className="h-6 w-6" />
                    }}
                    backgroundImage="https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=2070&auto=format&fit=crop"
                    className="shadow-[0_20px_100px_rgba(0,0,0,0.08)]"
                />
            </div>
        </section>

      </main>
      
      <FooterSection />
    </div>
  );
}
