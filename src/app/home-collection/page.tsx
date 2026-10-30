import type { Metadata } from 'next';
import Link from 'next/link';
import { Home, MessageCircle, Phone, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { PageShell } from '@/components/page-shell';
import { buildMetadata } from '@/lib/seo';
import { getSettings } from '@/lib/data';
import { whatsappLink } from '@/lib/constants';

export const metadata: Metadata = buildMetadata({
  title: 'Home Sample Collection',
  description:
    'Book home sample collection with Modern Diagnostic in Dhekiajuli and Sirajuli, Assam. Our phlebotomist visits your home to collect your sample at a convenient time.',
  path: '/home-collection',
});

export default async function HomeCollectionPage() {
  const settings = await getSettings();
  const hc = settings.home_collection;

  return (
    <PageShell
      eyebrow="Home sample collection"
      title={hc.headline}
      description={hc.body}
      path="/home-collection"
      tone="brand"
    >
      {/* Steps */}
      <section className="section">
        <div className="container-site">
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow">How it works</p>
            <h2 className="heading-lg mt-4">Sample collection in four simple steps</h2>
          </div>

          <ol className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-4">
            {hc.steps.map((step, i) => (
              <li key={step.title} className="card relative p-6 animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-brand-600 to-teal-500 font-display text-sm font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.body}</p>
                {i < hc.steps.length - 1 && (
                  <ArrowRight className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-slate-300 lg:block" aria-hidden="true" />
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* What to expect + prep */}
      <section className="section-tight bg-slate-50/60">
        <div className="container-site grid gap-8 lg:grid-cols-2">
          <div className="card p-7">
            <h2 className="heading-md flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-teal-500" aria-hidden="true" /> What to expect
            </h2>
            <ul className="mt-5 space-y-3.5">
              {[
                'Our phlebotomist arrives at your chosen time slot.',
                'Carries sealed, single-use sterile collection supplies.',
                'Confirms your details and the tests before collection.',
                'Handles and transports your sample carefully to the laboratory.',
                'You receive your report as soon as it is ready.',
              ].map((item) => (
                <li key={item} className="flex gap-3 text-sm text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-teal-500" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-7">
            <h2 className="heading-md flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-amber-500" aria-hidden="true" /> Good to know
            </h2>
            <ul className="mt-5 space-y-3.5">
              {[
                'Some tests require fasting — we will inform you in advance.',
                'Please keep a valid ID and a list of current medications ready.',
                'Children and elderly patients can be collected with a caregiver present.',
                'Home collection availability may vary by locality — please confirm when booking.',
                'Booking is confirmed only after our team calls you back.',
              ].map((item) => (
                <li key={item} className="flex gap-3 text-sm text-slate-700">
                  <AlertCircle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-amber-500" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-tight">
        <div className="container-site">
          <div className="gradient-brand relative overflow-hidden rounded-3xl p-8 text-center text-white sm:p-12">
            <div className="absolute inset-0 grid-bg opacity-10" aria-hidden="true" />
            <div className="relative">
              <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-white/15 backdrop-blur">
                <Home className="h-7 w-7" aria-hidden="true" />
              </span>
              <h2 className="heading-lg text-white">Ready to book home collection?</h2>
              <p className="mx-auto mt-3 max-w-xl text-white/90">
                Share your tests, address and a convenient time — we'll take care of the rest.
              </p>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/book?type=home" className="btn-lg inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-brand-700 transition-colors hover:bg-white/90">
                  Book Home Collection <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <a
                  href={whatsappLink('Hello Modern Diagnostic, I would like to book home sample collection.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-lg inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-white/10"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp Us
                </a>
                <a
                  href={`tel:${(hc.phone || '').replace(/\s/g, '')}`}
                  className="btn-lg inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-white/10"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" /> Call
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
