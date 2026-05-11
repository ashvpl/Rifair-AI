require('dotenv').config({ path: '/Users/ayushpatil/Documents/Rifair AI/backend/.env' });
const { getDetails } = require('./src/controllers/subscriptionController');
const { getUsage } = require('./src/services/subscriptionService');

async function test() {
  const req = { auth: { userId: 'user_3BRgxHUxdkT8aiAWOMw9oqPSbSn' } }; // using the user id from logs
  const res = {
    status: (code) => { console.log('Status:', code); return res; },
    json: (data) => console.log('JSON:', JSON.stringify(data, null, 2))
  };
  await getDetails(req, res);
}
test();
