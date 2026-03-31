import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#020617] relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-700"></div>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="mb-8 text-center pt-10">
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Join EquiHire AI</h1>
            <p className="text-slate-400">Revolutionize your hiring process</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-1 border border-white/10 shadow-2xl overflow-hidden mb-10">
            <SignUp 
                appearance={{
                    elements: {
                        rootBox: "w-full",
                        card: "bg-transparent shadow-none border-none",
                        headerTitle: "hidden",
                        headerSubtitle: "hidden",
                        socialButtonsBlockButton: "bg-white/5 border-white/10 text-white hover:bg-white/10 transition-all",
                        socialButtonsBlockButtonText: "text-white font-medium",
                        dividerLine: "bg-white/10",
                        dividerText: "text-slate-400",
                        formFieldLabel: "text-slate-300 font-medium mb-1.5",
                        formFieldInput: "bg-white/5 border-white/10 text-white focus:ring-indigo-500 focus:border-indigo-500 rounded-xl h-12 transition-all",
                        formButtonPrimary: "bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-indigo-500/20 transition-all",
                        footerActionText: "text-slate-400 font-medium",
                        footerActionLink: "text-indigo-400 hover:text-indigo-300 transition-colors",
                        identityPreviewText: "text-white",
                        identityPreviewEditButtonIcon: "text-indigo-400",
                        formFieldIcon: "text-indigo-400"
                    }
                }}
            />
        </div>
      </div>
    </div>
  );
}
