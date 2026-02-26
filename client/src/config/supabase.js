import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ypzaeibjjppejjfbfubq.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwemFlaWJqanBwZWpqZmJmdWJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMTg4MzgsImV4cCI6MjA4NzY5NDgzOH0.ze3q6WrALXmYdRG0fjG_xKOVUUBXXMWaMvL12ia5uAE';

export const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
