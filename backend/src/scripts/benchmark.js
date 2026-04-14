const { analyzeDeterministally } = require("../services/deterministicEngine");
const fs = require('fs');
const path = require('path');

async function runBenchmark() {
  console.log("🚀 STARTING BIAS ENGINE BENCHMARK (Dataset Grounding)");
  
  const bankPath = path.join(__dirname, '../data/neutral_bank.json');
  if (!fs.existsSync(bankPath)) {
    console.error("No neutral bank found. Run harvester first.");
    return;
  }

  const bank = JSON.parse(fs.readFileSync(bankPath, 'utf8'));
  const allQuestions = [...bank.bank.technical, ...bank.bank.leadership, ...bank.bank.analytical, ...bank.bank.general];
  
  let lowBias = 0;
  let mediumBias = 0;
  let highBias = 0;
  const failures = [];

  allQuestions.forEach(q => {
    const result = analyzeDeterministally(q);
    if (result.bias_score <= 30) {
      lowBias++;
    } else if (result.bias_score <= 60) {
      mediumBias++;
      failures.push({ question: q, score: result.bias_score, types: result.bias_types });
    } else {
      highBias++;
      failures.push({ question: q, score: result.bias_score, types: result.bias_types });
    }
  });

  const total = allQuestions.length;
  const passRate = ((lowBias / total) * 100).toFixed(2);

  console.log(`\n📊 BENCHMARK RESULTS:`);
  console.log(`- Total Questions tested: ${total}`);
  console.log(`- LOW Bias (Pass): ${lowBias} (${passRate}%)`);
  console.log(`- MEDIUM Bias: ${mediumBias}`);
  console.log(`- HIGH Bias: ${highBias}`);

  if (passRate < 90) {
    console.warn("\n⚠️  FAIL: Bias engine is too aggressive! False positives detected.");
    console.log("Sample False Positives:");
    failures.slice(0, 5).forEach(f => {
      console.log(`   [Score ${f.score}] [${f.types.join(', ')}] -> "${f.question.substring(0, 80)}..."`);
    });
  } else {
    console.log("\n✅ PASS: Bias engine is well-calibrated (90%+ accuracy).");
  }
}

runBenchmark();
