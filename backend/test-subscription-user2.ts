import 'dotenv/config';
import { getDetails } from './src/controllers/subscriptionController';

async function test() {
  const req = { auth: { userId: 'user_3DYrXwHKrx7C74TZbJEKFJz8Zmd' } } as any;
  const res = {
    status: (code: any) => { console.log('Status:', code); return res; },
    json: (data: any) => console.log('JSON:', JSON.stringify(data, null, 2))
  } as any;
  await getDetails(req, res);
}
test();
