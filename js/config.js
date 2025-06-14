// config.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

export const SUPABASE_URL = 'https://pbyghuwvqagkirkwcpda.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieWdodXd2cWFna2lya3djcGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0NzYxNDQsImV4cCI6MjA2NTA1MjE0NH0.hfwb9xzsh4m3I1Qkf_SGY8VeTNEZDWliIzl4w8Frmfg';

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Durée de cache (5 minutes)
export const CACHE_DURATION = 5 * 60 * 1000;

// Couleurs overlay
export const OVERLAY_COLORS = ['indigo', 'blue', 'green', 'purple'];
