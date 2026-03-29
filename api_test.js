require("dotenv").config({ path: "./backend/.env" });
const { generateKit } = require("./backend/services/aiService");

async function testRoles() {
  const roles = ["lyricist", "mechanic", "electrician", "teacher", "software engineer"];

  for (const role of roles) {
    console.log(`\n============================`);
    console.log(`Testing role: ${role}`);
    console.log(`============================`);
    
    try {
      const kit = await generateKit(role, "mid-level", "startup", "standard");
      console.log(JSON.stringify(kit, null, 2));
    } catch (err) {
      console.error(`Error for role ${role}:`, err.message);
    }
  }
}

testRoles();
