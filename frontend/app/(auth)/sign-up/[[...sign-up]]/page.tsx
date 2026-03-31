import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] relative overflow-hidden py-12">
      {/* Background Glows */}
      <div className="absolute w-[400px] h-[400px] bg-indigo-500 opacity-20 blur-[100px] rounded-full top-[-100px] left-[-100px]" />
      <div className="absolute w-[400px] h-[400px] bg-violet-500 opacity-20 blur-[100px] rounded-full bottom-[-100px] right-[-100px]" />

      {/* Auth Card Container */}
      <div className="w-full max-w-md z-10 px-4">
        {/* Branding */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
            EquiHire AI
          </h1>
          <p className="text-gray-400 text-sm">
            Revolutionize your hiring process.
          </p>
        </div>

        {/* Clerk Component Wrapper */}
        <div className="relative group transition-all duration-500">
           {/* Subtle glow on hover/active */}
           <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
           <SignUp 
             appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "w-full bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl",
                }
             }}
           />
        </div>
      </div>
    </div>
  );
}
