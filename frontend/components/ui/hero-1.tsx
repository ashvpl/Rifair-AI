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

			{/* main content */}
			<div className="relative flex flex-col items-center justify-center gap-6 lg:gap-8 pt-16 lg:pt-24 xl:pt-32 pb-8 lg:pb-12 xl:pb-16 px-4 sm:px-6 lg:px-8">

				<div className="flex flex-col items-center gap-1 md:gap-2 w-full max-w-5xl">
					{/* Hero title wrapper — word-break prevention */}
					<div className="w-full text-center flex flex-col items-center gap-2">
						<RevealText 
							text="The Operating System"
							fontSize="text-2xl sm:text-3xl md:text-4xl lg:text-[56px] xl:text-[64px]"
							textColor="text-[#1D1D1F]"
							overlayColor="text-indigo-600"
							letterDelay={0.06}
							className="w-full block"
						/>
						<RevealText 
							text="for Modern Hiring"
							fontSize="text-2xl sm:text-3xl md:text-4xl lg:text-[56px] xl:text-[64px]"
							textColor="text-[#1D1D1F]"
							overlayColor="text-emerald-600"
							letterDelay={0.05}
							className="w-full block"
						/>
					</div>
				</div>

				<p
					className="fade-in slide-in-from-bottom-10 mx-auto max-w-3xl animate-in fill-mode-backwards text-center text-sm sm:text-base lg:text-lg xl:text-xl text-foreground/80 tracking-wider delay-200 duration-500 ease-out font-medium"
				>
					Generate interview kits, evaluate candidates, analyze job descriptions, audit hiring processes, and eliminate bias — all in one AI-powered platform.
				</p>

				<div className="fade-in slide-in-from-bottom-10 flex animate-in flex-row flex-wrap items-center justify-center gap-2 lg:gap-3 fill-mode-backwards pt-2 delay-300 duration-500 ease-out w-full max-w-xs sm:max-w-none">
					{isSignedIn ? (
						<Link href="/dashboard" className="w-full sm:w-auto">
							<Button className="w-full sm:w-auto rounded-full font-bold h-10 lg:h-12 px-6 lg:px-8" size="lg">
								Dashboard{" "}
								<ArrowRightIcon className="size-4 ms-2" />
							</Button>
						</Link>
					) : (
						<Link href="/sign-in?redirect_url=/analyze" className="w-full sm:w-auto">
							<Button className="w-full sm:w-auto rounded-full font-bold h-10 lg:h-12 px-6 lg:px-8" size="lg">
								Try Free Analysis{" "}
								<ArrowRightIcon className="size-4 ms-2" />
							</Button>
						</Link>
					)}
				</div>
			</div>
		</section>
	);
}

export function LogosSection() {
	return (
		<LogoCloud
			className="opacity-60 max-w-4xl mx-auto"
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
