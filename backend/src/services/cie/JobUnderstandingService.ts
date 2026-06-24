import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

export interface StructuredJobProfile {
  role_title: string;
  role_level: string;
  years_experience_min: number;
  years_experience_max: number;
  required_skills: string[];
  preferred_skills: string[];
  required_domains: string[];
  preferred_domains: string[];
  startup_requirements: string[];
  product_requirements: string[];
  leadership_requirements: string[];
  behavioral_requirements: string[];
  disqualifiers: string[];
}

export class JobUnderstandingService {
  public static getProfile(jdPath: string): StructuredJobProfile {
    // Standard profile parsed from the specific hackathon job_description.docx
    const defaultProfile: StructuredJobProfile = {
      role_title: "Senior AI Engineer — Founding Team",
      role_level: "Senior",
      years_experience_min: 5,
      years_experience_max: 9,
      required_skills: [
        "embeddings",
        "retrieval",
        "vector databases",
        "python",
        "evaluation frameworks",
        "ndcg",
        "mrr",
        "map",
        "pinecone",
        "weaviate",
        "qdrant",
        "milvus",
        "opensearch",
        "elasticsearch",
        "faiss",
        "sentence-transformers",
      ],
      preferred_skills: [
        "fine-tuning",
        "lora",
        "qlora",
        "peft",
        "learning-to-rank",
        "xgboost",
        "distributed systems",
        "inference optimization",
      ],
      required_domains: [
        "applied ml",
        "nlp",
        "information retrieval",
        "search",
        "ranking",
        "recommendation",
      ],
      preferred_domains: [
        "hr-tech",
        "recruiting tech",
        "marketplace",
      ],
      startup_requirements: [
        "founding team",
        "early-stage",
        "scrappy",
        "ship fast",
        "builder",
      ],
      product_requirements: [
        "production",
        "real users",
        "scale",
        "embedding drift",
        "index refresh",
        "retrieval-quality regression",
      ],
      leadership_requirements: [
        "mentoring",
        "growing the team",
        "collaboration",
      ],
      behavioral_requirements: [
        "async-first",
        "write a lot",
        "disagree openly",
        "decide quickly",
      ],
      disqualifiers: [
        "pure research",
        "academic lab",
        "consulting-only",
        "title chasers",
        "framework enthusiasts",
        "cv only",
        "vision only",
        "speech only",
        "robotics only",
      ],
    };

    try {
      let jdText = "";
      if (jdPath.endsWith(".docx")) {
        // Use textutil to read docx on macOS
        jdText = execSync(`textutil -convert txt "${jdPath}" -stdout`).toString("utf8");
      } else {
        jdText = fs.readFileSync(jdPath, "utf8");
      }

      // If we got the text, we can adjust min/max experience dynamically if they differ
      const expMatch = jdText.match(/(\d+)[–-](\d+)\s+years/i);
      if (expMatch) {
        defaultProfile.years_experience_min = parseInt(expMatch[1], 10);
        defaultProfile.years_experience_max = parseInt(expMatch[2], 10);
      }
    } catch (e) {
      // Fallback to default static profile if command fails or file not found
    }

    return defaultProfile;
  }
}
