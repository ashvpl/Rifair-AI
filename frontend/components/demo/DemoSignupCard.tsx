"use client";

import React from "react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Check } from "lucide-react";

export function DemoSignupCard() {
  const { isSignedIn } = useAuth();

  return (
    <div className="bg-white border border-black/[0.08] rounded-3xl p-6 md:p-8 shadow-xs w-full">
      {isSignedIn ? (
        <div className="flex flex-col items-center text-center space-y-4">
          <h3 className="text-xl md:text-2xl font-bold text-[#1D1D1F]">
            Ready to build the full workflow?
          </h3>
          <p className="text-sm font-semibold text-[#86868B] max-w-md">
            You're currently signed in. Go to the dashboard to access all premium structured hiring features.
          </p>
          <div className="w-full max-w-xs pt-2">
            <Link href="/dashboard/workflows/new" className="w-full">
              <Button className="w-full h-11 bg-black text-white hover:bg-black/90 font-bold rounded-full transition-transform active:scale-98">
                Open Full Workflow Builder
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Column: Heading and Checkmarks */}
          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-bold text-[#1D1D1F]">
              Want to use this in a real hiring process?
            </h3>
            <p className="text-sm font-semibold text-[#86868B] leading-relaxed">
              Create a free account to save this workflow, generate the full interview kit, export scorecards, and evaluate candidates.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                "Save hiring workflows",
                "Generate full outputs",
                "Export reports",
                "Evaluate candidates",
                "Compare applicants soon"
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-xs font-bold text-[#1D1D1F]">
                  <div className="w-4 h-4 rounded-full bg-emerald-50 border border-emerald-200/50 flex items-center justify-center text-emerald-600 shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: CTAs */}
          <div className="flex flex-col items-stretch lg:items-end justify-center space-y-3">
            <div className="w-full max-w-xs space-y-2 lg:ml-auto">
              <Link href="/sign-up?redirect=/dashboard/workflows/new" className="w-full">
                <Button className="w-full h-11 bg-black text-white hover:bg-black/90 font-bold rounded-full transition-transform active:scale-98">
                  Create Free Account
                </Button>
              </Link>
              <div className="text-center">
                <span className="text-[10px] sm:text-xs font-semibold text-[#86868B] tracking-wide">
                  Free plan available.
                </span>
              </div>
              <Link href="/pricing" className="w-full block">
                <Button variant="outline" className="w-full h-11 border-black/10 hover:bg-black/5 font-bold rounded-full">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
