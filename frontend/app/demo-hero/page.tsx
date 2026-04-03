"use client"

import { HeroSection, LogosSection } from "@/components/ui/hero-1";
import { NavBarDemo } from "@/components/ui/navbar-demo";

export default function DemoOne() {
	return (
		<div className="flex w-full flex-col min-h-screen bg-background">
            <NavBarDemo />
            <main className="grow pt-20">
                <HeroSection />
                <LogosSection />
            </main>
        </div>
	);
}
