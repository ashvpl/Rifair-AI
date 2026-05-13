"use client";

import React from "react";
import { motion } from "framer-motion";
import { Mail, Briefcase, Clock, CheckCircle, ShieldCheck } from "lucide-react";

const infoSections = [
  {
    icon: Mail,
    title: "Email Support",
    value: "support@rifairai.com",
    href: "mailto:support@rifairai.com",
  },
  {
    icon: Clock,
    title: "Average Response Time",
    value: "Usually within 24 hours",
  },
  {
    icon: CheckCircle,
    title: "Platform Status",
    value: "All systems operational",
    status: "success",
  },
];

export const SupportInfo = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as any }}
      className="lg:sticky lg:top-24 space-y-6"
    >
      <div className="p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-border/50 space-y-8">
        {infoSections.map((section, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <section.icon className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">{section.title}</span>
            </div>
            {section.href ? (
              <a
                href={section.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-medium hover:text-primary transition-colors underline-offset-4 hover:underline"
              >
                {section.value}
              </a>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-lg font-medium">{section.value}</span>
                {section.status === "success" && (
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                )}
              </div>
            )}
          </div>
        ))}

        <div className="pt-6 border-t border-border/50 space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10">
            <ShieldCheck className="w-6 h-6 text-primary shrink-0" />
            <div className="space-y-0.5">
              <p className="text-sm font-semibold">Trust Line</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Used by modern recruiting teams and AI-first organizations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
