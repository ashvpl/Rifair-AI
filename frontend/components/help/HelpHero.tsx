"use client";

import React from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

export const HelpHero = () => {
  return (
    <section className="relative pt-24 pb-16 px-6 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-gradient-to-b from-primary/5 via-primary/2 to-transparent blur-[120px]" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[80px] animate-pulse-slow" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4"
        >
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">
            How can we help?
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Get support, report issues, ask questions, or connect with the Rifair AI team.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl mx-auto relative group"
        >
          <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-xl transition-all group-focus-within:bg-primary/10" />
          <div className="relative flex items-center">
            <Search className="absolute left-5 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <input
              type="text"
              placeholder="Search for help, billing, interviews, subscriptions..."
              className="w-full h-14 pl-14 pr-6 bg-background/50 backdrop-blur-xl border border-border/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-base placeholder:text-muted-foreground/60"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};
