"use client";

import React, { useState, useEffect } from "react";
import { DemoWorkflowInput, DemoRole, DemoSeniority, DemoCompanyType, HiringFocus } from "@/types/demo";
import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCcw } from "lucide-react";

interface DemoWorkflowFormProps {
  onSubmit: (input: DemoWorkflowInput) => void;
  isGenerating: boolean;
}

const ROLE_OPTIONS: { value: DemoRole; label: string }[] = [
  { value: "frontend-developer", label: "Frontend Developer" },
  { value: "backend-developer", label: "Backend Developer" },
  { value: "sales-executive-bdr", label: "Sales Executive / BDR" },
  { value: "digital-marketing-executive", label: "Digital Marketing Executive" },
  { value: "hr-recruiter", label: "HR Recruiter" },
  { value: "data-analyst", label: "Data Analyst" },
];

const SENIORITY_OPTIONS: { value: DemoSeniority; label: string }[] = [
  { value: "junior", label: "Junior" },
  { value: "mid-level", label: "Mid-Level" },
  { value: "senior", label: "Senior" },
];

const COMPANY_OPTIONS: { value: DemoCompanyType; label: string }[] = [
  { value: "startup", label: "Startup" },
  { value: "smb", label: "SMB" },
  { value: "enterprise", label: "Enterprise" },
];

const FOCUS_OPTIONS: { value: HiringFocus; label: string }[] = [
  { value: "technical-skills", label: "Technical Skills" },
  { value: "problem-solving", label: "Problem Solving" },
  { value: "communication", label: "Communication" },
  { value: "ownership", label: "Ownership" },
  { value: "leadership", label: "Leadership" },
  { value: "culture-add", label: "Culture Add" },
  { value: "execution", label: "Execution" },
  { value: "analytical-thinking", label: "Analytical Thinking" },
  { value: "stakeholder-management", label: "Stakeholder Management" },
];

const DEFAULT_FOCUS_BY_ROLE: Record<DemoRole, HiringFocus[]> = {
  "frontend-developer": ["technical-skills", "problem-solving", "communication"],
  "backend-developer": ["technical-skills", "problem-solving", "ownership"],
  "sales-executive-bdr": ["communication", "execution", "ownership"],
  "digital-marketing-executive": ["analytical-thinking", "execution", "communication"],
  "hr-recruiter": ["communication", "stakeholder-management", "execution"],
  "data-analyst": ["analytical-thinking", "problem-solving", "communication"],
};

