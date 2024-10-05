import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-supabase-url.supabase.co'; // Replace with your actual Supabase URL
const supabaseAnonKey = 'your-anon-key'; // Replace with your actual Supabase Anon Key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);