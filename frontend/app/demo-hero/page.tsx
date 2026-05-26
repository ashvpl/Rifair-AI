"use client"

import { HeroSection, LogosSection } from "@/components/ui/hero-1";
import { NavBarDemo } from "@/components/ui/navbar-demo";

export default function DemoOne() {
	return (
		<div className="flex w-full flex-col min-h-screen bg-background">
            <NavBarDemo />
            <main className="grow pt-20">
                <HeroSection />
                <section className="relative space-y-8 border-t border-black/[0.03] pt-12 pb-16 px-4 overflow-hidden">
                    <h2 className="text-center font-black text-sm uppercase text-[#86868B] tracking-[0.3em]">
                        Powered by
                    </h2>
                    <LogosSection />
                </section>
            </main>
        </div>
	);
}
