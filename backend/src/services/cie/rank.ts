import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import { JobUnderstandingService } from "./JobUnderstandingService";
import { RankingEngine } from "./RankingEngine";
import { ExplainabilityService } from "./ExplainabilityService";
import { SubmissionService } from "./SubmissionService";

async function main() {
  const args = process.argv.slice(2);
  let candidatesPath = path.join(__dirname, "../../../../datasets/candidates.jsonl");
  let outputPath = path.join(__dirname, "../../../../submission.csv");
  let jdPath = path.join(__dirname, "../../../../job_description.docx");

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--candidates" && args[i + 1]) {
      candidatesPath = path.resolve(args[i + 1]);
    }
    if (args[i] === "--out" && args[i + 1]) {
      outputPath = path.resolve(args[i + 1]);
    }
    if (args[i] === "--jd" && args[i + 1]) {
      jdPath = path.resolve(args[i + 1]);
    }
  }

  console.log(`Starting Candidate Intelligence Engine...`);
  console.log(`Job Description: ${jdPath}`);
  console.log(`Candidates File: ${candidatesPath}`);
  console.log(`Output File: ${outputPath}`);

  const startTime = Date.now();

  // 1. Understand Job Description
  const jdProfile = JobUnderstandingService.getProfile(jdPath);
  console.log(`Job Profile parsed for role: ${jdProfile.role_title}`);

  // 2. Stream candidates.jsonl to avoid high memory spikes
  const candidates: any[] = [];
  const fileStream = fs.createReadStream(candidatesPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineCount = 0;
  for await (const line of rl) {
    if (line.trim()) {
      try {
        const candidate = JSON.parse(line);
        candidates.push(candidate);
        lineCount++;
        if (lineCount % 20000 === 0) {
          console.log(`Loaded ${lineCount} candidates...`);
        }
      } catch (err) {
        console.error(`Error parsing JSON at line ${lineCount + 1}`);
      }
    }
  }

  console.log(`Finished loading ${lineCount} candidates in ${((Date.now() - startTime) / 1000).toFixed(2)}s`);

  // 3. Rank Candidates (Stage 1 & Stage 2)
  console.log(`Ranking candidates...`);
  const ranked = RankingEngine.rankCandidates(candidates, jdProfile);

  // 4. Generate Explainability reasoning for top 100 candidates
  console.log(`Generating reasoning for top 100...`);
  const candidatesMap = new Map<string, any>();
  candidates.forEach(c => candidatesMap.set(c.candidate_id, c));

  const top100 = ranked.slice(0, 100);
  top100.forEach(cand => {
    const rawCandidate = candidatesMap.get(cand.candidate_id);
    cand.reasoning = ExplainabilityService.generateReasoning(cand, rawCandidate);
  });

  // 5. Output CSV
  console.log(`Writing submission CSV...`);
  SubmissionService.writeToCsv(ranked, outputPath);

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`Ranking completed successfully in ${duration}s!`);
  console.log(`Submission saved to: ${outputPath}`);
}

main().catch(err => {
  console.error("Fatal error during ranking:", err);
  process.exit(1);
});
