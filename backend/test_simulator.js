const { simulateBias } = require("./services/aiService");
require("dotenv").config();

async function testSimulator() {
  const neutral_question = "How do you handle pressure in competitive environments?";
  console.log(`Testing Bias Simulator with: "${neutral_question}"\n`);

  try {
    const simulation = await simulateBias(neutral_question);
    console.log("SIMULATION RESULT:");
    console.log(JSON.stringify(simulation, null, 2));
  } catch (err) {
    console.error("Test Error:", err.message);
  }
}

testSimulator();