export function DemoWorkflowForm({ onSubmit, isGenerating }: DemoWorkflowFormProps) {
  const [role, setRole] = useState<DemoRole>("frontend-developer");
  const [seniority, setSeniority] = useState<DemoSeniority>("mid-level");
  const [companyType, setCompanyType] = useState<DemoCompanyType>("startup");
  const [hiringFocus, setHiringFocus] = useState<HiringFocus[]>([
    "technical-skills",
    "problem-solving",
    "communication",
  ]);
  const [optionalContext, setOptionalContext] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Update hiring focus defaults when role changes
  useEffect(() => {
    if (DEFAULT_FOCUS_BY_ROLE[role]) {
      setHiringFocus(DEFAULT_FOCUS_BY_ROLE[role]);
    }
  }, [role]);

  const handleFocusChange = (focus: HiringFocus) => {
    setError(null);
    setHiringFocus((prev) =>
      prev.includes(focus) ? prev.filter((f) => f !== focus) : [...prev, focus]
    );
  };

  const handleReset = (e: React.MouseEvent) => {
    e.preventDefault();
    setRole("frontend-developer");
    setSeniority("mid-level");
    setCompanyType("startup");
    setHiringFocus(DEFAULT_FOCUS_BY_ROLE["frontend-developer"]);
    setOptionalContext("");
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!role) {
      setError("Please select a role to generate the preview.");
      return;
    }

    if (hiringFocus.length === 0) {
      setError("Please select a role and at least one hiring focus to generate the preview.");
      return;
    }

    setError(null);
    const inputPayload: DemoWorkflowInput = {
      role,
      seniority,
      companyType,
      hiringFocus,
    };

    const trimmedContext = optionalContext.trim();
    if (trimmedContext) {
      inputPayload.optionalContext = trimmedContext;
    }

    onSubmit(inputPayload);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-black/[0.08] rounded-3xl p-6 md:p-8 space-y-6 shadow-sm w-full"
    >
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-[#1D1D1F]">Configure Demo</h2>
        <p className="text-xs font-semibold text-[#86868B]">
          Adjust details to customize the hiring workflow preview.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5 text-xs text-red-600 font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Role */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="role-select" className="text-xs font-bold text-[#1D1D1F]">
          Target Role <span className="text-red-500">*</span>
        </label>
        <select
          id="role-select"
          value={role}
          onChange={(e) => setRole(e.target.value as DemoRole)}
          className="h-11 px-3 border border-black/10 hover:border-black/20 focus:border-black rounded-xl text-sm bg-white text-[#1D1D1F] outline-none transition-colors cursor-pointer"
          disabled={isGenerating}
        >
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Seniority & Company Type Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Seniority */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="seniority-select" className="text-xs font-bold text-[#1D1D1F]">
            Seniority Level
          </label>
          <select
            id="seniority-select"
            value={seniority}
            onChange={(e) => setSeniority(e.target.value as DemoSeniority)}
            className="h-11 px-3 border border-black/10 hover:border-black/20 focus:border-black rounded-xl text-sm bg-white text-[#1D1D1F] outline-none transition-colors cursor-pointer"
            disabled={isGenerating}
          >
            {SENIORITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Company Type */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="company-select" className="text-xs font-bold text-[#1D1D1F]">
            Company Type
          </label>
          <select
            id="company-select"
            value={companyType}
            onChange={(e) => setCompanyType(e.target.value as DemoCompanyType)}
            className="h-11 px-3 border border-black/10 hover:border-black/20 focus:border-black rounded-xl text-sm bg-white text-[#1D1D1F] outline-none transition-colors cursor-pointer"
            disabled={isGenerating}
          >
            {COMPANY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Hiring Focus Checkbox Group */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-bold text-[#1D1D1F]">
          Hiring Focus <span className="text-red-500">*</span>
        </span>
        <div className="grid grid-cols-2 gap-2 pt-1">
          {FOCUS_OPTIONS.map((opt) => {
            const isChecked = hiringFocus.includes(opt.value);
            return (
              <label
                key={opt.value}
                className={`flex items-center gap-2 px-3 py-2 border rounded-xl cursor-pointer text-xs font-semibold select-none transition-all ${
                  isChecked
                    ? "border-black bg-black/5 text-[#1D1D1F]"
                    : "border-black/10 hover:border-black/20 text-[#86868B]"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleFocusChange(opt.value)}
                  className="sr-only"
                  disabled={isGenerating}
                />
                {opt.label}
              </label>
            );
          })}
        </div>
      </div>

      {/* Optional Context */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="optional-context" className="text-xs font-bold text-[#1D1D1F]">
          Optional Context
        </label>
        <textarea
          id="optional-context"
          rows={3}
          value={optionalContext}
          onChange={(e) => setOptionalContext(e.target.value)}
          placeholder="Optional: add company context, tech stack, target market, or hiring priorities."
          className="p-3 border border-black/10 hover:border-black/20 focus:border-black rounded-xl text-sm bg-white text-[#1D1D1F] outline-none transition-colors resize-none"
          disabled={isGenerating}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-2 pt-2">
        <Button
          type="submit"
          disabled={isGenerating}
          className="flex-1 h-11 bg-black text-white hover:bg-black/90 font-bold rounded-full transition-all duration-150 active:scale-98"
        >
          {isGenerating ? "Generating..." : "Generate Workflow Preview"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isGenerating}
          onClick={handleReset}
          className="h-11 border-black/10 hover:bg-black/5 font-bold rounded-full sm:px-4 flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </Button>
      </div>

      <div className="text-center pt-2 border-t border-black/[0.04]">
        <p className="text-[10px] font-semibold text-[#86868B] leading-relaxed max-w-xs mx-auto">
          No login required. This demo uses curated role-based workflow previews. Sign up to generate fully customized AI workflows.
        </p>
      </div>
    </form>
  );
}
