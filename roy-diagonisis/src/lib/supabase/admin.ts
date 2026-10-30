// Admin (service-role) client — SERVER ONLY. Never import from client code.
// Used exclusively for privileged admin operations where the user has already
// been authenticated and authorised (e.g. creating the first admin user).
import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

/**
 * Creates a service-role client. Returns null when the key is absent so the
 * app degrades gracefully rather than exposing errors. NEVER expose this key
 * to the browser.
 */
export function createAdminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !SERVICE_ROLE_KEY) return null;

  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
