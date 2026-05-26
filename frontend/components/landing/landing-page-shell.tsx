"use client";

import dynamic from "next/dynamic";
import { NavBarDemo } from "@/components/ui/navbar-demo";
import { HeroSection, LogosSection } from "@/components/ui/hero-1";
import { DebugPerfLogger } from "@/components/debug/perf-logger";

const SpotlightBackground = dynamic(
  () => import("@/components/ui/spotlight-background"),
  { ssr: false }
);

const LandingBelowFold = dynamic(
  () => import("@/components/landing/landing-below-fold"),
  {
    loading: () => (
      <div className="min-h-[40vh] w-full bg-[#F5F5F7]" aria-hidden />
    ),
  }
);

export function LandingPageShell() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F7] relative overflow-x-hidden font-sans selection:bg-primary/20 selection:text-primary transition-colors duration-500">
      <DebugPerfLogger page="landing" />
      <SpotlightBackground />
      <div className="relative z-50 w-full">
        <NavBarDemo />
      </div>

      <main className="flex-1 flex flex-col pt-4 pb-20 relative z-10 w-full">
        <section className="relative w-full overflow-hidden">
          <HeroSection />
          <section className="relative space-y-8 border-t border-black/[0.03] pt-12 pb-16 px-4 overflow-hidden">
            <h2 className="text-center font-black text-sm uppercase text-[#86868B] tracking-[0.3em]">
              Powered by
            </h2>
            <LogosSection />
          </section>
        </section>

        <LandingBelowFold />
      </main>
    </div>
  );
}
