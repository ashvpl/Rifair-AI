const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI("AIzaSyCeuy0mRcLR5OceuJE-ZLvfSWxq024WjZE");
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
async function run() {
  try {
    const result = await model.generateContent("Say hello");
    console.log(result.response.text());
  } catch (e) {
    console.error(e.message);
  }
}
run();
