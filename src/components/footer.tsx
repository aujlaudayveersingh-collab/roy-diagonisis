import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, FlaskConical } from 'lucide-react';
import { BUSINESS, CENTRES, NAV_LINKS, whatsappLink, WHATSAPP_DEFAULT_MESSAGE } from '@/lib/constants';
import { LogoMark } from '@/components/ui';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-100 bg-slate-50/60">
      <div className="container-site section-tight">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2.5">
              <LogoMark className="h-11 w-11" />
              <div className="leading-tight">
                <p className="font-display text-lg font-bold text-slate-900">
                  Modern <span className="text-brand-600">Diagnostic</span>
                </p>
                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
                  Diagnostic Laboratory
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600">
              Reliable diagnostic services for families in Dhekiajuli, Sirajuli and nearby
              communities — with careful sample collection, clear reports and the convenience of
              home collection.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Link href="/book" className="btn-primary btn-sm">
                Book a Test
              </Link>
              <a
                href={whatsappLink(WHATSAPP_DEFAULT_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp btn-sm"
              >
                WhatsApp Us
              </a>
            </div>
          </div>

          {/* Quick links */}
          <nav className="lg:col-span-2" aria-label="Footer">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900">Explore</h3>
            <ul className="mt-4 space-y-2.5">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-slate-600 transition-colors hover:text-brand-700">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Centres */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900">Our Centres</h3>
            <ul className="mt-4 space-y-4">
              {CENTRES.map((c) => (
                <li key={c.id} className="text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">{c.name}</p>
                  <p className="mt-1 flex gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" aria-hidden="true" />
                    <span className="leading-relaxed">{c.address}</span>
                  </p>
                  <a
                    href={c.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 inline-flex items-center gap-1 font-medium text-brand-600 hover:text-brand-700"
                  >
                    Get directions →
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900">Contact</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li className="flex gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" aria-hidden="true" />
                <a href={`tel:${BUSINESS.phone.replace(/\s/g, '')}`} className="font-medium text-slate-900 hover:text-brand-700">
                  {BUSINESS.phone}
                </a>
              </li>
              <li className="flex gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" aria-hidden="true" />
                <a href={`mailto:${BUSINESS.email}`} className="break-all hover:text-brand-700">
                  {BUSINESS.email}
                </a>
              </li>
              <li className="flex gap-2.5">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" aria-hidden="true" />
                <span>{BUSINESS.hours}</span>
              </li>
              <li className="flex gap-2.5">
                <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" aria-hidden="true" />
                <span>Owner: {BUSINESS.owner}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>
            © {year} {BUSINESS.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/contact" className="hover:text-brand-700">
              Contact
            </Link>
            <span aria-hidden="true">·</span>
            <Link href="/admin/login" className="hover:text-brand-700">
              Admin Login
            </Link>
          </div>
        </div>
        <p className="mx-auto mt-6 max-w-3xl text-center text-[11px] leading-relaxed text-slate-400">
          Information on this website is for general guidance only and does not replace a doctor's
          advice. Test availability, pricing and report times are confirmed by the laboratory at the
          time of booking.
        </p>
      </div>
    </footer>
  );
}
