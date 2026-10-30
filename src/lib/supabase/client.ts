// Browser Supabase client (anon key only — protected by Row Level Security).
'use client';

import { createBrowserClient } from '@supabase/ssr';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './env';

/**
 * Returns a browser client, or null when Supabase isn't configured.
 * Components must handle the null case (public site falls back to defaults).
 */
export function createClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
