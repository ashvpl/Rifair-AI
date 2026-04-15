"use client"

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RocketIcon, ArrowRightIcon, PhoneCallIcon } from "lucide-react";
import { LogoCloud } from "@/components/ui/logo-cloud-3";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { RevealText } from "@/components/ui/reveal-text";
import { SVGFollower } from "@/components/ui/svg-follower";
import { Banner } from "@/components/ui/banner";

export function HeroSection() {
	const { isSignedIn } = useAuth();
	return (
		<section className="mx-auto w-full max-w-7xl relative group/hero">
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
			<div className="relative flex flex-col items-center justify-center gap-8 pt-32 pb-16 px-6">

				<div className="flex flex-col items-center gap-2">
					<RevealText 
						text="Eliminate Bias from"
						fontSize="text-4xl md:text-5xl lg:text-7xl"
						textColor="text-[#1D1D1F]"
						overlayColor="text-indigo-600"
						letterDelay={0.06}
						className="max-w-[100vw]"
					/>
					<RevealText 
						text="Hiring Decisions – Instantly."
						fontSize="text-4xl md:text-5xl lg:text-7xl"
						textColor="text-[#1D1D1F]"
						overlayColor="text-emerald-600"
						letterDelay={0.05}
						className="max-w-[100vw]"
					/>
				</div>

				<p className="fade-in slide-in-from-bottom-10 mx-auto max-w-2xl animate-in fill-mode-backwards text-center text-base text-foreground/80 tracking-wider delay-200 duration-500 ease-out sm:text-lg md:text-xl font-medium">
					Rifair AI analyzes interview questions, detects hidden bias, and generates fair, inclusive alternatives — in seconds.
				</p>

				<div className="fade-in slide-in-from-bottom-10 flex animate-in flex-row flex-wrap items-center justify-center gap-3 fill-mode-backwards pt-2 delay-300 duration-500 ease-out">
					{isSignedIn ? (
						<Link href="/dashboard">
							<Button className="rounded-full font-bold h-12 px-8" size="lg">
								Dashboard{" "}
								<ArrowRightIcon className="size-4 ms-2" />
							</Button>
						</Link>
					) : (
						<Link href="/analyze">
							<Button className="rounded-full font-bold h-12 px-8" size="lg">
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
		<section className="relative space-y-8 border-t border-black/[0.03] pt-12 pb-16">
			<h2 className="text-center font-black text-sm uppercase text-[#86868B] tracking-[0.3em]">
				Powered by 
			</h2>
			<div className="relative z-10 mx-auto max-w-4xl">
				<LogoCloud logos={logos} />
			</div>
		</section>
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
		src: "https://storage.efferd.com/logo/github-wordmark.svg",
		alt: "GitHub Logo",
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
