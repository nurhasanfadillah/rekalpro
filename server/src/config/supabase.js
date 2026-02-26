const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://ypzaeibjjppejjfbfubq.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwemFlaWJqanBwZWpqZmJmdWJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMTg4MzgsImV4cCI6MjA4NzY5NDgzOH0.ze3q6WrALXmYdRG0fjG_xKOVUUBXXMWaMvL12ia5uAE';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
