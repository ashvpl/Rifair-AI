// ═══════════════════════════════════════════════════════════════════════════════
// INDIA BIAS PIPELINE — Test Suite
// Run: node backend/src/utils/test_india_pipeline.js
// Tests the rule-based layers (1 + 2) without AI for instant validation.
// ═══════════════════════════════════════════════════════════════════════════════

const { analyzeIndiaQuestionSync } = require("../services/india/indiaPipeline");

const TEST_CASES = [
  // ── Should score 90+ ──
  {
    question: "What is your caste and community background?",
    expected_min_score: 90,
    expected_categories: ["caste_bias"]
  },
  {
    question: "Do you observe namaz or any religious prayers during work hours?",
    expected_min_score: 85,
    expected_categories: ["religion_bias"]
  },
  {
    question: "We prefer candidates with a pleasing personality for this role.",
    expected_min_score: 88,
    expected_categories: ["appearance_bias"]
  },

  // ── Should score 70-89 ──
  {
    question: "Are you comfortable working in a male-dominated environment?",
    expected_min_score: 70,
    expected_categories: ["gender_bias"]
  },
  {
    question: "Which state are you originally from?",
    expected_min_score: 70,
    expected_categories: ["regional_bias"]
  },
  {
    question: "Did you study at an IIT or IIM?",
    expected_min_score: 50,
    expected_categories: ["caste_bias"]
  },

  // ── Should score 40-69 ──
  {
    question: "Are you comfortable with Hindi as the primary office language?",
    expected_min_score: 40,
    expected_categories: ["regional_bias"]
  },
  {
    question: "Do you have any dietary restrictions we should know about?",
    expected_min_score: 40,
    expected_categories: ["religion_bias"]
  },

  // ── Should score below 20 (clean questions) ──
  {
    question: "Can you walk us through your most relevant project experience?",
    expected_max_score: 15
  },
  {
    question: "How do you handle competing deadlines across multiple projects?",
    expected_max_score: 10
  }
];

function runTests() {
  let passed = 0;
  let failed = 0;

  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log("  INDIA BIAS PIPELINE — TEST SUITE (Rule-based: Layers 1+2)");
  console.log("═══════════════════════════════════════════════════════════════\n");

  for (const test of TEST_CASES) {
    const result = analyzeIndiaQuestionSync(test.question);
    const score = result.india_bias_score;
    const cats = result.categories;
    const shortQ = test.question.length > 55 ? test.question.substring(0, 52) + "..." : test.question;

    if ("expected_min_score" in test) {
      if (score >= test.expected_min_score) {
        console.log(`  ✓ PASS: "${shortQ}"`);
        console.log(`         Score: ${score} (expected ≥${test.expected_min_score}) | Categories: [${cats.join(", ")}]`);
        passed++;
      } else {
        console.log(`  ✗ FAIL: "${shortQ}"`);
        console.log(`         Score: ${score} (expected ≥${test.expected_min_score}) | Categories: [${cats.join(", ")}]`);
        console.log(`         Verdict: ${result.verdict} | Keyword flags: ${result.keyword_flags.length} | Structural: ${result.structural_matches.length}`);
        failed++;
      }
    } else if ("expected_max_score" in test) {
      if (score <= test.expected_max_score) {
        console.log(`  ✓ PASS: "${shortQ}"`);
        console.log(`         Score: ${score} (expected ≤${test.expected_max_score}) | Clean`);
        passed++;
      } else {
        console.log(`  ✗ FAIL: "${shortQ}"`);
        console.log(`         Score: ${score} (expected ≤${test.expected_max_score}) | Categories: [${cats.join(", ")}]`);
        failed++;
      }
    }

    // Category check
    if (test.expected_categories) {
      for (const expectedCat of test.expected_categories) {
        if (!cats.includes(expectedCat)) {
          console.log(`         ⚠ Missing expected category: ${expectedCat}`);
        }
      }
    }

    console.log("");
  }

  console.log("═══════════════════════════════════════════════════════════════");
  console.log(`  RESULTS: ${passed}/${passed + failed} tests passed`);
  if (failed > 0) {
    console.log(`  ⚠ ${failed} test(s) failed — review scoring weights`);
  } else {
    console.log("  ✅ All tests passed!");
  }
  console.log("═══════════════════════════════════════════════════════════════\n");
}

runTests();
