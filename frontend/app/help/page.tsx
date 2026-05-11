"use client";

import React from "react";
import { HelpHero } from "@/components/help/HelpHero";
import { HelpCards } from "@/components/help/HelpCards";
import { SupportForm } from "@/components/help/SupportForm";
import { SupportInfo } from "@/components/help/SupportInfo";
import { FAQSection } from "@/components/help/FAQSection";
import { EnterpriseCTA } from "@/components/help/EnterpriseCTA";
import { motion } from "framer-motion";

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-background selection:bg-primary/10">
      <HelpHero />
      
      <HelpCards />

      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-2">
            <SupportForm />
          </div>
          <div className="lg:col-span-1">
            <SupportInfo />
          </div>
        </div>
      </section>

      <FAQSection />

      <EnterpriseCTA />

      {/* Subtle bottom separator */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
      </div>
      
      <footer className="py-12 text-center">
        <p className="text-sm text-muted-foreground/60">
          © {new Date().getFullYear()} Rifair AI. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
