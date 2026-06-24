"use client"

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";
import { LogoCloud } from "@/components/ui/logo-cloud-3";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { RevealText } from "@/components/ui/reveal-text";
import { SVGFollower } from "@/components/ui/svg-follower";
import { Banner } from "@/components/ui/banner";

export function HeroSection() {
	const { isSignedIn } = useAuth();

	// #region agent log
	useEffect(() => {
		const payload = {
			sessionId: "33be9b",
			location: "hero-1.tsx:HeroSection",
			message: "HeroSection mounted",
			data: { mountMs: Math.round(performance.now()) },
			hypothesisId: "E",
			timestamp: Date.now(),
			runId: "initial",
		};
		fetch("/api/debug-log", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		}).catch(() => {});
	}, []);
	// #endregion

	return (
		<section className="mx-auto w-full max-w-7xl relative group/hero overflow-hidden">
			<SVGFollower className="opacity-40" />
			{/* Top Shades */}
			<div
				aria-hidden="true"
				className="absolute inset-0 isolate hidden overflow-hidden lg:block pointer-events-none"
			>
				<div 
          className="absolute inset-0 -top-24 isolate -z-10 bg-[radial-gradient(50%_50%_at_50%_0%,rgba(115,115,115,0.06),transparent)]" 
        />
			</div>

			{/* ======================================= */}
			{/* ORIGINAL MAIN HERO SECTION */}
			{/* ======================================= */}
			<div className="relative flex flex-col items-center justify-center gap-6 lg:gap-8 pt-28 sm:pt-32 lg:pt-24 xl:pt-32 pb-8 lg:pb-12 xl:pb-16 px-4 sm:px-6 lg:px-8">

				<div className="flex flex-col items-center gap-1 md:gap-2 w-full max-w-5xl">
					{/* Semantic SEO H1 - Visible and styled elegantly */}
					<h1 className="text-[#86868B] text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-center mb-2">
						The Structured Hiring Platform for Modern Teams
					</h1>
					{/* Hero title wrapper — word-break prevention */}
					<div className="w-full text-center flex flex-col items-center gap-2">
						<RevealText 
							text="The Structured Hiring Platform"
							fontSize="text-2xl sm:text-4xl md:text-5xl lg:text-[54px] xl:text-[64px]"
							textColor="text-[#1D1D1F]"
							overlayColor="text-indigo-700"
							letterDelay={0.06}
							className="w-full block"
						/>
						<RevealText 
							text="for Modern Teams"
							fontSize="text-2xl sm:text-4xl md:text-5xl lg:text-[54px] xl:text-[64px]"
							textColor="text-[#1D1D1F]"
							overlayColor="text-emerald-700"
							letterDelay={0.05}
							className="w-full block"
						/>
					</div>
				</div>

				<p
					className="fade-in slide-in-from-bottom-10 mx-auto max-w-3xl animate-in fill-mode-backwards text-center text-sm sm:text-base lg:text-lg xl:text-xl tracking-wider delay-200 duration-500 ease-out font-semibold text-[#111111]"
				>
					Generate interview kits, candidate scorecards, job description improvements, and bias-aware hiring workflows — all in one AI-powered workspace.
				</p>

				<div className="fade-in slide-in-from-bottom-10 flex flex-col items-center animate-in fill-mode-backwards pt-2 delay-300 duration-500 ease-out w-full">
					<div className="flex flex-row flex-wrap items-center justify-center gap-2 lg:gap-3 w-full max-w-xs sm:max-w-none">
						{isSignedIn ? (
							<Link href="/dashboard" className="w-full sm:w-auto">
								<Button className="w-full sm:w-auto rounded-full font-bold h-10 lg:h-12 px-6 lg:px-8" size="lg">
									Build Your First Hiring Workflow{" "}
									<ArrowRightIcon className="size-4 ms-2" />
								</Button>
							</Link>
						) : (
							<>
								<Link href="/features/interview-kit-generator" className="w-full sm:w-auto">
									<Button className="w-full sm:w-auto rounded-full font-bold h-10 lg:h-12 px-6 lg:px-8" size="lg">
										Try Workflow Demo
										<ArrowRightIcon className="size-4 ms-2" />
									</Button>
								</Link>
								<Link href="/sign-up" className="w-full sm:w-auto">
									<Button variant="outline" className="w-full sm:w-auto rounded-full font-bold h-10 lg:h-12 px-6 lg:px-8 border-black/20 hover:border-black/40" size="lg">
										Start Free
									</Button>
								</Link>
							</>
						)}
					</div>
					<p className="mt-4 text-[10px] sm:text-xs font-semibold text-[#86868B] tracking-wide text-center">
						{isSignedIn
							? "Built for recruiters, HR teams, startup founders, and hiring managers."
							: "No signup required to try the demo."}
					</p>
				</div>
			</div>

			{/* ======================================= */}
			{/* NEW CIE DEMO SECTION */}
			{/* ======================================= */}
			<div className="w-[100vw] relative left-1/2 -translate-x-1/2 bg-white border-t border-black/5 mt-8">
				<div className="mx-auto max-w-7xl relative flex flex-col items-center justify-center gap-6 lg:gap-8 pt-16 pb-16 lg:pb-24 px-4 sm:px-6 lg:px-8">
					
					<div className="flex flex-col items-center gap-1 md:gap-2 w-full max-w-5xl">
						<h2 className="text-[#86868B] text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-center mb-2">
							Rifair AI
						</h2>
						<div className="w-full text-center flex flex-col items-center gap-2">
							<RevealText 
								text="AI-Powered Candidate"
								fontSize="text-2xl sm:text-4xl md:text-5xl lg:text-[42px] xl:text-[54px]"
								textColor="text-[#1D1D1F]"
								overlayColor="text-indigo-700"
								letterDelay={0.06}
								className="w-full block"
							/>
							<RevealText 
								text="Intelligence Engine"
								fontSize="text-2xl sm:text-4xl md:text-5xl lg:text-[42px] xl:text-[54px]"
								textColor="text-[#1D1D1F]"
								overlayColor="text-emerald-700"
								letterDelay={0.05}
								className="w-full block"
							/>
						</div>
					</div>

					<p className="fade-in slide-in-from-bottom-10 mx-auto max-w-3xl animate-in fill-mode-backwards text-center text-sm sm:text-base lg:text-lg xl:text-xl tracking-wider delay-200 duration-500 ease-out font-semibold text-[#111111]">
						Rank 100,000 candidates semantically. Detect keyword stuffers. Identify product builders. Generate recruiter-trustworthy shortlists.
					</p>

					<div className="fade-in slide-in-from-bottom-10 flex flex-col items-center animate-in fill-mode-backwards pt-2 delay-300 duration-500 ease-out w-full">
						<div className="flex flex-row flex-wrap items-center justify-center gap-2 lg:gap-3 w-full max-w-xs sm:max-w-none">
							<Link href="/demo" className="w-full sm:w-auto">
								<Button className="w-full sm:w-auto rounded-full font-bold h-10 lg:h-12 px-6 lg:px-8 bg-indigo-600 hover:bg-indigo-700 text-white" size="lg">
									Try Live Engine Demo
									<ArrowRightIcon className="size-4 ms-2" />
								</Button>
							</Link>
							<Link href="/demo#architecture" className="w-full sm:w-auto">
								<Button variant="outline" className="w-full sm:w-auto rounded-full font-bold h-10 lg:h-12 px-6 lg:px-8 border-black/20 hover:border-black/40" size="lg">
									View Architecture
								</Button>
							</Link>
						</div>
						<p className="mt-4 text-[10px] sm:text-xs font-semibold text-[#86868B] tracking-wide text-center">
							No signup or data entry required.
						</p>
					</div>


				</div>
			</div>
		</section>
	);
}

export function LogosSection() {
	return (
		<LogoCloud
			className="opacity-80 max-w-4xl mx-auto"
			logos={logos.filter((logo) => logo.alt !== "GitHub Logo")}
		/>
	);
}

const logos = [
	{
		src: "https://storage.efferd.com/logo/supabase-wordmark.svg",
		alt: "Supabase Logo",
	},
	{
		src: "https://storage.efferd.com/logo/openai-wordmark.svg",
		alt: "OpenAI Logo",
	},
	{
		src: "https://storage.efferd.com/logo/vercel-wordmark.svg",
		alt: "Vercel Logo",
	},
	{
		src: "https://storage.efferd.com/logo/claude-wordmark.svg",
		alt: "Claude AI Logo",
	},
	{
		src: "https://storage.efferd.com/logo/clerk-wordmark.svg",
		alt: "Clerk Logo",
	},
];
