
"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface LegalConsentProps {
  agreed: boolean;
  setAgreed: (agreed: boolean) => void;
}

export default function LegalConsent({ agreed, setAgreed }: LegalConsentProps) {
  return (
    <div className="mb-6 px-2">
      <label className="group flex items-start gap-3 cursor-pointer select-none">
        <div className="relative flex items-center justify-center mt-1">
          <input
            type="checkbox"
            className="peer sr-only"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <div className={cn(
            "h-5 w-5 rounded-md border-2 transition-all duration-300 flex items-center justify-center",
            agreed 
              ? "bg-black border-black scale-110 shadow-lg shadow-black/10" 
              : "bg-[#F5F5F7] border-black/10 group-hover:border-black/30"
          )}>
            <Check className={cn(
              "h-3.5 w-3.5 text-white transition-opacity duration-300",
              agreed ? "opacity-100" : "opacity-0"
            )} strokeWidth={4} />
          </div>
        </div>
        
        <span className="text-[12px] leading-[1.5] text-[#86868B] font-medium transition-colors group-hover:text-[#1D1D1F]">
          I have read and agree to Rifair AI's{" "}
          <Link href="/terms" className="text-black font-bold hover:underline" onClick={(e) => e.stopPropagation()}>
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-black font-bold hover:underline" onClick={(e) => e.stopPropagation()}>
            Privacy Policy
          </Link>.{" "}
          <span className="block mt-1 text-[11px] opacity-70">
            By checking this box, I consent to the processing of my data to provide hiring intelligence services.
          </span>
        </span>
      </label>
    </div>
  );
}
