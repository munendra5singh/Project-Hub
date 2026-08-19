/**
 * Supabase Client Initialization Module
 * 
 * Configured with user's live Supabase Project URL & Publishable Key.
 * 
 * ⚠️ NEVER expose the service_role key in frontend code!
 */

export const SUPABASE_URL = window.SUPABASE_URL || localStorage.getItem('SUPABASE_URL') || 'https://tnpdntqxjjksvhsehlvl.supabase.co';
export const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || localStorage.getItem('SUPABASE_ANON_KEY') || 'sb_publishable_OnSBiRPM05DK04DP-a7ysA_dJt2h6Mg';

let clientInstance = null;

function initClient() {
  const url = localStorage.getItem('SUPABASE_URL') || window.SUPABASE_URL || SUPABASE_URL;
  const key = localStorage.getItem('SUPABASE_ANON_KEY') || window.SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;

  if (window.supabase && typeof window.supabase.createClient === 'function') {
    if (url && key && url !== 'YOUR_SUPABASE_PROJECT_URL' && key !== 'YOUR_SUPABASE_PUBLISHABLE_ANON_KEY') {
      clientInstance = window.supabase.createClient(url, key);
      return clientInstance;
    }
  }
  return null;
}

// Initial Client Attempt
initClient();

export function getSupabase() {
  if (!clientInstance) {
    initClient();
  }
  return clientInstance;
}

export function isSupabaseReady() {
  return getSupabase() !== null;
}

export function configureSupabase(url, key) {
  const cleanUrl = url.trim();
  const cleanKey = key.trim();

  localStorage.setItem('SUPABASE_URL', cleanUrl);
  localStorage.setItem('SUPABASE_ANON_KEY', cleanKey);

  if (window.supabase && typeof window.supabase.createClient === 'function') {
    clientInstance = window.supabase.createClient(cleanUrl, cleanKey);
  }
  return clientInstance;
}
