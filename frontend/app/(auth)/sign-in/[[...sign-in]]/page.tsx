"use client";

import { useState } from "react";
import LegalConsent from "@/components/auth/LegalConsent";
import { AuthUI, AuthFormContainer } from "@/components/ui/auth-fuse";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [agreed, setAgreed] = useState(false);
  const router = useRouter();

  return (
    <AuthUI initialIsSignIn={true}>
      <div className="w-full max-w-[min(28rem,calc(100vw-2rem))] lg:max-w-md xl:max-w-lg z-10">
        <div className="mb-8 flex justify-center">
          <Image
            src="/rifair-logo.png"
            alt="Rifair AI"
            width={120}
            height={120}
            className="h-[100px] sm:h-[120px] w-auto object-contain"
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
            isSignIn={true} 
            onToggle={() => router.push("/sign-up")} 
          />
        </div>
      </div>
    </AuthUI>
  );
}
