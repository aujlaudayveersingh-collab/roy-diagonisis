'use client';

// Client-side interactive controls for the bookings table:
// search/filter form, status change, internal notes and delete-with-confirm.
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Trash2, StickyNote, Loader2, ChevronDown } from 'lucide-react';
import type { Booking } from '@/lib/types';
import { formatDateTime, cn } from '@/lib/utils';
import { updateBookingStatus, updateBookingNotes, deleteBooking } from '@/actions/admin';
import StatusBadge from '@/components/admin/status-badge';

const STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function BookingFiltersBar({
  initial,
}: {
  initial: { q?: string; status?: string; centre?: string; dateFrom?: string; dateTo?: string };
}) {
  const router = useRouter();
  const [q, setQ] = useState(initial.q ?? '');
  const [status, setStatus] = useState(initial.status ?? '');
  const [centre, setCentre] = useState(initial.centre ?? '');
  const [dateFrom, setDateFrom] = useState(initial.dateFrom ?? '');
  const [dateTo, setDateTo] = useState(initial.dateTo ?? '');

  const apply = (next: { q?: string; status?: string; centre?: string; dateFrom?: string; dateTo?: string }) => {
    const params = new URLSearchParams();
    if (next.q) params.set('q', next.q);
    if (next.status) params.set('status', next.status);
    if (next.centre) params.set('centre', next.centre);
    if (next.dateFrom) params.set('dateFrom', next.dateFrom);
    if (next.dateTo) params.set('dateTo', next.dateTo);
    const qs = params.toString();
    router.push(`/admin/bookings${qs ? `?${qs}` : ''}`);
  };

  const hasFilters = !!(q || status || centre || dateFrom || dateTo);

  return (
    <div className="card mb-5 p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          apply({ q, status, centre, dateFrom, dateTo });
        }}
        className="grid gap-3 md:grid-cols-2 lg:grid-cols-5"
      >
        <div className="relative lg:col-span-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, phone, ID…"
            aria-label="Search bookings"
            className="field pl-10"
          />
        </div>

        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status" className="field">
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <select value={centre} onChange={(e) => setCentre(e.target.value)} aria-label="Filter by centre" className="field">
          <option value="">All centres</option>
          <option value="dhekiajuli">Dhekiajuli</option>
          <option value="sirajuli">Sirajuli</option>
        </select>

        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} aria-label="From date" className="field" />
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} aria-label="To date" className="field" />

        <div className="flex gap-2 lg:col-span-5">
          <button type="submit" className="btn-primary btn-sm">
            <Search className="h-4 w-4" aria-hidden="true" /> Apply filters
          </button>
          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setQ(''); setStatus(''); setCentre(''); setDateFrom(''); setDateTo('');
                apply({ q: '', status: '', centre: '', dateFrom: '', dateTo: '' });
              }}
              className="btn-secondary btn-sm"
            >
              <X className="h-4 w-4" aria-hidden="true" /> Clear
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

/** Expandable booking row with status/notes/delete controls. */
export function BookingRow({ booking }: { booking: Booking }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(booking.internal_notes ?? '');
  const [isPending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);

  const setStatus = (status: string) => {
    startTransition(async () => {
      await updateBookingStatus(booking.id, status);
      router.refresh();
    });
  };

  const saveNotes = () => {
    startTransition(async () => {
      await updateBookingNotes(booking.id, notes);
      router.refresh();
    });
  };

  const remove = async () => {
    if (!window.confirm(`Permanently delete booking ${booking.booking_id} for ${booking.patient_name}? This cannot be undone.`)) return;
    setBusy(true);
    await deleteBooking(booking.id);
    setBusy(false);
    router.refresh();
  };

  return (
    <>
      <tr>
        <td>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="flex items-center gap-2 font-mono text-xs font-semibold text-brand-700 hover:underline"
          >
            <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} aria-hidden="true" />
            {booking.booking_id}
          </button>
        </td>
        <td>
          <p className="font-medium text-slate-900">{booking.patient_name}</p>
          <p className="text-xs text-slate-500">{booking.phone}</p>
          {booking.email && <p className="text-xs text-slate-400">{booking.email}</p>}
        </td>
        <td className="capitalize">{booking.centre_id}</td>
        <td>
          <span className={cn('badge', booking.collection_type === 'home_collection' ? 'badge-warning' : 'badge-info')}>
            {booking.collection_type === 'home_collection' ? 'Home' : 'Centre'}
          </span>
        </td>
        <td>
          <select
            value={booking.status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={isPending}
            aria-label={`Status for ${booking.booking_id}`}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium capitalize focus:border-brand-400 focus:outline-none"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </td>
        <td className="whitespace-nowrap text-xs text-slate-500">{formatDateTime(booking.created_at)}</td>
        <td>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="btn-ghost btn-sm"
              aria-label="Toggle details"
            >
              <StickyNote className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={remove}
              disabled={busy}
              className="btn-ghost btn-sm text-red-600 hover:bg-red-50 hover:text-red-700"
              aria-label="Delete booking"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </button>
          </div>
        </td>
      </tr>

      {expanded && (
        <tr className="bg-slate-50/60">
          <td colSpan={7} className="px-5 py-5">
            <div className="grid gap-5 lg:grid-cols-2">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Booking details</h4>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between gap-4"><dt className="text-slate-500">Tests / package</dt><dd className="text-right font-medium text-slate-800">{booking.test_names || '—'}</dd></div>
                  {booking.package_name && (
                    <div className="flex justify-between gap-4"><dt className="text-slate-500">Package</dt><dd className="text-right font-medium text-slate-800">{booking.package_name}</dd></div>
                  )}
                  <div className="flex justify-between gap-4"><dt className="text-slate-500">Preferred date</dt><dd className="text-right font-medium text-slate-800">{booking.preferred_date || '—'}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-slate-500">Preferred time</dt><dd className="text-right font-medium text-slate-800">{booking.preferred_time || '—'}</dd></div>
                  {booking.address && (
                    <div className="flex justify-between gap-4"><dt className="text-slate-500">Address</dt><dd className="text-right font-medium text-slate-800">{booking.address}</dd></div>
                  )}
                  {booking.message && (
                    <div className="flex justify-between gap-4"><dt className="text-slate-500">Message</dt><dd className="text-right font-medium text-slate-800">{booking.message}</dd></div>
                  )}
                </dl>

                <a
                  href={`https://wa.me/${booking.phone.replace(/\D/g, '').replace(/^(?!91)/, '91')}?text=${encodeURIComponent(`Hello ${booking.patient_name}, this is regarding your booking ${booking.booking_id} with Modern Diagnostic.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp btn-sm mt-4"
                >
                  Contact patient on WhatsApp
                </a>
              </div>

              <div>
                <label htmlFor={`notes-${booking.id}`} className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Internal notes (staff only)
                </label>
                <textarea
                  id={`notes-${booking.id}`}
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add a private note — never shown to the patient."
                  className="field mt-2"
                />
                <div className="mt-2 flex items-center gap-2">
                  <button type="button" onClick={saveNotes} disabled={isPending} className="btn-primary btn-sm">
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null} Save note
                  </button>
                  <StatusBadge status={booking.status} />
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
