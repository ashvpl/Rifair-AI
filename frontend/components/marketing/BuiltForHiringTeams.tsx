"use client";

import { motion, useReducedMotion } from "framer-motion";
import { UserCheck, Users, Rocket, Briefcase, ArrowUpRight } from "lucide-react";
import Link from "next/link";

const audiences = [
  {
    title: "Recruiters",
    desc: "Create role-specific interview kits and evaluation scorecards faster.",
    icon: UserCheck,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
  },
  {
    title: "HR Teams",
    desc: "Standardize interviews across departments and hiring managers.",
    icon: Users,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  {
    title: "Startup Founders",
    desc: "Run structured hiring before building a full HR team.",
    icon: Rocket,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
  {
    title: "Recruitment Agencies",
    desc: "Prepare client-ready candidate summaries and evaluation notes faster.",
    icon: Briefcase,
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-100",
  },
];

export function BuiltForHiringTeams() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="audience-heading"
      className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-[#F5F5F7] border-t border-black/[0.05] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2
            id="audience-heading"
            className="text-3xl lg:text-4xl font-black text-[#1D1D1F] tracking-tight"
          >
            Built for modern hiring teams
          </h2>
          <p className="text-[#86868B] text-base lg:text-lg font-medium leading-relaxed">
            Rifair AI is designed to support every role in your talent acquisition workflow.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {audiences.map((aud, i) => {
            const Icon = aud.icon;
            return (
              <motion.div
                key={aud.title}
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                whileHover={shouldReduceMotion ? {} : { y: -3 }}
                className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all duration-300 flex flex-col justify-between"
                style={{ touchAction: 'manipulation', willChange: 'transform' }}
              >
                <div className="space-y-4">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${aud.bg} border ${aud.border}`}>
                    <Icon className={`w-5 h-5 ${aud.color}`} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-[#1D1D1F] tracking-tight">
                      {aud.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#86868B] leading-relaxed font-semibold">
                      {aud.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-6">
                  <Link
                    href="/sign-in?redirect_url=/kit"
                    className={`inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider ${aud.color} hover:underline`}
                  >
                    Get Started <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
