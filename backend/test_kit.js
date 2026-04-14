require("dotenv").config();
const { generateKitOptimized } = require("./src/services/aiService");
(async () => {
  try {
    const res = await generateKitOptimized("fashion designer", "5+ years", "luxury brand", "");
    console.log(res);
  } catch (e) {
    console.error(e);
  }
})();
