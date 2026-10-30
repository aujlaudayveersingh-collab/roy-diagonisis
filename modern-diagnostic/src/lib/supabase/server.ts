// Server-side Supabase clients (Server Components, Server Actions, Route Handlers).
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './env';

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Cookie-aware server client. Returns null when Supabase isn't configured so
 * callers can fall back to bundled content instead of throwing.
 */
export async function createClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;

  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component — middleware refreshes sessions.
        }
      },
    },
  });
}

/**
 * Returns the authenticated user's session token (if any) for making
 * authenticated fetches from Server Actions.
 */
export async function getSessionToken(): Promise<string | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}
