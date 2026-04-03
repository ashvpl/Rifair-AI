import { SignIn } from "@clerk/nextjs";
import Image from "next/image";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white selection:bg-black selection:text-white relative overflow-hidden">
      {/* Auth Card Container */}
      <div className="w-full max-w-md z-10 px-6 py-12">
        {/* Branding */}
        <div className="mb-12 text-center space-y-6 flex flex-col items-center">
          <div className="mx-auto flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer">
             <Image src="/whatsapp-logo.jpeg" alt="EquiHire AI" width={240} height={60} className="h-10 w-auto object-contain" />
          </div>
        </div>

        {/* Clerk Component Wrapper */}
        <div className="relative group transition-all duration-700 hover:scale-[1.01]">
            <SignIn 
              appearance={{
                 elements: {
                   rootBox: "w-full",
                   card: "w-full bg-white border border-black/[0.05] shadow-[0_32px_120px_rgba(0,0,0,0.06)] rounded-[2.5rem] p-4",
                   headerTitle: "text-[#1D1D1F] font-extrabold tracking-tight",
                   headerSubtitle: "text-[#86868B] font-bold",
                   socialButtonsBlockButton: "border-black/[0.05] hover:bg-[#F5F5F7] transition-all rounded-2xl shadow-sm",
                   socialButtonsBlockButtonText: "font-bold text-[#1D1D1F]",
                   formButtonPrimary: "bg-black hover:bg-black/90 text-white font-heavy transition-all h-14 rounded-2xl shadow-xl",
                   formFieldLabel: "text-[#86868B] font-black uppercase text-[9px] tracking-widest",
                   formFieldInput: "border-black/[0.05] bg-[#F5F5F7]/30 focus:bg-white rounded-2xl h-12 shadow-inner",
                   footerActionText: "text-[#86868B] font-bold",
                   footerActionLink: "text-primary font-black hover:text-primary/80 transition-colors"
                 }
              }}
            />
        </div>

        <div className="mt-12 text-center">
           <p className="text-[9px] font-black text-[#86868B] uppercase tracking-[0.4em] opacity-40">Secure Identity Layer v1.0.4</p>
        </div>
      </div>
    </div>
  );
}
