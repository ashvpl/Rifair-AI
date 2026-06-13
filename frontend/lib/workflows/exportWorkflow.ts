import { HiringWorkflowOutput } from "./types";

/**
 * Format the entire structured hiring workflow into a single clean Markdown document
 */
export function workflowToMarkdown(roleTitle: string, workflow: HiringWorkflowOutput): string {
  let md = `# Hiring Workflow: ${roleTitle}\n`;
  md += `**Hiring Health Score:** ${workflow.hiring_health_score}/100\n\n`;

  // JD Section
  if (workflow.optimized_jd) {
    md += `## 1. Optimized Job Description\n\n`;
    md += `${workflow.optimized_jd.full_jd}\n\n`;
    
    if (workflow.optimized_jd.bias_verification) {
      md += `### Bias & Inclusivity Review\n`;
      md += `- **Bias Score:** ${workflow.optimized_jd.bias_verification.bias_score}/100 (lower is cleaner)\n`;
      if (workflow.optimized_jd.bias_verification.inclusive_language_used?.length > 0) {
        md += `- **Inclusive Language Used:**\n`;
        workflow.optimized_jd.bias_verification.inclusive_language_used.forEach(item => {
          md += `  - ${item}\n`;
        });
      }
      if (workflow.optimized_jd.bias_verification.requirements_calibration) {
        md += `- **Calibration Notes:** ${workflow.optimized_jd.bias_verification.requirements_calibration}\n`;
      }
      md += `\n`;
    }
  }

  // Interview Kit
  if (workflow.interview_kit) {
    md += `## 2. Interview Kit & Questions\n\n`;
    md += `**Title:** ${workflow.interview_kit.kit_title}\n`;
    md += `**Estimated Duration:** ${workflow.interview_kit.estimated_duration_minutes} minutes\n`;
    if (workflow.interview_kit.kit_summary) {
      md += `**Overview:** ${workflow.interview_kit.kit_summary}\n\n`;
    }
    
    if (workflow.interview_kit.questions?.length > 0) {
      md += `### Structured Interview Questions:\n\n`;
      workflow.interview_kit.questions.forEach((q, index) => {
        md += `#### Q${index + 1}: ${q.question}\n`;
        md += `- **Type:** ${q.type} | **Competency:** ${q.competency} | **Target Duration:** ${q.time_minutes} mins\n`;
        if (q.expected_answer) {
          md += `- **Expected Answer / Candidate Signals:** ${q.expected_answer}\n`;
        }
        md += `\n`;
      });
    }
  }

  // Scorecard
  if (workflow.scorecard && workflow.scorecard.criteria?.length > 0) {
    md += `## 3. Candidate Scorecard Criteria\n\n`;
    md += `| Criteria Competency | Description | Evaluation Weight |\n`;
    md += `| --- | --- | --- |\n`;
    workflow.scorecard.criteria.forEach(c => {
      md += `| ${c.name} | ${c.description} | ${c.weight} |\n`;
    });
    md += `\n`;
  }

  // Evaluation Guide
  if (workflow.evaluation_guide) {
    md += `## 4. Interviewer Evaluation Guide\n\n`;
    if (workflow.evaluation_guide.overview) {
      md += `${workflow.evaluation_guide.overview}\n\n`;
    }
    
    if (workflow.evaluation_guide.do_list?.length > 0) {
      md += `### Do's:\n`;
      workflow.evaluation_guide.do_list.forEach(item => {
        md += `- ${item}\n`;
      });
      md += `\n`;
    }
    
    if (workflow.evaluation_guide.dont_list?.length > 0) {
      md += `### Don'ts:\n`;
      workflow.evaluation_guide.dont_list.forEach(item => {
        md += `- ${item}\n`;
      });
      md += `\n`;
    }
  }

  return md;
}

/**
 * Trigger file download of the Markdown file
 */
export function downloadMarkdown(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
