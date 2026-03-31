import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function LandingPage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      
      <header className="px-8 lg:px-16 h-20 flex items-center justify-between border-b border-slate-50">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <ShieldAlert className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-slate-900 tracking-tight">EquiHire AI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/sign-in">
            <Button variant="ghost" className="text-slate-600 font-medium">Log in</Button>
          </Link>
          <Link href="/sign-up">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-full px-6 shadow-md transition-all">
              Sign Up Free
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 lg:py-32 px-8 lg:px-16">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <span className="text-sm font-semibold text-indigo-700 uppercase tracking-wider">AI-Powered Compliance</span>
              </div>
              <h1 className="text-6xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
                Fix Interview Bias <span className="text-indigo-600">Before</span> It Happens.
              </h1>
              <p className="text-xl text-slate-500 leading-relaxed max-w-xl">
                EquiHire AI uses advanced language models to detect hidden bias in your interview questions, ensuring fair hiring and reducing legal risk.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/sign-up">
                  <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-14 px-10 rounded-2xl shadow-xl shadow-indigo-200 group transition-all">
                    Get Started Now
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 italic text-slate-400 text-sm">
                  &quot;No credit card required for MVP trial&quot;
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 pt-10 border-t border-slate-100">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                    <span className="font-bold text-slate-900 uppercase text-xs tracking-widest">Bias Detection</span>
                  </div>
                  <p className="text-slate-500 text-sm">Gender, Age, and Cultural bias screening.</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                    <span className="font-bold text-slate-900 uppercase text-xs tracking-widest">Risk Scoring</span>
                  </div>
                  <p className="text-slate-500 text-sm">Instant compliance risk level (0-100).</p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-4 bg-indigo-100 rounded-[3rem] blur-3xl opacity-50 -z-10"></div>
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-2xl relative overflow-hidden group">
                <div className="h-40 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center p-8 space-y-4 group-hover:border-indigo-200 transition-colors">
                  <div className="h-10 w-full bg-slate-200/50 rounded-full animate-pulse"></div>
                  <div className="h-10 w-1/2 bg-slate-200/50 rounded-full animate-pulse"></div>
                </div>
                <div className="mt-8 space-y-6">
                  <div className="h-4 w-full bg-slate-100 rounded-full"></div>
                  <div className="h-4 w-11/12 bg-slate-100 rounded-full"></div>
                  <div className="h-4 w-4/5 bg-slate-100 rounded-full"></div>
                </div>
                <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-emerald-200 mt-4 mr-4">
                  Demo Ready
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="py-10 px-8 border-t border-slate-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-slate-400 text-sm">
            © 2026 EquiHire AI Platform. All rights reserved.
          </p>
          <div className="flex items-center gap-8">
            <Link href="#" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">Privacy</Link>
            <Link href="#" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">Terms</Link>
            <Link href="#" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">Resources</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
