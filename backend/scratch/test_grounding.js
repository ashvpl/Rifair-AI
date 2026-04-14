const { generateInterviewKit } = require("./src/services/fallback");

async function test() {
  console.log("Testing Grounding for 'actor':");
  const kit = generateInterviewKit("actor", "5+ years");
  console.log(JSON.stringify(kit, null, 2));
  
  console.log("\nTesting Grounding for 'marketing analyst':");
  const kit2 = generateInterviewKit("marketing analyst", "5+ years");
  console.log(JSON.stringify(kit2, null, 2));
}

test();
