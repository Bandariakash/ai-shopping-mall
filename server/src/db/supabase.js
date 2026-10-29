const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('⚠️  SUPABASE_URL or SUPABASE_ANON_KEY not set. Supabase client unavailable.');
}

/**
 * Public client — respects Row Level Security (RLS).
 * Use for operations that should be scoped to the authenticated user.
 */
const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,   // server-side: no browser session
        autoRefreshToken: false,
      },
    })
  : null;

/**
 * Admin / service-role client — bypasses RLS.
 * Use ONLY in trusted server-side code (never expose to frontend).
 * Needed for: schema setup, seeding, cross-user admin operations.
 */
const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

/**
 * Build a Supabase client authenticated as a specific JWT user.
 * Pass the Bearer token from the request header.
 * @param {string} accessToken - JWT from Authorization header
 */
function supabaseForUser(accessToken) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

module.exports = { supabase, supabaseAdmin, supabaseForUser };

