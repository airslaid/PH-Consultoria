import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://johkviqoznvgqqzpgmwm.supabase.co';
const supabaseKey = 'sb_publishable_1rakoEeZLhfyqR-sda772g_jIn6QVNn';

export const supabase = createClient(supabaseUrl, supabaseKey);
