"use client";

import React, { useState, useCallback } from "react";
import { DemoWorkflowInput, DemoWorkflowOutput } from "@/types/demo";
import { generateDemoWorkflow } from "@/lib/demo/generateDemoWorkflow";
import { DemoWorkflowForm } from "@/components/demo/DemoWorkflowForm";
import { DemoWorkflowPreview } from "@/components/demo/DemoWorkflowPreview";
import { DemoLoadingState } from "@/components/demo/DemoLoadingState";
import { DemoSignupCard } from "@/components/demo/DemoSignupCard";
import { DemoLockedFeatureModal } from "@/components/demo/DemoLockedFeature";
import { NavBarDemo } from "@/components/ui/navbar-demo";
import Link from "next/link";
import { Sparkles, Shield } from "lucide-react";

type DemoState = "idle" | "generating" | "generated";

export default function DemoPageClient() {
  const [demoState, setDemoState] = useState<DemoState>("idle");
  const [output, setOutput] = useState<DemoWorkflowOutput | null>(null);
  const [lockedFeatureModal, setLockedFeatureModal] = useState<{
    open: boolean;
    feature: string;
  }>({ open: false, feature: "" });

  const handleGenerate = useCallback((input: DemoWorkflowInput) => {
    setDemoState("generating");

    // Fire analytics event if GA is available
    if (typeof window !== "undefined" && "gtag" in window) {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag("event", "demo_generate_clicked", {
        role: input.role,
        seniority: input.seniority,
        company_type: input.companyType,
      });
    }

    // Pre-compute the output here to display after animation
    const result = generateDemoWorkflow(input);
    setOutput(result);
  }, []);

  const handleLoadingComplete = useCallback(() => {
    setDemoState("generated");

    if (typeof window !== "undefined" && "gtag" in window) {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag("event", "demo_output_viewed");
    }
  }, []);

  const handleLockTrigger = useCallback((feature: string) => {
    setLockedFeatureModal({ open: true, feature });

    if (typeof window !== "undefined" && "gtag" in window) {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag("event", "demo_locked_feature_clicked", { feature });
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F7] overflow-x-hidden">
      {/* Shared Navbar */}
      <NavBarDemo />

      {/* Page content — offset by navbar height */}
      <main className="flex-1 pt-16 md:pt-20">
        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <section className="w-full bg-white border-b border-black/[0.06] px-4 py-10 md:py-14">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-black/[0.04] border border-black/[0.06] rounded-full text-xs font-bold text-[#86868B] tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              Try Rifair AI Demo
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#1D1D1F] leading-tight tracking-tight">
              Try a structured hiring workflow preview
            </h1>

            <p className="text-sm sm:text-base font-semibold text-[#86868B] max-w-2xl mx-auto leading-relaxed">
              Select a role and see how Rifair AI structures the job description, interview kit, scorecard, bias-aware review, and evaluation guide — no login required.
            </p>

            <p className="text-xs font-bold text-[#86868B] tracking-wide">
              This public demo uses curated role-based previews.{" "}
              <Link href="/sign-up" className="underline hover:text-[#1D1D1F] transition-colors">
                Create a free account to generate custom AI workflows for your exact JD and hiring process.
              </Link>
            </p>
          </div>
        </section>

        {/* ── Main Content ────────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] xl:grid-cols-[440px_1fr] gap-6 xl:gap-8 items-start">
            {/* Left: Form */}
            <div className="lg:sticky lg:top-28">
              <DemoWorkflowForm
                onSubmit={handleGenerate}
                isGenerating={demoState === "generating"}
              />
            </div>

            {/* Right: Output */}
            <div className="space-y-6">
              {demoState === "generating" && (
                <DemoLoadingState onComplete={handleLoadingComplete} />
              )}

              {demoState !== "generating" && (
                <>
                  <DemoWorkflowPreview
                    output={output}
                    onLockTrigger={handleLockTrigger}
                  />

                  {demoState === "generated" && (
                    <>
                      {/* Post-generation prompt */}
                      <div className="text-center py-2">
                        <p className="text-xs font-semibold text-[#86868B] max-w-md mx-auto">
                          Your preview is ready. Create a free account to save this workflow, generate complete outputs, and use it for real candidate evaluation.
                        </p>
                      </div>

                      {/* Conversion card */}
                      <DemoSignupCard />
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </section>

        {/* ── Trust / Safety Note ─────────────────────────────────────────── */}
        <section className="w-full bg-white border-t border-black/[0.06] px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-[#86868B]" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#86868B]">
                Demo &amp; Privacy
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: "No login required",
                  body: "All demo output is generated entirely on your device. No account needed to explore.",
                },
                {
                  title: "No data stored",
                  body: "Demo inputs are not saved to any database. Sign up only when you want to persist and export your workflows.",
                },
                {
                  title: "Decision support only",
                  body: "Rifair AI is a hiring copilot. All outputs are example previews. Human review is required for all final hiring decisions.",
                },
                {
                  title: "Bias-aware, not bias-free",
                  body: "Our bias review flags potential issues based on structured rubrics. It is not a legal compliance guarantee.",
                },
              ].map((item) => (
                <div key={item.title} className="space-y-0.5">
                  <span className="text-xs font-bold text-[#1D1D1F]">{item.title}</span>
                  <p className="text-xs font-semibold text-[#86868B] leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Mini Footer ─────────────────────────────────────────────────── */}
        <footer className="w-full px-4 py-6 bg-[#F5F5F7] border-t border-black/[0.06]">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-[#86868B]">
            <span>© {new Date().getFullYear()} Rifair AI. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <Link href="/" className="hover:text-[#1D1D1F] transition-colors">Home</Link>
              <Link href="/pricing" className="hover:text-[#1D1D1F] transition-colors">Pricing</Link>
              <Link href="/sign-up" className="hover:text-[#1D1D1F] transition-colors">Sign Up</Link>
              <Link href="/sign-in" className="hover:text-[#1D1D1F] transition-colors">Login</Link>
            </div>
          </div>
        </footer>
      </main>

      {/* Locked Feature Modal */}
      <DemoLockedFeatureModal
        isOpen={lockedFeatureModal.open}
        onClose={() => setLockedFeatureModal({ open: false, feature: "" })}
        featureName={lockedFeatureModal.feature}
      />
    </div>
  );
}
