"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ClipboardList, FileText, FileSearch, Users, Layers } from "lucide-react";

const actions = [
  {
    label: "Build Hiring Workflow",
    desc: "Create full end-to-end evaluation builder",
    href: "/dashboard/workflows/new",
    icon: Layers,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
    hoverBorder: "hover:border-blue-300",
  },
  {
    label: "Generate Interview Kit",
    desc: "Create structured questions and rubrics",
    href: "/kit",
    icon: ClipboardList,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    hoverBorder: "hover:border-emerald-300",
  },
  {
    label: "Analyze Bias",
    desc: "Detect biased or inconsistent questions",
    href: "/analyze",
    icon: FileText,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-100",
    hoverBorder: "hover:border-red-300",
  },
  {
    label: "Optimize Job Description",
    desc: "Improve clarity, inclusivity, and role fit",
    href: "/jd-analyser",
    icon: FileSearch,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
    hoverBorder: "hover:border-amber-300",
  },
  {
    label: "Create Candidate Scorecard",
    desc: "Evaluate candidates with consistent criteria",
    href: "/evaluations",
    icon: Users,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
    hoverBorder: "hover:border-indigo-300",
  },
];

export function WorkflowQuickActions() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section aria-label="Quick workflow actions">
      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#86868B] mb-3">
        Quick Actions
      </p>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.label}
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              style={{ willChange: 'transform' }}
            >
              <Link
                href={action.href}
                style={{ touchAction: 'manipulation' }}
                className={`group flex flex-col gap-3 h-full p-4 rounded-xl border-2 ${action.border} ${action.bg} ${action.hoverBorder} hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-200 shadow-sm hover:shadow-md`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-white border ${action.border}`}>
                  <Icon className={`w-4 h-4 ${action.color}`} />
                </div>
                <div>
                  <p className={`text-xs font-black ${action.color} leading-tight`}>{action.label}</p>
                  <p className="text-[10px] font-medium text-[#86868B] mt-0.5 leading-tight">{action.desc}</p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
