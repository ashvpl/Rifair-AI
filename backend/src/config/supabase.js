// backend/src/config/supabase.js
'use strict';

const { createClient } = require("@supabase/supabase-js");
const { secrets } = require("../core/secrets/secretManager");

const supabaseUrl = secrets.get('SUPABASE_URL');
const supabaseKey = secrets.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };
