import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fnxrwhaaspycijdfiiwj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZueHJ3aGFhc3B5Y2lqZGZpaXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQzOTg3NjgsImV4cCI6MjA0OTk3NDc2OH0.G8QwHe43XikZplqlMVnstIf2tRLdVHGyR9B2iF7V3qI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);