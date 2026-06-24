import { StructuredJobProfile } from "./JobUnderstandingService";
import { CandidateFeatureService } from "./CandidateFeatureService";
import { SemanticMatchService } from "./SemanticMatchService";
import { ShipperClassifier } from "./ShipperClassifier";
import { AuthenticityService } from "./AuthenticityService";
import { BehaviorEngine } from "./BehaviorEngine";
import { ExperienceScoringService } from "./ExperienceScoringService";

export interface RankedCandidate {
  candidate_id: string;
  score: number; // 0.0 - 1.0
  rank: number;
  reasoning: string;
  // Detail scores for explainability
  relevance: number;
  experience: number;
  behavior: number;
  shipper: number;
  trust: number;
  availability: number;
  honeypot_risk: string;
  archetype: string;
}

export class RankingEngine {
  public static rankCandidates(
    candidates: any[],
    jdProfile: StructuredJobProfile
  ): RankedCandidate[] {
    
    // --- STAGE 1: FAST RETRIEVAL (Narrow 100K down to top 2,000) ---
    // Compute a lightweight match score to quickly filter out irrelevant candidates.
    // This takes < 1 second on 100,000 profiles.
    const preFiltered = candidates.map(candidate => {
      const profile = candidate.profile || {};
      const title = (profile.current_title || "").toLowerCase();
      const skills = (candidate.skills || []).map((s: any) => s.name.toLowerCase());
      
      let matchCount = 0;
      // Match title words
      if (title.includes("ai") || title.includes("ml") || title.includes("machine learning") || title.includes("nlp") || title.includes("retrieval") || title.includes("search")) {
        matchCount += 15;
      }
      if (title.includes("engineer") || title.includes("developer") || title.includes("architect")) {
        matchCount += 5;
      }

      // Match core skills
      const coreSkills = ["python", "embeddings", "retrieval", "vector", "nlp"];
      coreSkills.forEach(s => {
        if (skills.includes(s)) matchCount += 5;
      });

      return {
        candidate,
        fastScore: matchCount
      };
    });

    // Sort by fastScore and keep top 2,000
    preFiltered.sort((a, b) => b.fastScore - a.fastScore);
    const topCandidates = preFiltered.slice(0, 2000).map(x => x.candidate);

    // --- STAGE 2: DEEP SCORING & RERANKING ---
    const scoredCandidates: RankedCandidate[] = topCandidates.map(candidate => {
      const features = CandidateFeatureService.extractFeatures(candidate);
      const relevanceScores = SemanticMatchService.calculateRelevance(candidate, features, jdProfile);
      const shipperScores = ShipperClassifier.classify(candidate, features);
      const authenticity = AuthenticityService.assess(candidate);
      const behavior = BehaviorEngine.assess(candidate);
      const experience_score = ExperienceScoringService.calculateExperienceScore(features, jdProfile);

      // Extract specific components for the formula
      const relevance_score = relevanceScores.relevance_score;
      const behavior_score = behavior.behavior_score;
      const availability_score = behavior.availability_score;
      const shipper_score = shipperScores.shipper_score;
      const trust_score = authenticity.trust_score;

      // Formula implementation
      // We use the weighted additive model (which sums to 100) and scale to 0.0 - 1.0.
      // Additionally, we apply a hard multiplicative penalty if they are a honeypot (trust_score < 30).
      let final_score_100 = 
        (relevance_score * 0.40) +
        (experience_score * 0.20) +
        (behavior_score * 0.15) +
        (shipper_score * 0.10) +
        (trust_score * 0.10) +
        (availability_score * 0.05);

      if (authenticity.honeypot_risk === "HIGH" || trust_score < 30) {
        final_score_100 = final_score_100 * 0.01; // Force honeypots to bottom
      }

      const score = parseFloat((final_score_100 / 100).toFixed(4));

      // Generate brief reasoning (detailed explanation is handled by ExplainabilityService)
      return {
        candidate_id: candidate.candidate_id,
        score,
        rank: 0, // Assigned after sorting
        reasoning: "",
        relevance: relevance_score,
        experience: experience_score,
        behavior: behavior_score,
        shipper: shipper_score,
        trust: trust_score,
        availability: availability_score,
        honeypot_risk: authenticity.honeypot_risk,
        archetype: shipperScores.category
      };
    });

    // Sort descending by score. Tie-break using candidate_id ascending.
    scoredCandidates.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.candidate_id.localeCompare(b.candidate_id);
    });

    // Assign Ranks (1-based)
    scoredCandidates.forEach((cand, index) => {
      cand.rank = index + 1;
    });

    return scoredCandidates;
  }
}
