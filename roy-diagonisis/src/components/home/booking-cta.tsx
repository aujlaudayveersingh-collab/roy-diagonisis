// Compact "quick booking" card used inside the home page CTA section.
// Collects minimal details and deep-links into the full booking flow via
// WhatsApp so nothing is lost.
import Link from 'next/link';
import { CalendarCheck, MessageCircle } from 'lucide-react';
import { CENTRES, whatsappLink } from '@/lib/constants';

export function BookingFormCTA() {
  return (
    <div className="relative mx-auto w-full max-w-md animate-fade-up">
      <div className="rounded-3xl bg-white p-6 shadow-lift sm:p-7">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <CalendarCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="font-display text-lg font-bold text-slate-900">Quick enquiry</h3>
            <p className="text-xs text-slate-500">We'll call you back to confirm</p>
          </div>
        </div>

        <ul className="mt-5 space-y-3">
          {[
            { title: 'Choose centre', body: `Dhekiajuli or Sirajuli — whichever is closer.` },
            { title: 'Pick tests or a package', body: 'Or let our team help you decide.' },
            { title: 'Home collection available', body: 'Sample collected at your doorstep.' },
          ].map((s, i) => (
            <li key={s.title} className="flex gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-teal-50 text-xs font-bold text-teal-700">
                {i + 1}
              </span>
              <span>
                <span className="block text-sm font-semibold text-slate-900">{s.title}</span>
                <span className="text-xs text-slate-500">{s.body}</span>
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-6 grid gap-2.5">
          <Link href="/book" className="btn-primary w-full">
            <CalendarCheck className="h-4 w-4" aria-hidden="true" /> Book a Test
          </Link>
          <a
            href={whatsappLink(
              'Hello Modern Diagnostic, I would like to book a test. Please guide me.'
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp w-full"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" /> Enquire on WhatsApp
          </a>
        </div>

        <p className="mt-4 text-center text-[11px] leading-relaxed text-slate-400">
          Booking is confirmed only after our team verifies and calls you back.
        </p>
      </div>

      {/* Decorative centres ribbon */}
      <div className="mt-3 flex justify-center gap-2">
        {CENTRES.map((c) => (
          <span key={c.id} className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur">
            {c.shortName}
          </span>
        ))}
      </div>
    </div>
  );
}
