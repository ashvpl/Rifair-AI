const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();
console.log("Testing with GEMINI_API_KEY_SECONDARY:", process.env.GEMINI_API_KEY_SECONDARY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_SECONDARY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
async function run() {
  try {
    const result = await model.generateContent("Say hello");
    console.log("Success:", result.response.text());
  } catch (e) {
    console.error("Error:", e.message);
  }
}
run();
