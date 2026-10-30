import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/supabase/auth';
import { AdminLoginForm } from '@/components/admin/login-form';

export const metadata: Metadata = {
  title: 'Admin Sign In',
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  // Already signed in? Go straight to the dashboard.
  const admin = await requireAdmin();
  if (admin) redirect('/admin');

  return <AdminLoginForm />;
}
