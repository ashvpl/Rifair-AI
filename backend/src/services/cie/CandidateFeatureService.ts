export interface CandidateFeatures {
  // Profile Features
  headline: string;
  summary: string;
  location: string;
  years_of_experience: number;
  current_title: string;
  current_company: string;
  current_industry: string;

  // Career Features
  promotion_count: number;
  career_velocity: number; // promotions per year
  average_tenure_months: number;
  job_hop_frequency: number; // fraction of short tenures (<18m)
  startup_experience: number; // count of startup roles
  product_experience: number; // 0-100 score
  leadership_experience: number; // 0-100 score

  // Skill Features
  skill_count: number;
  endorsement_count: number;
  skill_duration_score: number; // average duration of skills in months
  verified_skill_score: number; // 0-100 score based on assessments

  // Education Features
  degree_relevance: number; // 0-1 score
  technical_background: boolean;
  certification_score: number;
}

export class CandidateFeatureService {
  public static extractFeatures(candidate: any): CandidateFeatures {
    const profile = candidate.profile || {};
    const careerHistory = candidate.career_history || [];
    const education = candidate.education || [];
    const skills = candidate.skills || [];
    const certifications = candidate.certifications || [];
    const signals = candidate.redrob_signals || {};

    // 1. Career Features
    const companies = careerHistory.map((c: any) => c.company);
    const uniqueCompanies = new Set(companies).size;
    const promotion_count = Math.max(0, careerHistory.length - uniqueCompanies);
    const years_of_exp = profile.years_of_experience || 0;
    const career_velocity = years_of_exp > 0 ? promotion_count / years_of_exp : 0;

    let totalTenureMonths = 0;
    let shortTenures = 0;
    let startupRoles = 0;
    let productScore = 0;
    let leadershipScore = 0;

    const startupSizes = ["1-10", "11-50", "51-200"];
    const productKeywords = /\b(product|saas|scale|users|features|launch|deploy|customer|traffic|performance|platform)\b/i;
    const leadershipKeywords = /\b(lead|mentor|manage|head|director|founding|architect|coach|hired|team)\b/i;

    careerHistory.forEach((job: any) => {
      totalTenureMonths += job.duration_months || 0;
      if (job.duration_months < 18 && !job.is_current) {
        shortTenures++;
      }
      if (startupSizes.includes(job.company_size)) {
        startupRoles++;
      }
      if (productKeywords.test(job.description) || productKeywords.test(job.title)) {
        productScore += 25;
      }
      if (leadershipKeywords.test(job.description) || leadershipKeywords.test(job.title)) {
        leadershipScore += 30;
      }
    });

    const average_tenure_months = careerHistory.length > 0 ? totalTenureMonths / careerHistory.length : 0;
    const job_hop_frequency = careerHistory.length > 0 ? shortTenures / careerHistory.length : 0;
    const startup_experience = startupRoles;
    const product_experience = Math.min(100, productScore);
    const leadership_experience = Math.min(100, leadershipScore);

    // 2. Skill Features
    const skill_count = skills.length;
    let totalEndorsements = 0;
    let totalSkillDuration = 0;

    skills.forEach((s: any) => {
      totalEndorsements += s.endorsements || 0;
      totalSkillDuration += s.duration_months || 0;
    });

    const endorsement_count = totalEndorsements;
    const skill_duration_score = skill_count > 0 ? totalSkillDuration / skill_count : 0;

    // Verified skills score (percentage of assessments completed with high score)
    const assessmentScores = Object.values(signals.skill_assessment_scores || {});
    let verified_skill_score = 0;
    if (assessmentScores.length > 0) {
      const sum = assessmentScores.reduce((a: any, b: any) => a + b, 0) as number;
      verified_skill_score = sum / assessmentScores.length;
    }

    // 3. Education Features
    let maxDegreeRelevance = 0;
    let technical_background = false;

    const technicalMajors = /\b(computer|software|data science|information|systems|mathematics|statistics|machine learning|artificial|physics|electrical|electronics)\b/i;
    const coreMajors = /\b(computer science|software engineering|data science|machine learning|artificial intelligence)\b/i;

    education.forEach((edu: any) => {
      const field = edu.field_of_study || "";
      const deg = (edu.degree || "").toLowerCase();

      if (coreMajors.test(field)) {
        maxDegreeRelevance = Math.max(maxDegreeRelevance, 1.0);
        technical_background = true;
      } else if (technicalMajors.test(field)) {
        maxDegreeRelevance = Math.max(maxDegreeRelevance, 0.8);
        technical_background = true;
      } else if (/\b(engineering|science)\b/i.test(field)) {
        maxDegreeRelevance = Math.max(maxDegreeRelevance, 0.5);
        technical_background = true;
      } else {
        maxDegreeRelevance = Math.max(maxDegreeRelevance, 0.2);
      }
    });

    const degree_relevance = maxDegreeRelevance;
    const certification_score = certifications.length * 20; // 20 points per certification

    return {
      headline: profile.headline || "",
      summary: profile.summary || "",
      location: profile.location || "",
      years_of_experience: years_of_exp,
      current_title: profile.current_title || "",
      current_company: profile.current_company || "",
      current_industry: profile.current_industry || "",

      promotion_count,
      career_velocity,
      average_tenure_months,
      job_hop_frequency,
      startup_experience,
      product_experience,
      leadership_experience,

      skill_count,
      endorsement_count,
      skill_duration_score,
      verified_skill_score,

      degree_relevance,
      technical_background,
      certification_score,
    };
  }
}
