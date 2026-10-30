import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AdminHeader } from '@/components/admin/shell';
import { requireAdmin } from '@/lib/supabase/auth';
import { getAdminTestimonials } from '@/lib/admin-data';
import { AdminNav } from '@/components/admin/nav';
import { TestimonialManager } from '@/components/admin/testimonial-manager';

export const metadata: Metadata = { title: 'Testimonials', robots: { index: false, follow: false } };

export default async function AdminTestimonialsPage() {
  const admin = await requireAdmin();
  if (!admin) redirect('/admin/login');

  const items = await getAdminTestimonials();

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav email={admin.email} role={admin.role} />
      <div className="lg:pl-64">
        <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <AdminHeader
            title="Testimonials"
            description="Manage patient reviews. Only testimonials marked visible are shown on the public website."
          />
          <TestimonialManager items={items} />
        </main>
      </div>
    </div>
  );
}
