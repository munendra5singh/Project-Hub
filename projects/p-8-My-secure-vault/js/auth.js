/**
 * Authentication Module (Strict Supabase Auth & Profiles)
 * Handles User Registration, Authentication Sessions, Profile Storage, and Logout
 */

import { getSupabase, isSupabaseReady } from './supabase.js';

let currentUser = null;

/**
 * Robust helper: Format input into a valid email address for Supabase Auth
 * - If full email is entered (e.g. "example@gmail.com"), uses it directly.
 * - If plain username is entered (e.g. "monu12345"), converts it to "monu12345@vault.internal".
 */
export function formatAuthEmail(input) {
  if (!input) return '';
  const trimmed = input.trim().toLowerCase();

  // 1. Check if input is already a valid full email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(trimmed)) {
    return trimmed;
  }

  // 2. If input contains '@' but is not a complete domain, sanitize and complete it
  if (trimmed.includes('@')) {
    const parts = trimmed.split('@');
    const cleanUser = parts[0].replace(/[^a-z0-9._-]/g, '');
    const cleanDomain = parts[1] ? parts[1].replace(/[^a-z0-9.-]/g, '') : 'vault.internal';
    return `${cleanUser || 'user'}@${cleanDomain || 'vault.internal'}`;
  }

  // 3. Convert plain username (e.g. "monu12345") -> "monu12345@vault.internal"
  const sanitizedUsername = trimmed.replace(/[^a-z0-9._-]/g, '');
  if (!sanitizedUsername) {
    throw new Error('Please enter a valid username or email address.');
  }

  return `${sanitizedUsername}@vault.internal`;
}

/**
 * Clear UI Error Message Formatter
 */
function handleAuthError(error) {
  if (!error) return 'An unknown authentication error occurred.';

  const message = error.message || '';
  const status = error.status;

  // Rate Limit (HTTP 429)
  if (status === 429 || message.toLowerCase().includes('rate limit')) {
    return 'Too many login/signup attempts. Please wait a few minutes and try again.';
  }

  // Invalid Credentials
  if (message.toLowerCase().includes('invalid login credentials')) {
    return 'Incorrect username or master password. Please try again.';
  }

  // Email Not Confirmed
  if (message.toLowerCase().includes('email not confirmed')) {
    return 'Email not confirmed. Please check your inbox or disable "Confirm email" in Supabase Dashboard.';
  }

  // User Already Exists
  if (message.toLowerCase().includes('already registered') || message.toLowerCase().includes('user_already_exists')) {
    return 'An account with this username or email already exists. Please log in instead.';
  }

  return message;
}

/**
 * Register a new user account in Supabase Auth
 * @param {Object} params - { fullName, username, masterPassword }
 */
export async function registerUser({ fullName, username, masterPassword }) {
  if (!isSupabaseReady()) {
    throw new Error('Supabase cloud database is not connected.');
  }

  const supabase = getSupabase();
  const cleanUsername = username.trim().toLowerCase();
  const email = formatAuthEmail(cleanUsername);

  // 1. Create user account in Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: masterPassword,
    options: {
      data: {
        full_name: fullName.trim(),
        username: cleanUsername
      }
    }
  });

  if (error) {
    console.error('[Auth Error] signUp failed:', error);
    throw new Error(handleAuthError(error));
  }

  if (!data.user) {
    throw new Error('Registration failed to return user session.');
  }

  currentUser = {
    id: data.user.id,
    email: data.user.email,
    fullName: fullName.trim(),
    username: cleanUsername,
    hasSession: Boolean(data.session)
  };

  return currentUser;
}

/**
 * Log in an existing user via Supabase Auth & fetch profile metadata
 * @param {Object} params - { username, masterPassword }
 */
export async function loginUser({ username, masterPassword }) {
  if (!isSupabaseReady()) {
    throw new Error('Supabase cloud database is not connected.');
  }

  const supabase = getSupabase();
  const cleanUsername = username.trim().toLowerCase();
  const email = formatAuthEmail(cleanUsername);

  // 1. Authenticate user session with Supabase Auth (establishes JWT token)
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: masterPassword
  });

  if (error) {
    console.error('[Auth Error] signInWithPassword failed:', error);
    throw new Error(handleAuthError(error));
  }

  if (!data.user) {
    throw new Error('Authentication succeeded but user session is missing.');
  }

  // 2. Fetch user profile from public.profiles using authenticated session
  let fullName = cleanUsername;
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, username')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profile && profile.full_name) {
      fullName = profile.full_name;
    }
  } catch (err) {
    console.warn('[Auth] Profile fetch notice:', err.message);
  }

  const metadata = data.user.user_metadata || {};
  currentUser = {
    id: data.user.id,
    email: data.user.email,
    fullName: fullName || metadata.full_name || cleanUsername,
    username: metadata.username || cleanUsername,
    hasSession: true
  };

  return currentUser;
}

/**
 * Log out current user session
 */
export async function logoutUser() {
  if (isSupabaseReady()) {
    const supabase = getSupabase();
    await supabase.auth.signOut();
  }
  currentUser = null;
}

/**
 * Get current active user
 */
export function getCurrentUser() {
  return currentUser;
}