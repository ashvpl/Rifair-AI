// Quick smoke test — run from backend directory
// Usage: node src/scripts/smokeTest.js
"use strict";

require("dotenv").config();

let failures = 0;
const tests = [
  ["analysisMasterPrompt", () => require("../prompts/analysisMasterPrompt")],
  ["kitMasterPrompt",      () => require("../prompts/kitMasterPrompt")],
  ["outputValidator",      () => require("../quality/outputValidator")],
  ["aiPipeline",           () => require("../quality/aiPipeline")],
  ["apiOptimizer",         () => require("../cost/apiOptimizer")],
  ["aiService",            () => require("../services/aiService")],
  ["pipeline",             () => require("../utils/pipeline")],
  ["analyzeController",    () => require("../controllers/analyzeController")],
  ["kitController",        () => require("../controllers/kitController")],
];

for (const [name, fn] of tests) {
  try {
    fn();
    console.log("OK  " + name);
  } catch (e) {
    console.error("ERR " + name + ": " + e.message);
    failures++;
  }
}

console.log(
  failures === 0
    ? "\n✅ All modules loaded successfully"
    : `\n❌ ${failures} module(s) failed`
);
process.exit(failures > 0 ? 1 : 0);
