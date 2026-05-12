const { incrementUsage, getUsage } = require('./src/services/usageService');
const { getDetails } = require('./src/controllers/subscriptionController');

async function test() {
  const userId = 'user_2xyz'; // arbitrary
  console.log("Before:", await getUsage(userId));
  await incrementUsage(userId, 'analyses_used', 1);
  console.log("After:", await getUsage(userId));
}

test().catch(console.error);
