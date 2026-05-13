"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";

export const EnterpriseCTA = () => {
  return (
    <section className="max-w-7xl mx-auto px-6 py-24">
      <div className="relative p-12 md:p-20 rounded-[3rem] overflow-hidden bg-primary/5 border border-primary/10 text-center space-y-10">
        {/* Animated background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-64 bg-primary/10 blur-[120px] animate-pulse-slow" />
        
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold uppercase tracking-widest text-primary">
            <Building2 className="w-3.5 h-3.5" />
            Enterprise Solutions
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight max-w-2xl mx-auto text-balance">
            Need enterprise-grade recruitment solutions?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Connect with the Rifair AI team for custom hiring workflows, scalable recruitment infrastructure, and AI-powered enterprise solutions.
          </p>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-4">
          <a 
            href="mailto:sales@rifairai.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative px-8 h-14 bg-primary text-primary-foreground font-semibold rounded-2xl overflow-hidden shadow-xl hover:shadow-primary/20 transition-all flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative z-10 flex items-center gap-2">
              Contact Sales
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </a>
          <Link 
            href="/"
            className="px-8 h-14 bg-background/50 border border-border/50 hover:bg-background transition-all font-semibold rounded-2xl flex items-center justify-center"
          >
            Explore Platform
          </Link>
        </div>
      </div>
    </section>
  );
};
