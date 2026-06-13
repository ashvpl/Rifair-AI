"use client";

import { useState } from "react";
import { HiringWorkflowOutput, HiringWorkflowRow } from "@/lib/workflows/types";
import { workflowToMarkdown, downloadMarkdown } from "@/lib/workflows/exportWorkflow";
import { Download, Copy, Check, FileText, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExportPanelProps {
  config: HiringWorkflowRow;
  outputs: HiringWorkflowOutput;
}

export function ExportPanel({ config, outputs }: ExportPanelProps) {
  const [copied, setCopied] = useState(false);
  const [activePreview, setActivePreview] = useState<"markdown" | "json">("markdown");

  const markdownContent = workflowToMarkdown(config.role_title, outputs);
  const jsonContent = JSON.stringify(outputs, null, 2);

  const handleDownloadMarkdown = () => {
    const filename = `${config.role_title.replace(/\s+/g, "-").toLowerCase()}-hiring-workflow.md`;
    downloadMarkdown(filename, markdownContent);
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${config.role_title.replace(/\s+/g, "-").toLowerCase()}-workflow.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = async () => {
    const content = activePreview === "markdown" ? markdownContent : jsonContent;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Export buttons */}
      <div className="grid sm:grid-cols-2 gap-3">
        <button
          onClick={handleDownloadMarkdown}
          className="flex items-center gap-3 p-4 rounded-2xl border-2 border-black/80 bg-[#1D1D1F] text-white hover:bg-black transition-all active:scale-95 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 group"
        >
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-sm font-black">Download Markdown</p>
            <p className="text-[10px] font-bold text-white/60">.md — full formatted document</p>
          </div>
          <Download className="w-4 h-4 ml-auto text-white/40 group-hover:text-white transition-colors" />
        </button>

        <button
          onClick={handleDownloadJSON}
          className="flex items-center gap-3 p-4 rounded-2xl border-2 border-black/[0.08] bg-white hover:bg-[#F5F5F7] transition-all active:scale-95 group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#F5F5F7] flex items-center justify-center shrink-0">
            <Code2 className="w-5 h-5 text-[#86868B]" />
          </div>
          <div className="text-left">
            <p className="text-sm font-black text-[#1D1D1F]">Download JSON</p>
            <p className="text-[10px] font-bold text-[#86868B]">.json — raw structured data</p>
          </div>
          <Download className="w-4 h-4 ml-auto text-[#86868B] group-hover:text-[#1D1D1F] transition-colors" />
        </button>
      </div>

      {/* Preview toggle + copy */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-1 p-1 rounded-xl bg-[#F5F5F7] border border-black/[0.05]">
            {(["markdown", "json"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setActivePreview(type)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                  activePreview === type
                    ? "bg-white shadow-sm text-[#1D1D1F]"
                    : "text-[#86868B] hover:text-[#1D1D1F]"
                )}
              >
                {type}
              </button>
            ))}
          </div>

          <button
            onClick={handleCopy}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border",
              copied
                ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                : "bg-[#F5F5F7] border-black/[0.05] text-[#86868B] hover:text-[#1D1D1F]"
            )}
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        {/* Preview area */}
        <div className="rounded-2xl border border-black/[0.08] bg-[#F5F5F7]/60 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-black/[0.06] bg-white/50">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>
            <span className="text-[10px] font-black text-[#86868B] ml-2 uppercase tracking-wider">
              {activePreview === "markdown" ? `${config.role_title}-workflow.md` : `${config.role_title}-workflow.json`}
            </span>
          </div>
          <pre className="p-4 text-[11px] font-mono text-[#1D1D1F] overflow-x-auto max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed">
            {activePreview === "markdown" ? markdownContent : jsonContent}
          </pre>
        </div>
      </div>

      {/* What's included */}
      <div className="p-4 rounded-2xl border border-black/[0.06] bg-[#F5F5F7]/40 space-y-2">
        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#86868B]">What&rsquo;s Included in Export</p>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            "Hiring Health Score",
            "Optimized Job Description",
            "Interview Questions",
            "Scorecard Criteria",
            "Bias Review Report",
            "Evaluation Guide",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-xs font-medium text-[#1D1D1F]">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
