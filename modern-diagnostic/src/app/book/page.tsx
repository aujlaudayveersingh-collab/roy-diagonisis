import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { ShieldCheck, Phone, MessageCircle, Info } from 'lucide-react';
import { PageShell } from '@/components/page-shell';
import { buildMetadata } from '@/lib/seo';
import { getTests, getPackages } from '@/lib/data';
import { BookingForm } from '@/components/booking-form';
import { CENTRES, whatsappLink, BUSINESS } from '@/lib/constants';

export const metadata: Metadata = buildMetadata({
  title: 'Book a Test',
  description:
    'Book a diagnostic test or health package with Modern Diagnostic. Choose centre visit or home sample collection in Dhekiajuli and Sirajuli, Assam.',
  path: '/book',
});

export default async function BookPage() {
  const [tests, packages] = await Promise.all([getTests(), getPackages()]);

  return (
    <PageShell
      eyebrow="Book a test"
      title="Request an appointment"
      description="Share a few details and our team will call you to confirm the schedule. Booking here is a request — your slot is confirmed only after our call."
      path="/book"
    >
      <section className="section-tight">
        <div className="container-site grid gap-8 lg:grid-cols-3">
          {/* Form */}
          <div className="lg:col-span-2">
            <Suspense
              fallback={
                <div className="card p-8" aria-live="polite">
                  Loading booking form…
                </div>
              }
            >
              <BookingForm
                tests={tests.map((t) => ({ id: t.id, name: t.name, price: t.price }))}
                packages={packages.map((p) => ({ id: p.id, name: p.name, price: p.price }))}
              />
            </Suspense>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            <div className="card p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-slate-900">
                <Info className="h-5 w-5 text-brand-600" aria-hidden="true" /> How booking works
              </h2>
              <ol className="mt-4 space-y-3">
                {[
                  'Submit the form with your details and preferred time.',
                  'We receive your request instantly in our dashboard.',
                  'Our team calls to confirm the slot and answer questions.',
                  'Visit the centre or be ready for home collection.',
                ].map((s, i) => (
                  <li key={s} className="flex gap-3 text-sm text-slate-700">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ol>
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs leading-relaxed text-amber-800">
                <strong className="font-semibold">Please note:</strong> submitting this form does not
                confirm a medical appointment. Your booking is confirmed only after our team verifies
                it and calls you.
              </div>
            </div>

            <div className="card p-6">
              <h2 className="font-display text-lg font-bold text-slate-900">Need help deciding?</h2>
              <p className="mt-2 text-sm text-slate-600">
                Not sure which test you need? Our team can guide you based on your doctor's advice.
              </p>
              <div className="mt-4 grid gap-2.5">
                <a href={`tel:${BUSINESS.phone.replace(/\s/g, '')}`} className="btn-secondary">
                  <Phone className="h-4 w-4" aria-hidden="true" /> {BUSINESS.phone}
                </a>
                <a
                  href={whatsappLink('Hello Modern Diagnostic, I need help choosing the right test.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" /> Ask on WhatsApp
                </a>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-slate-900">
                <ShieldCheck className="h-5 w-5 text-teal-600" aria-hidden="true" /> Your privacy
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Your details are used only to process your booking and are never published or shared
                publicly. Patient information is visible only to authorised staff.
              </p>
              <ul className="mt-4 space-y-2">
                {CENTRES.map((c) => (
                  <li key={c.id} className="text-sm text-slate-600">
                    <Link href={`/centres`} className="font-semibold text-brand-600 hover:underline">
                      {c.name}
                    </Link>{' '}
                    — {c.shortName}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </PageShell>
  );
}
