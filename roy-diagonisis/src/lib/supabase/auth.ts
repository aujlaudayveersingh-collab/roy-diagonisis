// =============================================================================
// Session helper for admin routes + server actions.
// Verifies the caller is an authenticated admin (or staff) before any
// privileged read/write. Keeps patient data locked behind real auth.
// =============================================================================
import { createClient } from './server';
import type { AdminRole } from '@/lib/types';

export interface AdminContext {
  userId: string;
  email: string;
  role: AdminRole;
}

/**
 * Resolves the authenticated admin user. Returns null when:
 *  - Supabase isn't configured
 *  - no valid session exists
 *  - the user has no profile row or lacks admin/staff role
 */
export async function requireAdmin(): Promise<AdminContext | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, role')
    .eq('id', user.id)
    .single();

  if (!profile) return null;
  if (profile.role !== 'admin' && profile.role !== 'staff') return null;

  return { userId: profile.id, email: profile.email, role: profile.role as AdminRole };
}

/** Throws a redirect to /admin/login when the caller isn't an admin. */
export async function getAdminOrRedirect(): Promise<AdminContext> {
  const { redirect } = await import('next/navigation');
  const admin = await requireAdmin();
  if (!admin) redirect('/admin/login');
  // redirect() throws, so this line is unreachable when admin is null.
  return admin as AdminContext;
}
