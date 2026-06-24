import { RankedCandidate } from "./RankingEngine";

export class ExplainabilityService {
  public static generateReasoning(cand: RankedCandidate, candidate: any): string {
    const profile = candidate.profile || {};
    const signals = candidate.redrob_signals || {};
    const title = profile.current_title || "Engineer";
    const years = profile.years_of_experience || 0;
    const responseRate = Math.round((signals.recruiter_response_rate || 0) * 100);
    const noticePeriod = signals.notice_period_days || 0;

    // Get matching tech skills
    const coreSkills = ["python", "embeddings", "retrieval", "vector", "nlp", "milvus", "qdrant", "pinecone", "weaviate"];
    const candidateSkills = (candidate.skills || []).map((s: any) => s.name.toLowerCase());
    const matchedSkills = coreSkills.filter(s => candidateSkills.includes(s)).slice(0, 3);
    const skillText = matchedSkills.length > 0 ? matchedSkills.join(", ") : "relevant ML skills";

    // Dynamic templates based on rank and profile details
    let part1 = "";
    let part2 = "";
    let part3 = "";

    // Part 1: Core Profile & Rank Matching
    if (cand.rank <= 10) {
      part1 = `Top-tier ${title} with ${years} years of experience, demonstrating a strong match for our founding team.`;
    } else if (cand.rank <= 50) {
      part1 = `Strong ${title} with ${years} years of experience and solid product engineering credentials.`;
    } else {
      part1 = `${title} with ${years} years of experience in adjacent domains.`;
    }

    // Part 2: Technical Strengths
    if (cand.archetype === "Builder" || cand.archetype === "Founder Type") {
      part2 = `Proven builder who has shipped systems utilizing ${skillText}.`;
    } else if (matchedSkills.length > 0) {
      part2 = `Good technical match with active experience in ${skillText}.`;
    } else {
      part2 = `Matches some core programming requirements but lacks specialized vector database exposure.`;
    }

    // Part 3: Behavioral & Logistics Concerns
    const noticeText = noticePeriod > 60 ? `has a long notice period (${noticePeriod} days)` : `${noticePeriod}-day notice`;
    if (responseRate > 75) {
      part3 = `Highly active with a ${responseRate}% response rate and ${noticeText}.`;
    } else if (responseRate < 30) {
      part3 = `However, low platform responsiveness (${responseRate}% response rate) and ${noticeText} may slow outreach.`;
    } else {
      part3 = `Platform response rate is average (${responseRate}%) with ${noticeText}.`;
    }

    return `${part1} ${part2} ${part3}`;
  }
}
