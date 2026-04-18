"use client"

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
			<div className="relative flex flex-col items-center justify-center gap-6 md:gap-8 pt-24 md:pt-32 pb-12 md:pb-16 px-4 md:px-6">

				<div className="flex flex-col items-center gap-1 md:gap-2 w-full max-w-5xl">
					{/* Hero title wrapper — word-break prevention */}
					<div
						style={{
							wordBreak: 'break-word',
							overflowWrap: 'break-word',
							hyphens: 'none',
							width: '100%',
							textAlign: 'center',
						}}
					>
						<RevealText 
							text="Eliminate Bias from"
							fontSize="text-[clamp(28px,7vw,72px)]"
							textColor="text-[#1D1D1F]"
							overlayColor="text-indigo-600"
							letterDelay={0.06}
							className="w-full"
						/>
						<RevealText 
							text="Hiring Decisions – Instantly."
							fontSize="text-[clamp(28px,7vw,72px)]"
							textColor="text-[#1D1D1F]"
							overlayColor="text-emerald-600"
							letterDelay={0.05}
							className="w-full"
						/>
					</div>
				</div>

				<p
					className="fade-in slide-in-from-bottom-10 mx-auto max-w-2xl animate-in fill-mode-backwards text-center tracking-wider delay-200 duration-500 ease-out font-medium"
					style={{
						fontSize: 'clamp(15px, 3vw, 18px)',
						lineHeight: '1.7',
						color: 'rgba(0,0,0,0.65)',
						maxWidth: '100%',
					}}
				>
					Rifair AI analyzes interview questions, detects hidden bias, and generates fair, inclusive alternatives — in seconds.
				</p>

				<div className="fade-in slide-in-from-bottom-10 flex animate-in flex-row flex-wrap items-center justify-center gap-3 fill-mode-backwards pt-2 delay-300 duration-500 ease-out w-full max-w-sm sm:max-w-none">
					{isSignedIn ? (
						<Link href="/dashboard" className="w-full sm:w-auto">
							<button
								className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full font-bold transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
								style={{
									background: '#0a3d2e',
									color: 'white',
									padding: '16px 32px',
									fontSize: '16px',
									fontWeight: 500,
									borderRadius: '50px',
									minHeight: '52px',
									boxShadow: '0 4px 20px rgba(10,61,46,0.3)',
								}}
							>
								Dashboard <ArrowRightIcon className="w-4 h-4" />
							</button>
						</Link>
					) : (
						<Link href="/analyze" className="w-full sm:w-auto">
							<button
								className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full font-bold transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
								style={{
									background: '#0a3d2e',
									color: 'white',
									padding: '16px 32px',
									fontSize: '16px',
									fontWeight: 500,
									borderRadius: '50px',
									minHeight: '52px',
									boxShadow: '0 4px 20px rgba(10,61,46,0.3)',
								}}
							>
								Try Free Analysis <ArrowRightIcon className="w-4 h-4" />
							</button>
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
