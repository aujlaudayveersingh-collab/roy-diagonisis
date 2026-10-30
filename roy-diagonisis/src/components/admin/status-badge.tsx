// Booking/enquiry status pill. Shared between dashboard and list views.
import { cn } from '@/lib/utils';

const TONES: Record<string, string> = {
  new: 'badge-info',
  pending: 'badge-warning',
  confirmed: 'badge-success',
  completed: 'badge-neutral',
  cancelled: 'badge-danger',
  in_progress: 'badge-warning',
  resolved: 'badge-success',
};

const LABELS: Record<string, string> = {
  new: 'New',
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  in_progress: 'In progress',
  resolved: 'Resolved',
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn('capitalize', TONES[status] ?? 'badge-neutral')}>
      {LABELS[status] ?? status}
    </span>
  );
}
