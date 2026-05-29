"use client";

import dynamic from "next/dynamic";
import { NavBarDemo } from "@/components/ui/navbar-demo";
import { HeroSection, LogosSection } from "@/components/ui/hero-1";
import { DebugPerfLogger } from "@/components/debug/perf-logger";

const EtherealShadow = dynamic(
  () => import("@/components/ui/etheral-shadow").then((mod) => mod.Component),
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
      <div className="relative z-50 w-full">
        <NavBarDemo />
      </div>

      <main className="flex-1 flex flex-col relative z-10 w-full">
        {/* Hero Section Container with Ethereal Shadow background */}
        <section className="relative w-full overflow-hidden">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <EtherealShadow
              bgColor="#f0f0f0"
              color="rgba(60, 60, 60, 0.40)"
              animation={{ scale: 100, speed: 90 }}
              noise={{ opacity: 0.2, scale: 1.2 }}
              sizing="fill"
              showTitle={false}
            />
          </div>
          <div className="relative z-10">
            <HeroSection />
          </div>
        </section>

        {/* Separated Powered by section with solid white background */}
        <section className="relative z-10 space-y-8 bg-white border-t border-black/[0.08] pt-12 pb-16 px-4 overflow-hidden">
          <h2 className="text-center font-black text-sm uppercase text-[#555555] tracking-[0.3em]">
            Powered by
          </h2>
          <LogosSection />
        </section>

        <LandingBelowFold />
      </main>
    </div>
  );
}
