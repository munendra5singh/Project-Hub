/**
 * Supabase Client Configuration Module
 * 
 * Supports dynamic configuration via localStorage or hardcoded parameters.
 */

let SUPABASE_URL = window.SUPABASE_URL || localStorage.getItem('SUPABASE_URL') || 'YOUR_SUPABASE_PROJECT_URL';
let SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || localStorage.getItem('SUPABASE_ANON_KEY') || 'YOUR_SUPABASE_ANON_KEY';

let supabase = null;

function initClient() {
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    if (SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL !== 'YOUR_SUPABASE_PROJECT_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY') {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      return true;
    }
  }
  return false;
}

// Initial attempt
initClient();

export function getSupabaseClient() {
  if (!supabase) {
    initClient();
  }
  return supabase;
}

export function isSupabaseConfigured() {
  const url = localStorage.getItem('SUPABASE_URL') || window.SUPABASE_URL || SUPABASE_URL;
  const key = localStorage.getItem('SUPABASE_ANON_KEY') || window.SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;
  return Boolean(url && key && url !== 'YOUR_SUPABASE_PROJECT_URL' && key !== 'YOUR_SUPABASE_ANON_KEY');
}

export function setSupabaseCredentials(url, key) {
  const cleanUrl = url.trim();
  const cleanKey = key.trim();
  
  localStorage.setItem('SUPABASE_URL', cleanUrl);
  localStorage.setItem('SUPABASE_ANON_KEY', cleanKey);
  
  SUPABASE_URL = cleanUrl;
  SUPABASE_ANON_KEY = cleanKey;
  
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    supabase = window.supabase.createClient(cleanUrl, cleanKey);
  }
  return supabase;
}

export function getSavedSupabaseConfig() {
  return {
    url: localStorage.getItem('SUPABASE_URL') || (SUPABASE_URL !== 'YOUR_SUPABASE_PROJECT_URL' ? SUPABASE_URL : ''),
    key: localStorage.getItem('SUPABASE_ANON_KEY') || (SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY' ? SUPABASE_ANON_KEY : '')
  };
}
