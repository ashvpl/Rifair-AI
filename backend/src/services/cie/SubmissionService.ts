import * as fs from "fs";
import { RankedCandidate } from "./RankingEngine";

export class SubmissionService {
  public static writeToCsv(ranked: RankedCandidate[], outputPath: string): void {
    // Only take top 100
    const top100 = ranked.slice(0, 100);

    if (top100.length !== 100) {
      throw new Error(`Expected exactly 100 candidates for submission, got ${top100.length}`);
    }

    const csvLines: string[] = ["candidate_id,rank,score,reasoning"];

    top100.forEach(cand => {
      // Escape reasoning string for CSV standard
      const escapedReasoning = `"${cand.reasoning.replace(/"/g, '""')}"`;
      csvLines.push(`${cand.candidate_id},${cand.rank},${cand.score.toFixed(4)},${escapedReasoning}`);
    });

    fs.writeFileSync(outputPath, csvLines.join("\n") + "\n", "utf8");
  }
}
