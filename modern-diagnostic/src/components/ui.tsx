// Small presentational primitives shared across the site.
import { cn } from '@/lib/utils';
import {
  Droplets, Activity, Zap, Gauge, HeartPulse, Droplet, Heart, ClipboardList,
  TestTubes, Microscope, FlaskConical, Stethoscope, Scan, Dna, Syringe, type LucideIcon,
} from 'lucide-react';

/** Brand logo mark — a stylised cross + pulse inside a rounded gradient tile. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" className={cn('h-10 w-10', className)}>
      <rect width="40" height="40" rx="11" fill="url(#md-grad)" />
      <path d="M20 9.5v21M9.5 20h21" stroke="#fff" strokeWidth="4.4" strokeLinecap="round" />
      <path
        d="M6 25.5h5.2l2.1-4.6 3.1 8.2 2.6-6.1 1.6 2.5H34"
        stroke="#9BE8DC"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.95"
      />
      <defs>
        <linearGradient id="md-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0C63E0" />
          <stop offset="1" stopColor="#14B8A6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Icon resolver — maps the DB `icon` key to a lucide icon. */
const ICON_MAP: Record<string, LucideIcon> = {
  Droplets, Activity, Zap, Gauge, HeartPulse, Droplet, Heart, ClipboardList,
  TestTubes, Microscope, FlaskConical, Stethoscope, Scan, Dna, Syringe,
};

export function CategoryIcon({ name, className }: { name?: string | null; className?: string }) {
  const Icon = (name && ICON_MAP[name]) || TestTubes;
  return <Icon className={className ?? 'h-6 w-6'} aria-hidden="true" />;
}

/** Section heading with optional centred layout. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  id,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  align?: 'center' | 'left';
  id?: string;
}) {
  return (
    <div className={cn('max-w-3xl', align === 'center' ? 'mx-auto text-center' : 'text-left')}>
      {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
      <h2 id={id} className="heading-lg">
        {title}
      </h2>
      {description && <p className="lede mt-4">{description}</p>}
    </div>
  );
}

/** Star rating (read-only) used for testimonials. */
export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <div className={cn('flex items-center gap-0.5', className)} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          aria-hidden="true"
          className={cn('h-4 w-4', i <= rating ? 'text-amber-400' : 'text-slate-200')}
          fill="currentColor"
        >
          <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 15l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
        </svg>
      ))}
    </div>
  );
}

/** Responsive image with rounded corners, lazy loading and graceful fallback. */
export function ImageBox({
  src,
  alt,
  className,
  imgClassName,
  ratio = 'aspect-[4/3]',
  priority = false,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  imgClassName?: string;
  ratio?: string;
  priority?: boolean;
}) {
  if (!src) {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-50 to-teal-50 ring-1 ring-inset ring-slate-100',
          ratio,
          className
        )}
      >
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="absolute inset-0 grid place-items-center">
          <FlaskConical className="h-12 w-12 text-brand-200" aria-hidden="true" />
        </div>
      </div>
    );
  }
  return (
    <div className={cn('relative overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-inset ring-slate-100', ratio, className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={cn('h-full w-full object-cover', imgClassName)}
      />
    </div>
  );
}

/** Consistent empty-state block. */
export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
        {icon ?? <TestTubes className="h-7 w-7" aria-hidden="true" />}
      </div>
      <h3 className="heading-md">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
