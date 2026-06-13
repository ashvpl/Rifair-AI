"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  MessageSquare,
  BarChart3,
  ShieldCheck,
  BookOpen,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { HiringWorkflowOutput, HiringWorkflowRow } from "@/lib/workflows/types";

// ── Panel Imports ──────────────────────────────────────────────────────────
import { JDPanel } from "./panels/JDPanel";
import { InterviewKitPanel } from "./panels/InterviewKitPanel";
import { ScorecardPanel } from "./panels/ScorecardPanel";
import { BiasReviewPanel } from "./panels/BiasReviewPanel";
import { EvaluationGuidePanel } from "./panels/EvaluationGuidePanel";
import { ExportPanel } from "./panels/ExportPanel";

interface WorkflowOutputTabsProps {
  config: HiringWorkflowRow;
  outputs: HiringWorkflowOutput;
}

const TABS = [
  { id: "jd", label: "Job Description", short: "JD", icon: FileText },
  { id: "kit", label: "Interview Kit", short: "Kit", icon: MessageSquare },
  { id: "scorecard", label: "Scorecard", short: "Score", icon: BarChart3 },
  { id: "bias", label: "Bias Review", short: "Bias", icon: ShieldCheck },
  { id: "guide", label: "Eval Guide", short: "Guide", icon: BookOpen },
  { id: "export", label: "Export", short: "Export", icon: Download },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function WorkflowOutputTabs({ config, outputs }: WorkflowOutputTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("jd");

  const renderPanel = () => {
    switch (activeTab) {
      case "jd":
        return <JDPanel jd={outputs.optimized_jd} />;
      case "kit":
        return <InterviewKitPanel kit={outputs.interview_kit} />;
      case "scorecard":
        return <ScorecardPanel scorecard={outputs.scorecard} />;
      case "bias":
        return <BiasReviewPanel biasReview={outputs.bias_review} jdBias={outputs.optimized_jd?.bias_verification} />;
      case "guide":
        return <EvaluationGuidePanel guide={outputs.evaluation_guide} />;
      case "export":
        return <ExportPanel config={config} outputs={outputs} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-0">
      {/* Tab Navigation */}
      <div className="relative">
        {/* Scrollable tab bar */}
        <div className="flex gap-0 overflow-x-auto scrollbar-none border-b border-black/[0.08]">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex items-center gap-1.5 px-4 md:px-5 py-3.5 text-xs font-bold whitespace-nowrap transition-all shrink-0",
                  "focus:outline-none",
                  isActive
                    ? "text-[#1D1D1F]"
                    : "text-[#86868B] hover:text-[#1D1D1F]"
                )}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.short}</span>

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1D1D1F] rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="pt-6"
        >
          {renderPanel()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
