import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function safeParseReport(report: any) {
  if (!report) return report;
  const processed = { ...report };
  
  if (typeof processed.categories === "string") {
    try {
      processed.categories = JSON.parse(processed.categories);
    } catch (e) {
      console.error("Failed to parse report categories", e);
      processed.categories = {};
    }
  }
  
  if (!processed.categories) processed.categories = {};
  
  // High-reliability mapping for dashboard/history expectations
  if (!processed.categories.questions && Array.isArray(processed.flagged_phrases)) {
    processed.categories.questions = processed.flagged_phrases;
  }
  
  return processed;
}
