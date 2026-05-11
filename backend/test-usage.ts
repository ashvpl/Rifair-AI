import 'dotenv/config';
import { supabase } from './src/config/supabase';

async function test() {
  const { data, error } = await supabase
    .from('usage')
    .select('*')
    .limit(1);
  console.log('Data:', data);
  console.log('Error:', error);
}
test();
