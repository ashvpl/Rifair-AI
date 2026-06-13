"use client";

import React, { useState } from "react";
import { DemoWorkflowOutput } from "@/types/demo";
import { useAuth } from "@clerk/nextjs";
import {
  FileText,
  MessageSquare,
  BarChart3,
  ShieldCheck,
  BookOpen,
  Copy,
  Check,
  Download,
  Save,
  Users,
  AlertTriangle,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface DemoWorkflowPreviewProps {
  output: DemoWorkflowOutput | null;
  onLockTrigger: (feature: string) => void;
}

const TABS = [
  { id: "jd", label: "Job Description", short: "JD", icon: FileText },
  { id: "kit", label: "Interview Kit", short: "Kit", icon: MessageSquare },
  { id: "scorecard", label: "Scorecard", short: "Score", icon: BarChart3 },
  { id: "bias", label: "Bias Review", short: "Bias", icon: ShieldCheck },
  { id: "guide", label: "Eval Guide", short: "Guide", icon: BookOpen },
] as const;

type TabId = typeof TABS[number]["id"];

export function DemoWorkflowPreview({ output, onLockTrigger }: DemoWorkflowPreviewProps) {
  const [activeTab, setActiveTab] = useState<TabId>("jd");
  const [copied, setCopied] = useState(false);
  const { isSignedIn } = useAuth();

  if (!output) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[400px] border border-dashed border-black/10 rounded-3xl text-center bg-white/50">
        <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center text-[#86868B] mb-4">
          <FileText className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-[#1D1D1F] mb-1">
          Generate your hiring workflow
        </h3>
        <p className="text-sm font-semibold text-[#86868B] max-w-xs leading-relaxed">
          Choose a role, seniority, and company type to generate a structured hiring workflow preview.
        </p>
      </div>
    );
  }

  const handleCopy = () => {
    let copyText = "";
    if (activeTab === "jd") {
      copyText = `${output.optimizedJD.title}\n\nSummary:\n${output.optimizedJD.roleSummary}\n\nResponsibilities:\n${output.optimizedJD.responsibilities.map(r => `- ${r}`).join("\n")}\n\nRequired Skills:\n${output.optimizedJD.requiredSkills.join(", ")}\n\nNice-to-Have:\n${output.optimizedJD.niceToHaveSkills.join(", ")}\n\nSuccess Metrics:\n${output.optimizedJD.successMetrics.map(m => `- ${m}`).join("\n")}`;
    } else if (activeTab === "kit") {
      copyText = `Interview Kit - ${output.optimizedJD.title}\n\nStructure:\n${output.interviewKit.structure.join("\n")}\n\nQuestions:\n` +
        output.interviewKit.questions.map((q, i) => `${i + 1}. Q: ${q.question}\n   Competency: ${q.competency}\n   Why it matters: ${q.whyItMatters}\n   Scoring: ${q.scoringGuidance}`).join("\n\n");
    } else if (activeTab === "scorecard") {
      copyText = `Scorecard - ${output.optimizedJD.title}\n\nCriteria:\n` +
        output.scorecard.criteria.map((c) => `- ${c.name} (${c.weight}%): ${c.description}\n  Positive Signals: ${c.positiveSignals.join(", ")}\n  Concerns: ${c.concernSignals.join(", ")}`).join("\n\n");
    } else if (activeTab === "bias") {
      copyText = `Bias Review - Overall Risk: ${output.biasReview.overallRisk}\n\nGuidelines:\n${output.biasReview.generalGuidelines.join("\n")}\n\nItems:\n` +
        output.biasReview.items.map((it) => `- ${it.area}: ${it.issue}\n  Safer alternative: ${it.saferAlternative}`).join("\n\n");
    } else if (activeTab === "guide") {
      copyText = `Evaluation Guide - ${output.optimizedJD.title}\n\nBefore Interview:\n${output.evaluationGuide.beforeInterview.map(s => `- ${s}`).join("\n")}\n\nDuring Interview:\n${output.evaluationGuide.duringInterview.map(s => `- ${s}`).join("\n")}\n\nAfter Interview:\n${output.evaluationGuide.afterInterview.map(s => `- ${s}`).join("\n")}\n\nDecision Guidance:\n${output.evaluationGuide.decisionGuidance.map(s => `- ${s}`).join("\n")}`;
    }

    navigator.clipboard.writeText(copyText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case "jd":
        return (
          <div className="space-y-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#86868B]">
                Optimized Title
              </span>
              <h3 className="text-lg font-black text-[#1D1D1F] mt-0.5">
                {output.optimizedJD.title}
              </h3>
            </div>

            <div className="border-t border-black/[0.04] pt-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#86868B]">
                Role Summary
              </span>
              <p className="text-xs font-semibold text-[#555555] leading-relaxed mt-1">
                {output.optimizedJD.roleSummary}
              </p>
            </div>

            <div className="border-t border-black/[0.04] pt-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#86868B]">
                Key Responsibilities
              </span>
              <ul className="list-disc list-inside space-y-2 mt-2">
                {output.optimizedJD.responsibilities.map((resp, i) => (
                  <li key={i} className="text-xs font-semibold text-[#555555] leading-relaxed pl-1 list-none flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-black/30 shrink-0 mt-1.5" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-black/[0.04] pt-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#86868B]">
                  Required Skills
                </span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {output.optimizedJD.requiredSkills.map((skill, i) => (
                    <span key={i} className="px-2.5 py-1 bg-black/5 text-black rounded-md text-[11px] font-bold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#86868B]">
                  Nice-to-Have Skills
                </span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {output.optimizedJD.niceToHaveSkills.map((skill, i) => (
                    <span key={i} className="px-2.5 py-1 bg-black/[0.02] border border-black/10 text-[#555555] rounded-md text-[11px] font-semibold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-black/[0.04] pt-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#86868B]">
                Success Metrics (First 90 Days)
              </span>
              <ul className="space-y-2 mt-2">
                {output.optimizedJD.successMetrics.map((met, i) => (
                  <li key={i} className="text-xs font-semibold text-[#555555] leading-relaxed flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                    <span>{met}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );

      case "kit":
        return (
          <div className="space-y-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#86868B]">
                Suggested Interview Structure
              </span>
              <div className="flex flex-wrap gap-2 mt-2">
                {output.interviewKit.structure.map((step, i) => (
                  <span key={i} className="px-2.5 py-1 bg-black/[0.02] border border-black/[0.04] text-[11px] font-bold rounded-lg text-[#555555]">
                    {step}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4 border-t border-black/[0.04] pt-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#86868B] block mb-1">
                Structured Questions
              </span>
              {output.interviewKit.questions.map((q, index) => (
                <div key={index} className="p-4 bg-black/[0.01] border border-black/[0.04] rounded-2xl space-y-3">
                  <div className="flex justify-between items-start gap-3">
                    <span className="text-xs font-bold text-[#1D1D1F]">
                      Q{index + 1}: {q.question}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="px-2 py-0.5 bg-black/5 text-[#86868B] rounded-full text-[9px] font-bold uppercase tracking-wider whitespace-nowrap">
                        {q.competency}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider whitespace-nowrap border ${
                        q.biasRisk === "High"
                          ? "bg-red-50 text-red-600 border-red-100"
                          : q.biasRisk === "Medium"
                          ? "bg-amber-50 text-amber-600 border-amber-100"
                          : "bg-emerald-50 text-emerald-600 border-emerald-100"
                      }`}>
                        {q.biasRisk} Bias Risk
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-[11px] border-t border-black/[0.03]">
                    <div className="space-y-1">
                      <span className="font-bold text-[#86868B] uppercase tracking-wider text-[9px]">Why it matters:</span>
                      <p className="text-[#555555] font-semibold leading-relaxed">{q.whyItMatters}</p>
                      
                      <span className="font-bold text-[#86868B] uppercase tracking-wider text-[9px] block pt-2">Scoring guidance:</span>
                      <p className="text-[#555555] font-semibold leading-relaxed">{q.scoringGuidance}</p>
                    </div>

                    <div className="space-y-2 bg-white p-3 rounded-xl border border-black/[0.03]">
                      <div>
                        <span className="font-bold text-emerald-600 uppercase tracking-wider text-[9px]">Strong Answer Signals:</span>
                        <ul className="list-disc list-inside space-y-1 mt-1 text-[#555555]">
                          {q.strongAnswerSignals.map((sig, sIdx) => (
                            <li key={sIdx} className="text-[10px] font-semibold pl-1 list-none flex items-start gap-1.5">
                              <span className="text-emerald-500 font-black">✓</span>
                              <span>{sig}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <span className="font-bold text-red-500 uppercase tracking-wider text-[9px]">Red Flags:</span>
                        <ul className="list-disc list-inside space-y-1 mt-1 text-[#555555]">
                          {q.redFlags.map((flag, fIdx) => (
                            <li key={fIdx} className="text-[10px] font-semibold pl-1 list-none flex items-start gap-1.5">
                              <span className="text-red-500 font-black">✗</span>
                              <span>{flag}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "scorecard":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-black/[0.01] border border-black/[0.04] p-3 rounded-xl">
              <span className="text-xs font-bold text-[#1D1D1F]">Recommendation Scale</span>
              <div className="flex gap-1">
                {output.scorecard.recommendationScale.map((scale, i) => (
                  <span key={i} className="px-2 py-0.5 bg-white border border-black/[0.04] rounded text-[9px] font-bold text-[#86868B]">
                    {scale}
                  </span>
                ))}
              </div>
            </div>

            <div className="overflow-hidden border border-black/[0.06] rounded-2xl bg-white">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/[0.02] border-b border-black/[0.06]">
                    <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-[#86868B]">Criterion</th>
                    <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-[#86868B] text-center w-20">Weight</th>
                    <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-[#86868B]">Positive Signals</th>
                    <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-[#86868B]">Concern Signals</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04]">
                  {output.scorecard.criteria.map((c, i) => (
                    <tr key={i} className="hover:bg-black/[0.01] items-start">
                      <td className="p-3 text-xs font-bold text-[#1D1D1F] max-w-[150px]">
                        <div>{c.name}</div>
                        <div className="text-[10px] font-semibold text-[#86868B] mt-0.5 leading-relaxed hidden md:block">{c.description}</div>
                      </td>
                      <td className="p-3 text-xs font-bold text-[#1D1D1F] text-center bg-black/[0.01]">
                        {c.weight}%
                      </td>
                      <td className="p-3 text-[10px] font-semibold text-[#555555]">
                        <ul className="space-y-0.5">
                          {c.positiveSignals.slice(0, 3).map((sig, sIdx) => (
                            <li key={sIdx} className="flex items-start gap-1">
                              <span className="text-emerald-500 font-bold shrink-0">✓</span>
                              <span>{sig}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="p-3 text-[10px] font-semibold text-[#86868B]">
                        <ul className="space-y-0.5">
                          {c.concernSignals.slice(0, 3).map((con, cIdx) => (
                            <li key={cIdx} className="flex items-start gap-1 text-red-500/80">
                              <span className="font-bold shrink-0">✗</span>
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                  {/* Totals row */}
                  <tr className="bg-black/5 font-bold">
                    <td className="p-3 text-xs text-[#1D1D1F]">Total Scale Weight</td>
                    <td className="p-3 text-xs text-[#1D1D1F] text-center">{output.scorecard.totalWeight}%</td>
                    <td colSpan={2} className="p-3 text-[10px] text-[#86868B]">Standardized calibration enabled.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case "bias":
        return (
          <div className="space-y-4">
            <div className={`flex items-center gap-3 p-4 border rounded-2xl ${
              output.biasReview.overallRisk === "High"
                ? "bg-red-50/50 border-red-100/50 text-red-900"
                : output.biasReview.overallRisk === "Medium"
                ? "bg-amber-50/50 border-amber-100/50 text-amber-900"
                : "bg-emerald-50/50 border-emerald-100/50 text-emerald-900"
            }`}>
              <ShieldCheck className={`w-5 h-5 shrink-0 ${
                output.biasReview.overallRisk === "High"
                  ? "text-red-600"
                  : output.biasReview.overallRisk === "Medium"
                  ? "text-amber-600"
                  : "text-emerald-600"
              }`} />
              <div>
                <span className="text-xs font-bold block">Overall Bias Risk Score: {output.biasReview.overallRisk}</span>
                <span className="text-[10px] font-semibold block opacity-80">
                  Flags potential bias-sensitive phrasing or non-structured evaluation traps.
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#86868B] block">Bias Warnings & Suggestions</span>
              {output.biasReview.items.map((item, i) => (
                <div key={i} className="p-4 border border-black/[0.04] bg-black/[0.01] rounded-2xl space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#1D1D1F] flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      Area: {item.area}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide border ${
                      item.risk === "High"
                        ? "bg-red-50 text-red-600 border-red-100"
                        : "bg-amber-50 text-amber-600 border-amber-100"
                    }`}>
                      {item.risk} Risk
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-[#555555]">
                    <span className="font-bold text-red-500">Issue: </span>
                    {item.issue}
                  </p>
                  <p className="text-[11px] font-semibold text-[#555555] bg-white p-2 rounded-lg border border-black/[0.02]">
                    <span className="font-bold text-emerald-600">Safer Alternative: </span>
                    {item.saferAlternative}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-black/[0.04] pt-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#86868B] block mb-2">
                Standard Bias Reduction Guidelines
              </span>
              <ul className="space-y-2">
                {output.biasReview.generalGuidelines.map((guide, i) => (
                  <li key={i} className="text-xs font-semibold text-[#555555] leading-relaxed pl-1 list-none flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                    <span>{guide}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );

      case "guide":
        return (
          <div className="space-y-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#86868B] block mb-2">
                1. Before Interview (Calibration)
              </span>
              <ul className="space-y-2">
                {output.evaluationGuide.beforeInterview.map((step, i) => (
                  <li key={i} className="text-xs font-semibold text-[#555555] leading-relaxed flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-black/5 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="mt-0.5">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-black/[0.04] pt-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#86868B] block mb-2">
                2. During Interview (Consistent Environment)
              </span>
              <ul className="space-y-2">
                {output.evaluationGuide.duringInterview.map((step, i) => (
                  <li key={i} className="text-xs font-semibold text-[#555555] leading-relaxed flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-black/5 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="mt-0.5">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-black/[0.04] pt-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#86868B] block mb-2">
                3. After Interview (Evidence Logging)
              </span>
              <ul className="space-y-2">
                {output.evaluationGuide.afterInterview.map((step, i) => (
                  <li key={i} className="text-xs font-semibold text-[#555555] leading-relaxed flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-black/5 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="mt-0.5">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-black/[0.04] pt-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#86868B] block mb-2">
                4. Decision Guidance
              </span>
              <ul className="space-y-2">
                {output.evaluationGuide.decisionGuidance.map((step, i) => (
                  <li key={i} className="text-xs font-semibold text-[#555555] leading-relaxed flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-black/5 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="mt-0.5">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white border border-black/[0.08] rounded-3xl p-6 md:p-8 space-y-6 shadow-sm w-full relative">
      {/* Header and Locked actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-black/[0.08] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#1D1D1F]">Workflow Preview</h2>
            <span className="px-2 py-0.5 bg-black/[0.04] text-[#86868B] rounded-full text-[9px] font-bold uppercase tracking-wider">
              {output.metadata.seniorityLabel} • {output.metadata.companyTypeLabel}
            </span>
          </div>
          <p className="text-xs font-semibold text-[#86868B]">
            Interactive preview of your structured assets.
          </p>
        </div>

        {/* Premium actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onLockTrigger("Save Workflow")}
            className="border-black/10 hover:bg-black/5 text-xs font-bold rounded-full h-9"
          >
            <Save className="w-3.5 h-3.5" />
            Save
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onLockTrigger("Export Full Report")}
            className="border-black/10 hover:bg-black/5 text-xs font-bold rounded-full h-9"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onLockTrigger("Evaluate Candidate")}
            className="border-black/10 hover:bg-black/5 text-xs font-bold rounded-full h-9"
          >
            <Users className="w-3.5 h-3.5" />
            Evaluate
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto scrollbar-none border-b border-black/[0.06] pb-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold whitespace-nowrap rounded-lg transition-all ${
                isActive
                  ? "bg-black text-white"
                  : "text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/5"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.short}</span>
            </button>
          );
        })}
      </div>

      {/* Preview Content Area */}
      <div className="relative min-h-[300px] pb-40">
        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="absolute top-0 right-0 p-2 border border-black/10 hover:border-black/20 hover:bg-black/5 text-[#86868B] hover:text-[#1D1D1F] rounded-xl transition-all z-20"
          title="Copy tab preview"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
        </button>

        <div className="pt-2 z-10 relative">
          {renderActiveTabContent()}
        </div>

        {/* Locked/Blurred CTA Overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/95 to-white/0 pt-24 pb-4 text-center z-20 flex flex-col items-center justify-end">
          <div className="backdrop-blur-md bg-white/40 border border-black/[0.06] p-5 rounded-2xl max-w-sm w-full space-y-3 shadow-lg">
            <span className="text-[10px] font-bold text-[#86868B] tracking-wide block leading-relaxed flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3 text-amber-500" />
              Full workflow includes more role-specific questions, complete scorecard, export, and candidate evaluation.
            </span>
            <Link href={isSignedIn ? "/dashboard/workflows/new" : "/sign-up?redirect=/dashboard/workflows/new"} className="w-full block">
              <Button className="w-full h-9 bg-black text-white hover:bg-black/90 text-xs font-bold rounded-full transition-transform active:scale-98">
                {isSignedIn ? "Open Full Builder" : "Create Free Account to Unlock"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
