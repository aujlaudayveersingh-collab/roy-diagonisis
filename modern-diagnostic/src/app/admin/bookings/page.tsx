import type { Metadata } from 'next';
import { AdminShell, AdminHeader } from '@/components/admin/shell';
import { getAdminBookings } from '@/lib/admin-data';
import { BookingFiltersBar, BookingRow } from '@/components/admin/booking-controls';
import { EmptyState } from '@/components/ui';
import { CalendarCheck } from 'lucide-react';

export const metadata: Metadata = { title: 'Manage Bookings', robots: { index: false, follow: false } };

interface SearchParams {
  q?: string;
  status?: string;
  centre?: string;
  dateFrom?: string;
  dateTo?: string;
}

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const bookings = await getAdminBookings(sp);

  return (
    <AdminShell>
      <AdminHeader
        title="Bookings"
        description="All appointment and test requests. Search, filter, update status and add internal notes."
      />

      <BookingFiltersBar initial={sp} />

      <div className="card overflow-hidden">
        {bookings.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No bookings found"
              description="Adjust your filters, or new bookings will appear here as they are submitted."
              icon={<CalendarCheck className="h-7 w-7" aria-hidden="true" />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table min-w-[900px]">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Patient</th>
                  <th>Centre</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Received</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <BookingRow key={b.id} booking={b} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-slate-400">
        {bookings.length} booking{bookings.length !== 1 && 's'} shown. Patient data is visible only to
        authorised staff and is never exposed publicly.
      </p>
    </AdminShell>
  );
}
