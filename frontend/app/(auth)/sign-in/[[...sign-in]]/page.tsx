import { SignIn } from "@clerk/nextjs";
import Image from "next/image";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
      <div className="w-full max-w-md z-10 px-6 py-12">
        {/* Logo only — no title, no subtitle */}
        <div className="mb-10 flex justify-center">
          <Image
            src="/whatsapp-logo.jpeg"
            alt="EquiHire AI"
            width={200}
            height={50}
            className="h-10 w-auto object-contain"
            priority
          />
        </div>

        {/* Clerk Sign In */}
        <SignIn
          forceRedirectUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "w-full bg-white border border-black/[0.05] shadow-none rounded-[2rem] p-4",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              header: "hidden",
              socialButtonsBlockButton:
                "border-black/[0.05] hover:bg-[#F5F5F7] transition-all rounded-2xl shadow-sm",
              socialButtonsBlockButtonText: "font-bold text-[#1D1D1F]",
              formButtonPrimary:
                "bg-black hover:bg-black/90 text-white font-semibold transition-all h-12 rounded-2xl",
              formFieldLabel:
                "text-[#86868B] font-black uppercase text-[9px] tracking-widest",
              formFieldInput:
                "border-black/[0.05] bg-[#F5F5F7]/30 focus:bg-white rounded-2xl h-12 shadow-inner",
              footerActionText: "text-[#86868B] font-bold",
              footerActionLink:
                "text-black font-black hover:text-black/70 transition-colors",
            },
          }}
        />
      </div>
    </div>
  );
}
