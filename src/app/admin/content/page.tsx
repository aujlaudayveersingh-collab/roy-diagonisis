import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AdminHeader } from '@/components/admin/shell';
import { requireAdmin } from '@/lib/supabase/auth';
import { getSettings } from '@/lib/data';
import { AdminNav } from '@/components/admin/nav';
import { ContentEditor } from '@/components/admin/content-editor';

export const metadata: Metadata = { title: 'Content', robots: { index: false, follow: false } };

export default async function AdminContentPage() {
  const admin = await requireAdmin();
  if (!admin) redirect('/admin/login');

  const settings = await getSettings();

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav email={admin.email} role={admin.role} />
      <div className="lg:pl-64">
        <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <AdminHeader
            title="Website Content"
            description="Edit the public website copy, branding, contact details and centre addresses. Changes go live as soon as you save."
          />
          <ContentEditor settings={settings} />
        </main>
      </div>
    </div>
  );
}
