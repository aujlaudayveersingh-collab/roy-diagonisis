'use client';

// Sticky site header with desktop nav + mobile drawer.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone, ChevronDown } from 'lucide-react';
import { NAV_LINKS, BUSINESS, whatsappLink, WHATSAPP_DEFAULT_MESSAGE } from '@/lib/constants';
import { LogoMark } from '@/components/ui';
import { cn } from '@/lib/utils';

export function Header({ logoUrl }: { logoUrl?: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the drawer whenever the route changes.
  useEffect(() => setOpen(false), [pathname]);

  // Prevent background scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 transition-all duration-300',
        scrolled ? 'border-b border-slate-100 bg-white/90 shadow-soft backdrop-blur-lg' : 'border-b border-transparent bg-white/70 backdrop-blur'
      )}
    >
      <div className="container-site">
        <div className="flex h-[4.5rem] items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5" aria-label={`${BUSINESS.name} home`}>
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={BUSINESS.name} className="h-10 w-auto rounded-lg" />
            ) : (
              <LogoMark className="h-10 w-10 shrink-0" />
            )}
            <span className="flex flex-col leading-tight">
              <span className="font-display text-lg font-bold tracking-tight text-slate-900">
                Modern <span className="text-brand-600">Diagnostic</span>
              </span>
              <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
                Diagnostic Laboratory
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive(link.href)
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <a
              href={`tel:${BUSINESS.phone.replace(/\s/g, '')}`}
              className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 xl:inline-flex"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              {BUSINESS.phone}
            </a>
            <Link href="/book" className="btn-primary hidden sm:inline-flex">
              Book a Test
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition-colors hover:bg-slate-50 lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        id="mobile-menu"
        className={cn(
          'fixed inset-x-0 top-[4.5rem] z-40 origin-top border-t border-slate-100 bg-white transition-all duration-300 lg:hidden',
          open ? 'visible scale-y-100 opacity-100' : 'invisible -translate-y-2 scale-y-95 opacity-0'
        )}
      >
        <nav className="container-site max-h-[calc(100vh-4.5rem)] overflow-y-auto py-4" aria-label="Mobile">
          <ul className="space-y-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                  className={cn(
                    'flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-medium transition-colors',
                    isActive(link.href) ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-50'
                  )}
                >
                  {link.label}
                  <ChevronDown className="h-4 w-4 -rotate-90 text-slate-300" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 grid gap-2.5 border-t border-slate-100 pt-4">
            <Link href="/book" className="btn-primary w-full">
              Book a Test
            </Link>
            <a
              href={whatsappLink(WHATSAPP_DEFAULT_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp w-full"
            >
              Chat on WhatsApp
            </a>
            <a href={`tel:${BUSINESS.phone.replace(/\s/g, '')}`} className="btn-secondary w-full">
              <Phone className="h-4 w-4" aria-hidden="true" /> {BUSINESS.phone}
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
