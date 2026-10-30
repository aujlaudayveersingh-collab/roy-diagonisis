import type { Metadata } from 'next';
import { AdminShell, AdminHeader } from '@/components/admin/shell';
import { getAdminEnquiries } from '@/lib/admin-data';
import { EnquiryRow } from '@/components/admin/enquiry-controls';
import { EmptyState } from '@/components/ui';
import { MessageSquare } from 'lucide-react';

export const metadata: Metadata = { title: 'Enquiries', robots: { index: false, follow: false } };

export default async function AdminEnquiriesPage() {
  const enquiries = await getAdminEnquiries();

  return (
    <AdminShell>
      <AdminHeader
        title="Enquiries"
        description="Messages submitted through the website contact form."
      />

      <div className="card overflow-hidden">
        {enquiries.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No enquiries yet"
              description="Contact-form submissions will appear here."
              icon={<MessageSquare className="h-7 w-7" aria-hidden="true" />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table min-w-[760px]">
              <thead>
                <tr>
                  <th>From</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Received</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((e) => (
                  <EnquiryRow key={e.id} enquiry={e} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
