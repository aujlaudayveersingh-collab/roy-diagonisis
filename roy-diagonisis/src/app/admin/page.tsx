import type { Metadata } from 'next';
import Link from 'next/link';
import {
  CalendarCheck, TestTubes, Package, MessageSquare, TrendingUp, CheckCircle2,
  Clock, AlertCircle, ArrowRight,
} from 'lucide-react';
import { AdminShell, AdminHeader } from '@/components/admin/shell';
import { StatCard, QuickActions } from '@/components/admin/nav';
import { getDashboardStats, getRecentBookings } from '@/lib/admin-data';
import { isSupabaseConfigured, SUPABASE_NOT_CONFIGURED_MESSAGE } from '@/lib/supabase/env';
import { formatDateTime, cn } from '@/lib/utils';
import LinkStatusBadge from '@/components/admin/status-badge';

export const metadata: Metadata = { title: 'Dashboard', robots: { index: false, follow: false } };

export default async function AdminDashboardPage() {
  const [stats, recent] = await Promise.all([getDashboardStats(), getRecentBookings(8)]);

  return (
    <AdminShell>
      <AdminHeader
        title="Dashboard"
        description="Overview of bookings, enquiries and catalogue."
        action={
          <Link href="/admin/bookings" className="btn-primary btn-sm">
            View all bookings <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        }
      />

      {!isSupabaseConfigured() && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
          <p className="font-semibold">Supabase is not configured.</p>
          <p className="mt-1">{SUPABASE_NOT_CONFIGURED_MESSAGE}</p>
          <p className="mt-2">
            See the project <code className="rounded bg-amber-100 px-1.5 py-0.5">README.md</code> for
            the full setup guide.
          </p>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total bookings" value={stats?.totalBookings ?? 0} icon={CalendarCheck} tone="brand" />
        <StatCard label="New inquiries" value={(stats?.newBookings ?? 0) + (stats?.newEnquiries ?? 0)} icon={AlertCircle} tone="amber" sub={`${stats?.newBookings ?? 0} bookings · ${stats?.newEnquiries ?? 0} messages`} />
        <StatCard label="Pending" value={stats?.pendingBookings ?? 0} icon={Clock} tone="slate" />
        <StatCard label="Confirmed" value={stats?.confirmedBookings ?? 0} icon={CheckCircle2} tone="emerald" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Completed" value={stats?.completedBookings ?? 0} icon={TrendingUp} tone="teal" />
        <StatCard label="Total tests" value={stats?.totalTests ?? 0} icon={TestTubes} tone="brand" sub={`${stats?.activeTests ?? 0} active`} />
        <StatCard label="Active packages" value={stats?.activePackages ?? 0} icon={Package} tone="teal" />
        <StatCard label="Total enquiries" value={stats?.totalEnquiries ?? 0} icon={MessageSquare} tone="slate" sub={`${stats?.newEnquiries ?? 0} unread`} />
      </div>

      {/* Recent bookings */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-slate-900">Recent inquiries</h2>
          <Link href="/admin/bookings" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            View all →
          </Link>
        </div>

        <div className="card overflow-hidden">
          {recent.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              No bookings yet. New booking requests will appear here instantly.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="admin-table min-w-[640px]">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Patient</th>
                    <th>Centre</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Received</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((b) => (
                    <tr key={b.id}>
                      <td className="font-mono text-xs font-semibold text-brand-700">{b.booking_id}</td>
                      <td>
                        <p className="font-medium text-slate-900">{b.patient_name}</p>
                        <p className="text-xs text-slate-500">{b.phone}</p>
                      </td>
                      <td className="capitalize">{b.centre_id}</td>
                      <td>
                        <span className={cn('badge', b.collection_type === 'home_collection' ? 'badge-warning' : 'badge-info')}>
                          {b.collection_type === 'home_collection' ? 'Home' : 'Centre'}
                        </span>
                      </td>
                      <td><LinkStatusBadge status={b.status} /></td>
                      <td className="text-xs text-slate-500">{formatDateTime(b.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 font-display text-lg font-bold text-slate-900">Quick actions</h2>
        <QuickActions />
      </div>
    </AdminShell>
  );
}
