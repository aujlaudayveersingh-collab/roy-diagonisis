// =============================================================================
// Supabase environment helpers.
// Centralises "is Supabase configured?" so the public site can gracefully fall
// back to bundled content when env vars are missing (e.g. first local run),
// while the admin panel clearly asks for configuration instead of crashing.
// =============================================================================

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** True when both public Supabase env vars are present. */
export function isSupabaseConfigured(): boolean {
  return SUPABASE_URL.startsWith('http') && SUPABASE_ANON_KEY.length > 20;
}

/** Guard message used across admin screens when Supabase isn't wired up. */
export const SUPABASE_NOT_CONFIGURED_MESSAGE =
  'Supabase is not configured. Copy .env.example to .env.local and add your project URL and anon key, then restart the dev server.';
