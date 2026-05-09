// backend/src/ai/cache.js
const { supabase } = require('../config/supabase');
const crypto = require('crypto');

async function getCachedKit(role, experience, companyType) {
  // Normalize inputs for cache key
  const key = crypto
    .createHash('md5')
    .update(
      `${(role || '').toLowerCase().trim()}:${(experience || '').toLowerCase().trim()}:${(companyType || '').toLowerCase().trim()}`
    )
    .digest('hex');

  const { data, error } = await supabase
    .from('kit_cache')
    .select('result, created_at')
    .eq('cache_key', key)
    .single();

  if (error || !data) return null;

  // Cache valid for 7 days
  const ageHours = (Date.now() - new Date(data.created_at).getTime()) / 3600000;
  if (ageHours > 168) return null;

  console.log(`[Cache] HIT for ${role} | ${experience} | ${companyType}`);
  return data.result;
}

async function setCachedKit(role, experience, companyType, result) {
  const key = crypto
    .createHash('md5')
    .update(
      `${(role || '').toLowerCase().trim()}:${(experience || '').toLowerCase().trim()}:${(companyType || '').toLowerCase().trim()}`
    )
    .digest('hex');

  await supabase
    .from('kit_cache')
    .upsert({
      cache_key: key,
      role,
      experience,
      company_type: companyType,
      result,
      created_at: new Date().toISOString()
    }, { onConflict: 'cache_key' });

  console.log(`[Cache] SET for ${role} | ${experience} | ${companyType}`);
}

module.exports = {
  getCachedKit,
  setCachedKit
};
