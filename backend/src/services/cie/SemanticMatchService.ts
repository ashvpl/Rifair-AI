import { StructuredJobProfile } from "./JobUnderstandingService";

export interface RelevanceScores {
  role_similarity: number; // 0-100
  domain_similarity: number; // 0-100
  technology_similarity: number; // 0-100
  product_similarity: number; // 0-100
  startup_similarity: number; // 0-100
  relevance_score: number; // 0-100 composite
}

export class SemanticMatchService {
  private static STOPWORDS = new Set([
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "arent", "as", "at",
    "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "cant", "cannot", "could",
    "did", "didnt", "do", "does", "doesnt", "doing", "dont", "down", "during", "each", "few", "for", "from", "further",
    "had", "hadnt", "has", "hasnt", "have", "havent", "having", "he", "hed", "hell", "hes", "her", "here", "heres",
    "hers", "herself", "him", "himself", "his", "how", "hows", "i", "id", "ill", "im", "ive", "if", "in", "into", "is",
    "isnt", "it", "its", "itself", "lets", "me", "more", "most", "mustnt", "my", "myself", "no", "nor", "not", "of",
    "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same",
    "shant", "she", "shed", "shell", "shes", "should", "shouldnt", "so", "some", "such", "than", "that", "thats",
    "the", "their", "theirs", "them", "themselves", "then", "there", "theres", "these", "they", "theyd", "theyll",
    "theyre", "theyve", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasnt",
    "we", "wed", "well", "were", "weve", "werent", "what", "whats", "when", "whens", "where", "wheres", "which",
    "while", "who", "whos", "whom", "why", "whys", "with", "wont", "would", "wouldnt", "you", "youd", "youll",
    "youre", "youve", "your", "yours", "yourself", "yourselves"
  ]);

  private static tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .filter(token => token.length > 1 && !this.STOPWORDS.has(token));
  }

  // Cosine Similarity between two term frequency maps
  private static cosineSimilarity(vecA: Map<string, number>, vecB: Map<string, number>): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    vecA.forEach((val, key) => {
      normA += val * val;
      if (vecB.has(key)) {
        dotProduct += val * (vecB.get(key) || 0);
      }
    });

    vecB.forEach((val) => {
      normB += val * val;
    });

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private static getTermFreq(tokens: string[]): Map<string, number> {
    const tf = new Map<string, number>();
    tokens.forEach(token => {
      tf.set(token, (tf.get(token) || 0) + 1);
    });
    return tf;
  }

  public static calculateRelevance(
    candidate: any,
    features: any,
    jdProfile: StructuredJobProfile
  ): RelevanceScores {
    // 1. Role Similarity
    const targetTitleTokens = this.tokenize(jdProfile.role_title);
    const candidateTitleTokens = this.tokenize(features.current_title + " " + (candidate.profile?.headline || ""));
    
    const targetTitleTf = this.getTermFreq(targetTitleTokens);
    const candidateTitleTf = this.getTermFreq(candidateTitleTokens);
    const role_similarity = Math.round(this.cosineSimilarity(targetTitleTf, candidateTitleTf) * 100);

    // 2. Domain Similarity
    const jdDomainText = jdProfile.required_domains.join(" ") + " " + jdProfile.preferred_domains.join(" ");
    const candidateDomainText = (candidate.profile?.current_industry || "") + " " + (candidate.profile?.summary || "");
    const domain_similarity = Math.round(
      this.cosineSimilarity(
        this.getTermFreq(this.tokenize(jdDomainText)),
        this.getTermFreq(this.tokenize(candidateDomainText))
      ) * 100
    );

    // 3. Technology Similarity
    // Match candidate skills and assessment scores against required and preferred skills
    const candidateSkills = new Set((candidate.skills || []).map((s: any) => s.name.toLowerCase()));
    
    let matchedReq = 0;
    jdProfile.required_skills.forEach(skill => {
      if (candidateSkills.has(skill)) matchedReq++;
    });

    let matchedPref = 0;
    jdProfile.preferred_skills.forEach(skill => {
      if (candidateSkills.has(skill)) matchedPref++;
    });

    const reqScore = jdProfile.required_skills.length > 0 ? (matchedReq / jdProfile.required_skills.length) * 70 : 70;
    const prefScore = jdProfile.preferred_skills.length > 0 ? (matchedPref / jdProfile.preferred_skills.length) * 30 : 30;
    const technology_similarity = Math.round(reqScore + prefScore);

    // 4. Product Similarity
    // Looks at description text matching product-engineering concepts
    const jdProductText = jdProfile.product_requirements.join(" ");
    const candidateCareerDesc = (candidate.career_history || [])
      .map((job: any) => job.description || "")
      .join(" ");
    const product_similarity = Math.round(
      this.cosineSimilarity(
        this.getTermFreq(this.tokenize(jdProductText)),
        this.getTermFreq(this.tokenize(candidateCareerDesc))
      ) * 100
    );

    // 5. Startup Similarity
    // Based on features.startup_experience and startup keywords in career
    const jdStartupText = jdProfile.startup_requirements.join(" ");
    const startup_similarity = Math.round(
      this.cosineSimilarity(
        this.getTermFreq(this.tokenize(jdStartupText)),
        this.getTermFreq(this.tokenize(candidateCareerDesc))
      ) * 100
    );

    // Composite Relevance Score
    const relevance_score = Math.round(
      role_similarity * 0.30 +
      technology_similarity * 0.30 +
      domain_similarity * 0.15 +
      product_similarity * 0.15 +
      startup_similarity * 0.10
    );

    return {
      role_similarity,
      domain_similarity,
      technology_similarity,
      product_similarity,
      startup_similarity,
      relevance_score
    };
  }
}
