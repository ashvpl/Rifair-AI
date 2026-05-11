import 'dotenv/config';
import { supabase } from './src/config/supabase';

async function test() {
  const { data, error } = await supabase
    .from('analysis_reports')
    .select('categories')
    .eq('user_id', 'user_3BRgxHUxdkT8aiAWOMw9oqPSbSn');
  console.log('Error:', error);
  console.log('Data count:', data?.length);
  if (data) {
     console.log(data.map(r => r.categories?.analysis_type));
  }
}
test();
