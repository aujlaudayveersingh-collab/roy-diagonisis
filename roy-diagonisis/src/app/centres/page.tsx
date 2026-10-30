import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Phone, Clock, Navigation, MessageCircle, Home, FlaskConical, BadgeCheck } from 'lucide-react';
import { PageShell } from '@/components/page-shell';
import { buildMetadata } from '@/lib/seo';
import { getCentres } from '@/lib/data';
import { whatsappLink } from '@/lib/constants';

export const metadata: Metadata = buildMetadata({
  title: 'Our Centres',
  description:
    'Visit Modern Diagnostic at our two centres in Assam — Dhekiajuli (Ward No. 4, Anil Borah Path) and Sirajuli (NH 15, near Colony Road). Get directions, timings and contact details.',
  path: '/centres',
});

export default async function CentresPage() {
  const centres = await getCentres();

  return (
    <PageShell
      eyebrow="Our centres"
      title="Two centres, easy to reach"
      description="Whichever centre is closer to you, you'll receive the same careful service. Both centres offer home sample collection bookings."
      path="/centres"
    >
      <section className="section">
        <div className="container-site space-y-8">
          {centres.map((centre, i) => (
            <article key={centre.id} className="card overflow-hidden">
              <div className="grid lg:grid-cols-3">
                {/* Info */}
                <div className="p-7 sm:p-8 lg:col-span-2">
                  <div className="flex items-center gap-3">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-teal-500 text-white">
                      <FlaskConical className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
                        Centre {i + 1}
                      </p>
                      <h2 className="font-display text-2xl font-bold text-slate-900">{centre.name}</h2>
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-slate-600">{centre.tagline}</p>

                  <dl className="mt-6 space-y-4">
                    <div className="flex gap-3">
                      <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" aria-hidden="true" />
                      <div>
                        <dt className="text-xs font-medium text-slate-400">Address</dt>
                        <dd className="mt-0.5 text-sm leading-relaxed text-slate-800">
                          {centre.addressLines.map((line) => (
                            <span key={line} className="block">{line}</span>
                          ))}
                        </dd>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Phone className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" aria-hidden="true" />
                      <div>
                        <dt className="text-xs font-medium text-slate-400">Phone</dt>
                        <dd className="mt-0.5">
                          <a href={`tel:${centre.phone.replace(/\s/g, '')}`} className="text-sm font-semibold text-slate-800 hover:text-brand-700">
                            {centre.phone}
                          </a>
                        </dd>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Clock className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" aria-hidden="true" />
                      <div>
                        <dt className="text-xs font-medium text-slate-400">Opening hours</dt>
                        <dd className="mt-0.5 text-sm text-slate-800">{centre.hours}</dd>
                      </div>
                    </div>
                  </dl>

                  <div className="mt-6">
                    <p className="text-xs font-medium text-slate-400">Services at this centre</p>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {centre.services.map((s) => (
                        <li key={s} className="badge-neutral">
                          <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" /> {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-7 grid gap-2.5 sm:grid-cols-3">
                    <a href={centre.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
                      <Navigation className="h-4 w-4" aria-hidden="true" /> Directions
                    </a>
                    <a
                      href={whatsappLink(`Hello Modern Diagnostic, I have a question about the ${centre.name}.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-whatsapp"
                    >
                      <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp
                    </a>
                    <Link href={`/book?centre=${centre.id}`} className="btn-secondary">
                      Book a Test
                    </Link>
                  </div>
                </div>

                {/* Map */}
                <div className="relative min-h-[18rem] border-t border-slate-100 bg-slate-50 lg:border-l lg:border-t-0">
                  <iframe
                    title={`Map showing ${centre.name}`}
                    src={embedSrc(centre.mapsUrl)}
                    className="absolute inset-0 h-full w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Home collection CTA */}
      <section className="section-tight bg-slate-50/60">
        <div className="container-site">
          <div className="card flex flex-col items-center justify-between gap-6 p-8 text-center lg:flex-row lg:text-left">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-teal-600 text-white">
                <Home className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <h2 className="heading-md">Can't visit a centre?</h2>
                <p className="mt-1.5 max-w-xl text-sm text-slate-600">
                  Book home sample collection and our phlebotomist will visit your address. Available
                  for Dhekiajuli, Sirajuli and nearby areas.
                </p>
              </div>
            </div>
            <Link href="/home-collection" className="btn-teal shrink-0">
              Home Collection Details <Home className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

/** Converts a Google Maps search URL into an embeddable map URL. */
function embedSrc(mapsUrl: string): string {
  try {
    const u = new URL(mapsUrl);
    const query = u.searchParams.get('query') ?? '';
    return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  } catch {
    return 'https://www.google.com/maps';
  }
}
