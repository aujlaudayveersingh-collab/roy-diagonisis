import type { Metadata } from 'next';
import { AdminShell, AdminHeader } from '@/components/admin/shell';
import { getAdminPackages } from '@/lib/admin-data';
import { PackageManager } from '@/components/admin/package-manager';

export const metadata: Metadata = { title: 'Packages', robots: { index: false, follow: false } };

export default async function AdminPackagesPage() {
  const packages = await getAdminPackages();

  return (
    <AdminShell>
      <AdminHeader
        title="Health Packages"
        description="Create and manage health checkup packages. Only published packages appear on the public website."
      />
      <PackageManager packages={packages} />
    </AdminShell>
  );
}
