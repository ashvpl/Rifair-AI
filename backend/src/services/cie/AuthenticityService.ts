export interface AuthenticityAssessment {
  trust_score: number; // 0-100
  honeypot_risk: "LOW" | "MEDIUM" | "HIGH";
  reasons: string[];
}

export class AuthenticityService {
  private static NON_TECH_TITLES = new Set([
    "marketing manager", "accountant", "hr manager", "sales executive",
    "graphic designer", "customer support", "civil engineer", "mechanical engineer"
  ]);

  private static AI_TECH_SKILLS = new Set([
    "nlp", "fine-tuning llms", "milvus", "vector db", "rag", "pytorch", "tensorflow",
    "gans", "lora", "qlora", "peft", "embeddings", "retrieval systems", "llm"
  ]);

  public static assess(candidate: any): AuthenticityAssessment {
    const careerHistory = candidate.career_history || [];
    const skills = candidate.skills || [];
    const profile = candidate.profile || {};
    
    const reasons: string[] = [];
    let isHoneypot = false;
    let skillInflation = false;
    let timelineInconsistent = false;
    let titleSkillMismatch = false;

    // 1. Timeline Inconsistencies
    const currentYear = 2026;
    const currentMonth = 5; // June (0-indexed 5)

    careerHistory.forEach((job: any) => {
      if (!job.start_date) return;
      const start = new Date(job.start_date);
      const end = job.end_date ? new Date(job.end_date) : new Date(currentYear, currentMonth);
      
      const expectedMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      if (Math.abs(expectedMonths - job.duration_months) > 12) {
        timelineInconsistent = true;
        reasons.push(`Timeline mismatch in role at ${job.company}: dates indicate ${expectedMonths} months but duration claims ${job.duration_months} months.`);
      }
    });

    // 2. Zero Duration Expert Skills
    let zeroDurationExpertCount = 0;
    skills.forEach((s: any) => {
      const prof = (s.proficiency || "").toLowerCase();
      if ((prof === "expert" || prof === "advanced") && s.duration_months === 0) {
        zeroDurationExpertCount++;
      }
    });

    if (zeroDurationExpertCount >= 3) {
      skillInflation = true;
      reasons.push(`Zero duration expert skills detected: ${zeroDurationExpertCount} skills claimed as expert/advanced with 0 months of use.`);
    }

    // 3. Title-Skill Mismatches (Honeypot Trap)
    const currentTitleLower = (profile.current_title || "").toLowerCase();
    if (this.NON_TECH_TITLES.has(currentTitleLower)) {
      let aiSkillCount = 0;
      skills.forEach((s: any) => {
        if (this.AI_TECH_SKILLS.has(s.name.toLowerCase())) {
          aiSkillCount++;
        }
      });
      if (aiSkillCount >= 3) {
        titleSkillMismatch = true;
        reasons.push(`Title-skill mismatch: Candidate holds non-tech title "${profile.current_title}" but claims ${aiSkillCount} advanced AI skills.`);
      }
    }

    // Determine Risk and Trust Score
    let trust_score = 100;
    let honeypot_risk: "LOW" | "MEDIUM" | "HIGH" = "LOW";

    if (timelineInconsistent || titleSkillMismatch) {
      isHoneypot = true;
      honeypot_risk = "HIGH";
      trust_score = 10;
    } else if (skillInflation) {
      honeypot_risk = "MEDIUM";
      trust_score = 45;
    }

    return {
      trust_score,
      honeypot_risk,
      reasons
    };
  }
}
