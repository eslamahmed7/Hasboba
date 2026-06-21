import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabaseUrl = rawUrl && !rawUrl.includes('_here') ? rawUrl : 'https://eslkufryzbirhvvsdyte.supabase.co';
const supabaseAnonKey = rawKey && !rawKey.includes('_here') ? rawKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzbGt1ZnJ5emJpcmh2dnNkeXRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5MzgzMjUsImV4cCI6MjA5NzUxNDMyNX0.AY73V6oPFK-oFGxba9sdYuoAmys3ogDDo7HpGaHlzwA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
