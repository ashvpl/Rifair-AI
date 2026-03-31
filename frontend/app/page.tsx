"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { Header } from "@/components/Header";

export default function LandingPage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && userId) {
      router.push("/analyze");
    }
  }, [isLoaded, userId, router]);

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* Background Glow Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-primary/20 rounded-full blur-[120px] animate-blob -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-secondary/20 rounded-full blur-[120px] animate-blob animation-delay-4000 -z-10" />

      <Header />

      <main className="flex-1 flex flex-col justify-center pt-24">
        <section className="py-20 lg:py-32 px-6 lg:px-12 relative">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-full backdrop-blur-md">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary uppercase tracking-wider">Enterprise-Grade AI</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-extrabold text-foreground leading-[1.1] tracking-tight">
                Eliminate Hidden Bias in Hiring&nbsp;— <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Instantly with AI.</span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                Analyze, correct, and generate bias-free interview questions with enterprise-grade AI. Create a fairer hiring process without sacrificing quality.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/analyze">
                  <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-14 px-8 rounded-xl shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] group transition-all hover:scale-105">
                    Try Analyzer
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/kit">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-border bg-surface hover:bg-surface/80 text-foreground font-bold h-14 px-8 rounded-xl backdrop-blur-md transition-all hover:scale-105">
                    Generate Interview Kit
                  </Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-2 gap-6 pt-10 border-t border-border/50">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span className="font-bold text-foreground uppercase text-xs tracking-widest">Real-time Analysis</span>
                  </div>
                  <p className="text-muted-foreground text-sm">Detect risk instantly.</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span className="font-bold text-foreground uppercase text-xs tracking-widest">Smart Improvements</span>
                  </div>
                  <p className="text-muted-foreground text-sm">Get bias-free alternatives.</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="relative"
            >
              <div className="glass-panel p-8 relative overflow-hidden group">
                {/* Decorative UI elements representing the product */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[50px]"></div>
                
                <div className="h-40 bg-surface rounded-xl border border-border flex flex-col items-center justify-center p-8 space-y-4 group-hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-4 w-full">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <ShieldAlert className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="h-2 w-full bg-border rounded-full animate-shimmer"></div>
                      <div className="h-2 w-3/4 bg-border rounded-full animate-shimmer"></div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 space-y-4">
                  <div className="flex justify-between items-center p-4 bg-background/50 rounded-xl border border-border">
                    <span className="text-sm font-medium text-foreground">Cultural Bias Risk</span>
                    <span className="text-sm font-bold text-warning">Medium</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-background/50 rounded-xl border border-border">
                    <span className="text-sm font-medium text-foreground">Gender Bias Risk</span>
                    <span className="text-sm font-bold text-success">Low</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-primary/10 rounded-xl border border-primary/20">
                    <span className="text-sm font-medium text-primary">Overall Score</span>
                    <span className="text-xl font-bold text-primary">92/100</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      
      <footer className="py-8 px-6 lg:px-12 border-t border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-muted-foreground text-sm">
            © 2026 EquiHire AI Platform. All rights reserved.
          </p>
          <div className="flex items-center gap-8">
            <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Privacy</span>
            <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
