'use client';

// Admin sidebar + top bar shell.
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, CalendarCheck, TestTubes, Package, MessageSquare, Star,
  Settings, LogOut, Menu, X, Home, Building2, Phone,
} from 'lucide-react';
import { LogoMark } from '@/components/ui';
import { cn } from '@/lib/utils';
import { signOut } from '@/actions/admin';

/** Derives a friendly display label from the account email (e.g.
 *  "roylab123@moderndiagnostic.com" → "ROYLAB123"). */
function displayLabel(email: string): string {
  const local = email.split('@')[0] ?? email;
  return local.toUpperCase();
}

const NAV = [
  { section: 'Overview', items: [{ label: 'Dashboard', href: '/admin', icon: LayoutDashboard }] },
  {
    section: 'Operations',
    items: [
      { label: 'Bookings', href: '/admin/bookings', icon: CalendarCheck },
      { label: 'Enquiries', href: '/admin/enquiries', icon: MessageSquare },
    ],
  },
  {
    section: 'Catalogue',
    items: [
      { label: 'Tests & Categories', href: '/admin/tests', icon: TestTubes },
      { label: 'Packages', href: '/admin/packages', icon: Package },
    ],
  },
  {
    section: 'Website',
    items: [
      { label: 'Content', href: '/admin/content', icon: Settings },
      { label: 'Testimonials', href: '/admin/testimonials', icon: Star },
    ],
  },
];

export function AdminNav({ email, role }: { email: string; role: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  const nav = (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5" aria-label="Admin">
      {NAV.map((group) => (
        <div key={group.section}>
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            {group.section}
          </p>
          <ul className="mt-2 space-y-1">
            {group.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive(item.href)
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  <item.icon className="h-4.5 w-4.5" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );

  const footer = (
    <div className="border-t border-slate-100 p-4">
      <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">
          {displayLabel(email).charAt(0)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">{displayLabel(email)}</p>
          <p className="text-xs capitalize text-slate-500">{role}</p>
        </div>
      </div>
      <div className="mt-3 grid gap-2">
        <Link href="/" className="btn-secondary btn-sm">
          <Home className="h-3.5 w-3.5" aria-hidden="true" /> View website
        </Link>
        <form action={signOut}>
          <button type="submit" className="btn-ghost btn-sm w-full text-red-600 hover:bg-red-50 hover:text-red-700">
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" /> Sign out
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Top bar (mobile) */}
      <div className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2.5">
          <LogoMark className="h-9 w-9" />
          <div className="leading-tight">
            <p className="font-display text-sm font-bold text-slate-900">Admin Panel</p>
            <p className="text-[10px] uppercase tracking-wider text-slate-400">Modern Diagnostic</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close menu overlay"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-slate-900/40"
          />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white shadow-2xl">
            <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-4">
              <LogoMark className="h-9 w-9" />
              <div className="leading-tight">
                <p className="font-display text-sm font-bold text-slate-900">Admin Panel</p>
                <p className="text-[10px] uppercase tracking-wider text-slate-400">Modern Diagnostic</p>
              </div>
            </div>
            {nav}
            {footer}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-5">
          <LogoMark className="h-10 w-10" />
          <div className="leading-tight">
            <p className="font-display text-base font-bold text-slate-900">Admin Panel</p>
            <p className="text-[10px] uppercase tracking-wider text-slate-400">Modern Diagnostic</p>
          </div>
        </div>
        {nav}
        {footer}
      </aside>
    </>
  );
}

/** Small stat card used on the dashboard. */
export function StatCard({
  label,
  value,
  icon,
  tone = 'brand',
  sub,
}: {
  label: string;
  value: string | number;
  // NOTE: must be a rendered element (<CalendarCheck className="…" />), NOT a
  // component reference — server components cannot pass functions across the
  // RSC boundary ("Functions cannot be passed directly to Client Components").
  icon: React.ReactNode;
  tone?: 'brand' | 'teal' | 'amber' | 'emerald' | 'slate' | 'red';
  sub?: string;
}) {
  const tones: Record<string, string> = {
    brand: 'from-brand-500 to-brand-600',
    teal: 'from-teal-500 to-teal-600',
    amber: 'from-amber-400 to-amber-500',
    emerald: 'from-emerald-500 to-emerald-600',
    slate: 'from-slate-500 to-slate-600',
    red: 'from-red-500 to-red-600',
  };
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
          <p className="mt-2 font-display text-3xl font-bold text-slate-900">{value}</p>
          {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
        </div>
        <span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white', tones[tone])}>
          {icon}
        </span>
      </div>
    </div>
  );
}

/** Reusable confirmation button (client-side confirm before destructive act). */
export function ConfirmButton({
  action,
  confirmMessage,
  children,
  className,
}: {
  action: () => Promise<void>;
  confirmMessage: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={async () => {
        if (window.confirm(confirmMessage)) await action();
      }}
      className={cn('btn-ghost btn-sm text-red-600 hover:bg-red-50 hover:text-red-700', className)}
    >
      {children}
    </button>
  );
}

/** Quick-action icon links on the dashboard. */
export function QuickActions() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {[
        { label: 'View bookings', href: '/admin/bookings', icon: CalendarCheck },
        { label: 'Add a test', href: '/admin/tests', icon: TestTubes },
        { label: 'Manage content', href: '/admin/content', icon: Settings },
        { label: 'Contact settings', href: '/admin/content#contact', icon: Phone },
      ].map((a) => (
        <Link key={a.href} href={a.href} className="card card-hover flex items-center gap-3 p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
            <a.icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold text-slate-800">{a.label}</span>
        </Link>
      ))}
    </div>
  );
}

export { Building2 };
