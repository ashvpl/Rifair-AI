const { runUnifiedPipeline } = require("./pipeline");

async function runTests() {
  const tests = [
    {
      name: "LOW BIAS",
      text: "Tell me about your technical experience with React and Node.js. What was the most challenging project you worked on?",
      expectedRisk: "LOW"
    },
    {
      name: "MID BIAS",
      text: "We need someone young and energetic for this role. Can you work long hours and weekends?",
      expectedRisk: "MEDIUM"
    },
    {
      name: "HIGH BIAS",
      text: "Are you planning to have kids soon? We work long hours. We need a rockstar who can dedicate their life to the company. No work-life balance here.",
      expectedRisk: "HIGH"
    }
  ];

  for (const test of tests) {
    console.log(`\n--- Running Test: ${test.name} ---`);
    try {
      const result = await runUnifiedPipeline(test.text);
      console.log(`Score: ${result.overallScore}`);
      console.log(`Risk Level: ${result.riskLevel}`);
      console.log(`AI Used: ${result.aiUsed}`);
      console.log(`Questions Flagged: ${result.questions.filter(q => q.flags.length > 0).length}`);
      
      // Check if all flagged questions have highlighs and rewrites
      result.questions.forEach(q => {
        if (q.flags.length > 0) {
          console.log(`- Original: "${q.original}"`);
          console.log(`  Highlighted: "${q.highlighted}"`);
          console.log(`  Rewrite: "${q.rewrite}"`);
          if (q.original === q.rewrite) console.error("FAILED: Missing rewrite for flagged question!");
          if (!q.highlighted.includes("<span")) console.error("FAILED: Missing highligh for flagged question!");
        }
      });
    } catch (err) {
      console.error(`- Test failed with error: ${err.message}`);
    }
  }
}

runTests();
