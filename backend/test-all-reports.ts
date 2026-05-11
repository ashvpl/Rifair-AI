import 'dotenv/config';
import { supabase } from './src/config/supabase';

async function test() {
  const { data, error } = await supabase
    .from('analysis_reports')
    .select('user_id, input_text, created_at, categories');
  
  if (data) {
     const byUser = data.reduce((acc, r) => {
       acc[r.user_id] = (acc[r.user_id] || 0) + 1;
       return acc;
     }, {});
     console.log('Reports count by user:', byUser);
     for (const r of data) {
        console.log(`[${r.user_id}] ${r.input_text} (${r.categories?.analysis_type}) - ${r.created_at}`);
     }
  }
}
test();
