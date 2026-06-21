import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eslkufryzbirhvvsdyte.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzbGt1ZnJ5emJpcmh2dnNkeXRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5MzgzMjUsImV4cCI6MjA5NzUxNDMyNX0.AY73V6oPFK-oFGxba9sdYuoAmys3ogDDo7HpGaHlzwA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
