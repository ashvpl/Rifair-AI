"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { Laptop, CreditCard, Users, Bug } from "lucide-react";

const cards = [
  {
    icon: Laptop,
    title: "Technical Support",
    description: "Having issues with interviews, authentication, or platform functionality?",
  },
  {
    icon: CreditCard,
    title: "Billing & Subscription",
    description: "Questions about plans, invoices, payments, or upgrades.",
  },
  {
    icon: Users,
    title: "Enterprise & Teams",
    description: "Support for HR workflows, organizations, and recruiting teams.",
  },
  {
    icon: Bug,
    title: "Report a Bug",
    description: "Found an issue? Help us improve Rifair AI.",
  },
];

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export const HelpCards = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {cards.map((card, index) => (
          <motion.div
            key={index}
            variants={item}
            whileHover={{ y: -4 }}
            className="group relative p-6 sm:p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all cursor-pointer overflow-hidden"
          >
            {/* Hover glow */}
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity blur-2xl" />
            
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary group-hover:scale-110 transition-transform">
                <card.icon className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold tracking-tight text-foreground">
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {card.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};
