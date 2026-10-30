'use client';

// Enquiries management: status changes + delete.
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2, Mail, Phone } from 'lucide-react';
import type { Enquiry } from '@/lib/types';
import { formatDateTime, cn } from '@/lib/utils';
import { updateEnquiryStatus, deleteEnquiry } from '@/actions/admin';
import StatusBadge from '@/components/admin/status-badge';

const STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
];

export function EnquiryRow({ enquiry }: { enquiry: Enquiry }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

  const setStatus = (status: string) =>
    startTransition(async () => {
      await updateEnquiryStatus(enquiry.id, status);
      router.refresh();
    });

  const remove = async () => {
    if (!window.confirm(`Permanently delete the enquiry from ${enquiry.name}? This cannot be undone.`)) return;
    setBusy(true);
    await deleteEnquiry(enquiry.id);
    setBusy(false);
    router.refresh();
  };

  return (
    <>
      <tr>
        <td>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="font-medium text-slate-900 hover:text-brand-700 hover:underline"
            aria-expanded={open}
          >
            {enquiry.name}
          </button>
          <p className="text-xs text-slate-500">{enquiry.phone}</p>
        </td>
        <td className="max-w-[220px] truncate text-sm text-slate-600">{enquiry.subject || '—'}</td>
        <td>
          <select
            value={enquiry.status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={isPending}
            aria-label={`Status for enquiry from ${enquiry.name}`}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium focus:border-brand-400 focus:outline-none"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </td>
        <td className="whitespace-nowrap text-xs text-slate-500">{formatDateTime(enquiry.created_at)}</td>
        <td>
          <div className="flex items-center gap-1">
            <a href={`tel:${enquiry.phone.replace(/\s/g, '')}`} className="btn-ghost btn-sm" aria-label="Call">
              <Phone className="h-4 w-4" aria-hidden="true" />
            </a>
            {enquiry.email && (
              <a href={`mailto:${enquiry.email}`} className="btn-ghost btn-sm" aria-label="Email">
                <Mail className="h-4 w-4" aria-hidden="true" />
              </a>
            )}
            <button
              type="button"
              onClick={remove}
              disabled={busy}
              className="btn-ghost btn-sm text-red-600 hover:bg-red-50 hover:text-red-700"
              aria-label="Delete enquiry"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </button>
          </div>
        </td>
      </tr>

      {open && (
        <tr className="bg-slate-50/60">
          <td colSpan={5} className="px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Message</p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{enquiry.message}</p>
            {enquiry.email && (
              <p className="mt-3 text-xs text-slate-500">
                Email: <a className="font-medium text-brand-600" href={`mailto:${enquiry.email}`}>{enquiry.email}</a>
              </p>
            )}
            <div className="mt-3">
              <StatusBadge status={enquiry.status} />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export { cn };
