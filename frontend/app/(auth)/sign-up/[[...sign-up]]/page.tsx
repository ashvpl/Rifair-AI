"use client";

import { useState } from "react";
import LegalConsent from "@/components/auth/LegalConsent";
import { AuthUI, AuthFormContainer } from "@/components/ui/auth-fuse";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [agreed, setAgreed] = useState(false);
  const router = useRouter();

  return (
    <AuthUI initialIsSignIn={false}>
      <div className="w-full max-w-md z-10 px-6">
        <div className="mb-10 flex justify-center">
          <Image
            src="/rifair-logo.png"
            alt="Rifair AI"
            width={70}
            height={70}
            className="h-[70px] w-auto object-contain"
            priority
          />
        </div>

        {/* Legal Consent First */}
        <LegalConsent agreed={agreed} setAgreed={setAgreed} />

        {/* Custom Auth Form — only interactable if agreed */}
        <div className={cn(
          "transition-all duration-700 mt-6",
          !agreed ? "opacity-40 blur-[2px] pointer-events-none grayscale" : "opacity-100 blur-0"
        )}>
          <AuthFormContainer 
            isSignIn={false} 
            onToggle={() => router.push("/sign-in")} 
          />
        </div>
      </div>
    </AuthUI>
  );
}
