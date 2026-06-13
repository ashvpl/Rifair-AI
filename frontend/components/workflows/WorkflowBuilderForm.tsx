"use client";

import React, { useState, useEffect } from "react";
import { WorkflowBuilderInput } from "@/lib/workflows/types";
import { Plus, X, Layers, BrainCircuit, Users, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormProps {
  initialValues?: Partial<WorkflowBuilderInput>;
  onSubmit: (values: WorkflowBuilderInput) => void;
  isSubmitting: boolean;
}

const SENIORITIES = ["Junior", "Mid-level", "Senior", "Lead", "Director/VP"];
const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];

const DEFAULT_INTERVIEWS = [
  "Resume Screen",
  "Technical Phone Screen",
  "Coding Assessment",
  "System Design & Architecture",
  "Behavioral & Culture Fit",
  "Case Study Presentation"
];

const DEFAULT_COMPETENCIES = [
  "Problem Solving",
  "Technical Execution",
  "Communication",
  "System Design",
  "Collaboration",
  "Leadership",
  "Adaptability"
];

export function WorkflowBuilderForm({ initialValues, onSubmit, isSubmitting }: FormProps) {
  const [roleTitle, setRoleTitle] = useState("");
  const [seniorityLevel, setSeniorityLevel] = useState("Mid-level");
  const [department, setDepartment] = useState("");
  const [employmentType, setEmploymentType] = useState("Full-time");
  const [companyContext, setCompanyContext] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  // Skills lists
  const [mustHaveSkills, setMustHaveSkills] = useState<string[]>([]);
  const [niceHaveSkills, setNiceHaveSkills] = useState<string[]>([]);
  const [mustInput, setMustInput] = useState("");
  const [niceInput, setNiceInput] = useState("");

  // Checkbox selections
  const [interviewTypes, setInterviewTypes] = useState<string[]>([]);
  const [evaluationFocus, setEvaluationFocus] = useState<string[]>([]);

  // Update states if template is selected
  useEffect(() => {
    if (initialValues) {
      setRoleTitle(initialValues.roleTitle || "");
      setSeniorityLevel(initialValues.seniorityLevel || "Mid-level");
      setDepartment(initialValues.department || "");
      setEmploymentType(initialValues.employmentType || "Full-time");
      setCompanyContext(initialValues.companyContext || "");
      setJobDescription(initialValues.jobDescription || "");
      setMustHaveSkills(initialValues.mustHaveSkills || []);
      setNiceHaveSkills(initialValues.niceHaveSkills || []);
      setInterviewTypes(initialValues.interviewTypes || []);
      setEvaluationFocus(initialValues.evaluationFocus || []);
    }
  }, [initialValues]);

  // Skill tag triggers
  const addMustSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = mustInput.trim();
    if (clean && !mustHaveSkills.includes(clean)) {
      setMustHaveSkills((prev) => [...prev, clean]);
    }
    setMustInput("");
  };

  const removeMustSkill = (skill: string) => {
    setMustHaveSkills((prev) => prev.filter((s) => s !== skill));
  };

  const addNiceSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = niceInput.trim();
    if (clean && !niceHaveSkills.includes(clean)) {
      setNiceHaveSkills((prev) => [...prev, clean]);
    }
    setNiceInput("");
  };

  const removeNiceSkill = (skill: string) => {
    setNiceHaveSkills((prev) => prev.filter((s) => s !== skill));
  };

  const toggleInterview = (item: string) => {
    setInterviewTypes((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const toggleCompetency = (item: string) => {
    setEvaluationFocus((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleTitle.trim()) return;

    onSubmit({
      roleTitle: roleTitle.trim(),
      seniorityLevel,
      department: department.trim(),
      employmentType,
      companyContext: companyContext.trim(),
      jobDescription: jobDescription.trim(),
      mustHaveSkills,
      niceHaveSkills,
      interviewTypes,
      evaluationFocus,
    });
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      
      {/* CARD 1: Core Details */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <div className="flex items-center gap-2 border-b border-black/[0.04] pb-3">
          <Layers className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
            1. Core Role Details
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="roleTitle" className="text-xs font-black uppercase tracking-widest text-[#86868B]">
              Role Title *
            </label>
            <input
              id="roleTitle"
              type="text"
              required
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
              className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.08] focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/20 text-sm font-medium"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="department" className="text-xs font-black uppercase tracking-widest text-[#86868B]">
              Department / Team
            </label>
            <input
              id="department"
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Engineering, Sales, Product"
              className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.08] focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/20 text-sm font-medium"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="seniorityLevel" className="text-xs font-black uppercase tracking-widest text-[#86868B]">
              Seniority Level
            </label>
            <select
              id="seniorityLevel"
              value={seniorityLevel}
              onChange={(e) => setSeniorityLevel(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.08] focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/20 text-sm font-medium bg-white"
            >
              {SENIORITIES.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="employmentType" className="text-xs font-black uppercase tracking-widest text-[#86868B]">
              Employment Type
            </label>
            <select
              id="employmentType"
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.08] focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/20 text-sm font-medium bg-white"
            >
              {EMPLOYMENT_TYPES.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="companyContext" className="text-xs font-black uppercase tracking-widest text-[#86868B]">
            Company Context / Stage / Mission
          </label>
          <textarea
            id="companyContext"
            rows={3}
            value={companyContext}
            onChange={(e) => setCompanyContext(e.target.value)}
            placeholder="e.g. Series A startup building developer tooling. Focus on high velocity, direct client impact, and clean code."
            className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.08] focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/20 text-sm font-medium resize-none"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="jobDescription" className="text-xs font-black uppercase tracking-widest text-[#86868B]">
            Existing JD Content or Core Responsibilities (Optional)
          </label>
          <textarea
            id="jobDescription"
            rows={4}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste your raw job description, bullet points, or list of keywords here."
            className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.08] focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/20 text-sm font-medium"
          />
        </div>
      </div>

      {/* CARD 2: Skills & Criteria */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <div className="flex items-center gap-2 border-b border-black/[0.04] pb-3">
          <BrainCircuit className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
            2. Core Skills & Calibration
          </h3>
        </div>

        {/* Must Haves */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-[#86868B]">
            Must-Have Skills
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={mustInput}
              onChange={(e) => setMustInput(e.target.value)}
              placeholder="e.g. TypeScript (Hit Enter or click +)"
              onKeyDown={(e) => e.key === "Enter" && addMustSkill(e)}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-black/[0.08] focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/20 text-sm font-medium"
            />
            <button
              onClick={addMustSkill}
              type="button"
              className="p-3 bg-[#F5F5F7] border border-black/[0.08] rounded-xl hover:border-black/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 text-black" />
            </button>
          </div>
          {mustHaveSkills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {mustHaveSkills.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeMustSkill(tag)}
                    className="hover:bg-emerald-100 p-0.5 rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Nice to Haves */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-[#86868B]">
            Nice-to-Have Skills
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={niceInput}
              onChange={(e) => setNiceInput(e.target.value)}
              placeholder="e.g. GraphQL"
              onKeyDown={(e) => e.key === "Enter" && addNiceSkill(e)}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-black/[0.08] focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/20 text-sm font-medium"
            />
            <button
              onClick={addNiceSkill}
              type="button"
              className="p-3 bg-[#F5F5F7] border border-black/[0.08] rounded-xl hover:border-black/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 text-black" />
            </button>
          </div>
          {niceHaveSkills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {niceHaveSkills.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-black bg-blue-50 text-blue-700 border border-blue-100 rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeNiceSkill(tag)}
                    className="hover:bg-blue-100 p-0.5 rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CARD 3: Interview Pipeline */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <div className="flex items-center gap-2 border-b border-black/[0.04] pb-3">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
            3. Interview Rounds & Focus
          </h3>
        </div>

        {/* Interview Rounds Checklist */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-[#86868B]">
            Interview Rounds to Include
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {DEFAULT_INTERVIEWS.map((round) => {
              const checked = interviewTypes.includes(round);
              return (
                <button
                  key={round}
                  type="button"
                  onClick={() => toggleInterview(round)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border text-left text-xs sm:text-sm font-bold transition-all min-h-[46px]",
                    checked
                      ? "bg-[#1D1D1F] border-black text-white shadow-sm"
                      : "bg-white border-black/[0.08] hover:border-black/25 text-[#424245]"
                  )}
                >
                  <span>{round}</span>
                  {checked && <X className="w-3.5 h-3.5 shrink-0 ml-1.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Competencies Checklist */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-black uppercase tracking-widest text-[#86868B]">
            Competencies & Evaluation Focus
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {DEFAULT_COMPETENCIES.map((comp) => {
              const checked = evaluationFocus.includes(comp);
              return (
                <button
                  key={comp}
                  type="button"
                  onClick={() => toggleCompetency(comp)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border text-left text-xs sm:text-sm font-bold transition-all min-h-[46px]",
                    checked
                      ? "bg-primary/5 border-primary text-primary"
                      : "bg-white border-black/[0.08] hover:border-black/25 text-[#424245]"
                  )}
                >
                  <span>{comp}</span>
                  {checked && <X className="w-3.5 h-3.5 shrink-0 ml-1.5" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting || !roleTitle.trim()}
        className={cn(
          "w-full py-4 rounded-2xl bg-black hover:bg-[#1D1D1F] text-white font-extrabold text-sm uppercase tracking-widest transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:scale-[0.98] min-h-[52px]",
          "disabled:opacity-40 disabled:pointer-events-none"
        )}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Structuring Pipeline...
          </span>
        ) : (
          "Build Structured Workflow"
        )}
      </button>

    </form>
  );
}
