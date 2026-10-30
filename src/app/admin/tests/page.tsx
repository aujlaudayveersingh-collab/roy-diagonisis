import type { Metadata } from 'next';
import { AdminShell, AdminHeader } from '@/components/admin/shell';
import { getAdminTests, getAdminCategories } from '@/lib/admin-data';
import { TestManager } from '@/components/admin/test-manager';

export const metadata: Metadata = { title: 'Tests & Categories', robots: { index: false, follow: false } };

export default async function AdminTestsPage() {
  const [tests, categories] = await Promise.all([getAdminTests(), getAdminCategories()]);

  return (
    <AdminShell>
      <AdminHeader
        title="Tests & Categories"
        description="Add, edit, price and publish tests. Disable a test to hide it from the public catalogue without deleting it."
      />
      <TestManager tests={tests} categories={categories} />
    </AdminShell>
  );
}
