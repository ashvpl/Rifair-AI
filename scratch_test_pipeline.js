require("dotenv").config({ path: "backend/.env" });
const { runUnifiedPipeline } = require("./backend/src/utils/pipeline");

async function runTest() {
   const originalQuestions = `How old are you?
Where are you from originally?
Can you describe a complex technical challenge you solved recently?
Are you planning to start a family soon?
We're a fast-paced bro culture, can you keep up?`;

   console.log("Running Deep Analysis Pipeline...");
   const result = await runUnifiedPipeline(originalQuestions);

   console.log(JSON.stringify(result, null, 2));
}

runTest();
