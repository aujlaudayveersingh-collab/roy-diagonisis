// Authenticated admin shell — sidebar + main. Used by every admin page.
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/supabase/auth';
import { AdminNav } from '@/components/admin/nav';

export async function AdminShell({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  if (!admin) redirect('/admin/login');

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav email={admin.email} role={admin.role} />
      <div className="lg:pl-64">
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

/** Consistent page header inside the admin. */
export function AdminHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {action && <div className="flex flex-wrap gap-2">{action}</div>}
    </div>
  );
}
