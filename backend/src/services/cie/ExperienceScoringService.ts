import { CandidateFeatures } from "./CandidateFeatureService";
import { StructuredJobProfile } from "./JobUnderstandingService";

export class ExperienceScoringService {
  public static calculateExperienceScore(
    features: CandidateFeatures,
    jdProfile: StructuredJobProfile
  ): number {
    const yoe = features.years_of_experience;
    const minJd = jdProfile.years_experience_min; // 5
    const maxJd = jdProfile.years_experience_max; // 9

    // 1. Core Years of Experience Score (Non-linear curve)
    let yoeScore = 0;
    if (yoe >= minJd && yoe <= maxJd) {
      // Ideal range: 85 - 100 points
      yoeScore = 85 + ((yoe - minJd) / (maxJd - minJd)) * 15;
      // Slight peak at 7-8 years
      if (yoe >= 7 && yoe <= 8) {
        yoeScore = 100;
      }
    } else if (yoe < minJd) {
      // Under-experienced: rapid decay
      // 4 yrs = 70, 3 yrs = 55, 2 yrs = 40, 1 yr = 25, 0 yrs = 10
      yoeScore = Math.max(10, 10 + (yoe / minJd) * 75);
    } else {
      // Over-experienced: gentle decay
      // 10 yrs = 80, 15 yrs = 65, 20 yrs = 50
      const excess = yoe - maxJd;
      yoeScore = Math.max(50, 85 - excess * 3);
    }

    // 2. Career Progression & Leadership Boosts
    let boost = 0;

    // Promotion count: up to 12 points
    boost += Math.min(12, features.promotion_count * 4);

    // Leadership experience: up to 10 points
    boost += (features.leadership_experience / 100) * 10;

    // Product & Startup exposure: up to 8 points each
    boost += (features.product_experience / 100) * 8;
    boost += Math.min(8, features.startup_experience * 4);

    // Career velocity boost: up to 5 points
    if (features.career_velocity > 0.4) {
      boost += 5;
    } else if (features.career_velocity > 0.2) {
      boost += 2;
    }

    // Combine and limit to 100
    const experience_score = Math.round(Math.min(100, yoeScore * 0.7 + boost * 30));

    return experience_score;
  }
}
