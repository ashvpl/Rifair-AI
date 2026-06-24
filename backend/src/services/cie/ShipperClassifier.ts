export type CandidateArchetype =
  | "Founder Type"
  | "Builder"
  | "Product Engineer"
  | "Researcher"
  | "Consultant"
  | "Title Chaser";

export interface ShipperClassification {
  shipper_score: number; // 0-100
  category: CandidateArchetype;
}

export class ShipperClassifier {
  private static CONSULTING_FIRMS = new Set([
    "tcs", "wipro", "infosys", "accenture", "cognizant", "capgemini", "deloitte", "pwc", "ey",
    "kpmg", "tata consultancy services", "hcl", "tech mahindra", "mindtree", "l&t", "cts"
  ]);

  private static RESEARCH_KEYWORDS = /\b(research|paper|publication|published|academic|thesis|journal|conference|theory|novel|study|gpa|postdoc|phd)\b/i;
  private static SHIPPER_KEYWORDS = /\b(built|shipped|deployed|implemented|scaled|launched|optimized|integrated|designed|wrote|owned)\b/i;

  public static classify(candidate: any, features: any): ShipperClassification {
    const careerHistory = candidate.career_history || [];
    const profile = candidate.profile || {};
    
    let isConsultantOnly = true;
    let hasProductComp = false;
    let researchMentions = 0;
    let shipperMentions = 0;
    let isFounder = false;

    // Analyze career history
    careerHistory.forEach((job: any) => {
      const compLower = (job.company || "").toLowerCase();
      const descLower = (job.description || "").toLowerCase();
      const titleLower = (job.title || "").toLowerCase();

      // Check for consulting
      const isConsultingComp = this.CONSULTING_FIRMS.has(compLower) || 
                               job.industry?.toLowerCase().includes("consulting") || 
                               job.industry?.toLowerCase().includes("services");

      if (!isConsultingComp) {
        isConsultantOnly = false;
        hasProductComp = true;
      }

      // Check for founder
      if (/\b(founder|co-founder|cto|ceo)\b/i.test(titleLower)) {
        isFounder = true;
      }

      // Check keywords
      const rMatch = descLower.match(this.RESEARCH_KEYWORDS);
      if (rMatch) researchMentions += rMatch.length;

      const sMatch = descLower.match(this.SHIPPER_KEYWORDS);
      if (sMatch) shipperMentions += sMatch.length;
    });

    if (careerHistory.length === 0) {
      isConsultantOnly = false;
    }

    // Determine primary category
    let category: CandidateArchetype = "Product Engineer";
    let baseScore = 60;

    // Check for Title Chaser (high job hop + short tenure)
    const isTitleChaser = features.job_hop_frequency > 0.6 && features.average_tenure_months < 18;

    if (isFounder && hasProductComp) {
      category = "Founder Type";
      baseScore = 95;
    } else if (shipperMentions > researchMentions && shipperMentions >= 3) {
      category = "Builder";
      baseScore = 85;
    } else if (isTitleChaser) {
      category = "Title Chaser";
      baseScore = 35;
    } else if (isConsultantOnly && !isFounder) {
      category = "Consultant";
      baseScore = 40;
    } else if (researchMentions > shipperMentions && researchMentions >= 3) {
      category = "Researcher";
      baseScore = 45;
    } else if (hasProductComp) {
      category = "Product Engineer";
      baseScore = 75;
    }

    // Adjust score based on career velocity and promotion count
    let modifier = 0;
    if (features.promotion_count > 0) {
      modifier += Math.min(10, features.promotion_count * 3);
    }
    if (features.career_velocity > 0.3) {
      modifier += 5;
    }

    // Penalize if no product experience detected
    if (features.product_experience < 20) {
      modifier -= 10;
    }

    const shipper_score = Math.max(0, Math.min(100, baseScore + modifier));

    return {
      shipper_score,
      category
    };
  }
}
