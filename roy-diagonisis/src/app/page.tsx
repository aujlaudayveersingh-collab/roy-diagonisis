// Home page — the flagship page. Composes hero, popular tests, trust reasons,
// services, centres, home collection, testimonials and contact.
import Link from 'next/link';
import {
  ArrowRight, Phone, MessageCircle, Home, MapPin, Clock, ShieldCheck, Microscope,
  Users, FlaskConical, BadgeCheck, Stethoscope, TestTube, CalendarCheck, ChevronRight,
} from 'lucide-react';
import { SiteShell } from '@/components/site-shell';
import { SectionHeading, CategoryIcon, Stars, EmptyState, ImageBox } from '@/components/ui';
import { BookingFormCTA } from '@/components/home/booking-cta';
import { getSettings, getTests, getPopularTests, getPackages, getCategories, getCentres, getTestimonials } from '@/lib/data';
import { BUSINESS, CENTRES, whatsappLink, WHATSAPP_DEFAULT_MESSAGE } from '@/lib/constants';
import { formatPrice, cn } from '@/lib/utils';

export default async function HomePage() {
  const [settings, tests, popular, packages, categories, centres, testimonials] =
    await Promise.all([
      getSettings(),
      getTests(),
      getPopularTests(6),
      getPackages(),
      getCategories(),
      getCentres(),
      getTestimonials(),
    ]);

  const hero = settings.hero;

  return (
    <SiteShell settings={settings}>
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-hero-fade">
        <div className="absolute inset-0 grid-bg opacity-40" aria-hidden="true" />
        <div
          className="absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-teal-200/30 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute -left-24 top-40 h-80 w-80 rounded-full bg-brand-200/30 blur-3xl"
          aria-hidden="true"
        />

        <div className="container-site relative section">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-6 xl:col-span-7">
              {hero.eyebrow && <p className="eyebrow animate-fade-up">{hero.eyebrow}</p>}
              <h1 className="heading-xl mt-5 animate-fade-up [animation-delay:80ms]">
                Reliable diagnostic care for your family,{' '}
                <span className="text-gradient">close to home.</span>
              </h1>
              <p className="lede mt-6 max-w-xl animate-fade-up [animation-delay:160ms]">
                {hero.subheadline}
              </p>

              <div className="mt-8 flex flex-col gap-3 animate-fade-up [animation-delay:240ms] sm:flex-row sm:flex-wrap">
                <Link href="/book" className="btn-primary btn-lg">
                  Book a Test <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <a
                  href={whatsappLink(WHATSAPP_DEFAULT_MESSAGE)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp btn-lg"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" /> Chat on WhatsApp
                </a>
                <a href={`tel:${BUSINESS.phone.replace(/\s/g, '')}`} className="btn-secondary btn-lg">
                  <Phone className="h-4 w-4" aria-hidden="true" /> Call Now
                </a>
              </div>

              {hero.highlights?.length > 0 && (
                <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 animate-fade-up [animation-delay:320ms]">
                  {hero.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-2 text-sm font-medium text-slate-600">
                      <BadgeCheck className="h-4.5 w-4.5 text-teal-500" aria-hidden="true" />
                      {h}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Hero visual */}
            <div className="lg:col-span-6 xl:col-span-5">
              <div className="relative mx-auto max-w-md animate-fade-up [animation-delay:200ms]">
                {hero.image_url ? (
                  <ImageBox src={hero.image_url} alt="Modern Diagnostic laboratory" ratio="aspect-[4/5]" priority />
                ) : (
                  <HeroIllustration />
                )}

                {/* Floating info cards */}
                <div className="absolute -left-4 top-8 hidden rounded-2xl border border-slate-100 bg-white/90 p-3.5 shadow-card backdrop-blur sm:block animate-float-slow">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
                      <TestTube className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400">Tests available</p>
                      <p className="font-display text-lg font-bold text-slate-900">{tests.length}+</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -right-3 bottom-10 hidden rounded-2xl border border-slate-100 bg-white/90 p-3.5 shadow-card backdrop-blur sm:block animate-float-slow [animation-delay:1.5s]">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-teal-50 text-teal-600">
                      <Home className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400">Home collection</p>
                      <p className="font-display text-base font-bold text-slate-900">At your door</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TRUST STRIP ================= */}
      <section className="border-y border-slate-100 bg-white">
        <div className="container-site grid grid-cols-2 gap-6 py-8 lg:grid-cols-4">
          {[
            { icon: Microscope, label: 'Careful testing process', value: 'Quality-focused' },
            { icon: Home, label: 'Home sample collection', value: 'At your doorstep' },
            { icon: MapPin, label: 'Centres in Assam', value: 'Dhekiajuli & Sirajuli' },
            { icon: Users, label: 'Patient-first service', value: 'Respectful care' },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <item.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="font-display text-sm font-bold text-slate-900">{item.value}</p>
                <p className="text-xs text-slate-500">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= POPULAR TESTS ================= */}
      <section className="section bg-slate-50/50">
        <div className="container-site">
          <SectionHeading
            eyebrow="Popular tests"
            title="Commonly booked tests & health checks"
            description="These are the tests families ask for the most. Prices and report times are confirmed by our team at the time of booking."
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {popular.map((test, i) => (
              <article
                key={test.id}
                className="card card-hover group flex flex-col p-6 animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-brand-50 to-teal-50 text-brand-600">
                    <CategoryIcon name={test.category?.icon} className="h-6 w-6" />
                  </div>
                  <span className="badge-info">Popular</span>
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900">{test.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                  {test.short_description ?? test.description}
                </p>

                <dl className="mt-4 space-y-1.5 border-t border-slate-100 pt-4 text-xs text-slate-500">
                  {test.sample_type && (
                    <div className="flex justify-between"><dt>Sample</dt><dd className="font-medium text-slate-700">{test.sample_type}</dd></div>
                  )}
                  {test.report_time && (
                    <div className="flex justify-between"><dt>Report</dt><dd className="font-medium text-slate-700">{test.report_time}</dd></div>
                  )}
                  <div className="flex justify-between">
                    <dt>Price</dt>
                    <dd className="font-semibold text-brand-700">{formatPrice(test.price)}</dd>
                  </div>
                </dl>

                <Link
                  href={`/book?test=${test.slug}`}
                  className="mt-5 inline-flex items-center justify-center gap-1.5 rounded-xl border border-brand-100 bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-700 transition-colors group-hover:bg-brand-600 group-hover:text-white"
                >
                  Book this test <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/tests" className="btn-secondary btn-lg">
              View all tests & packages <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= WHY CHOOSE US ================= */}
      <section className="section">
        <div className="container-site">
          <SectionHeading
            eyebrow="Why Modern Diagnostic"
            title="Families choose us for dependable, respectful care"
            description="We keep things simple and honest — clear communication before your test, careful handling of your sample, and reports delivered on time."
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: ShieldCheck, title: 'Careful sample handling', body: 'Hygienic collection practice and careful labelling of every sample we process.' },
              { icon: Stethoscope, title: 'Guidance before every test', body: 'We explain what a test involves, how to prepare and when the report will be ready.' },
              { icon: Clock, title: 'Reports on time', body: 'We value your time and work to share reports as per the committed turnaround.' },
              { icon: Home, title: 'Home sample collection', body: 'Can’t visit the centre? Our phlebotomist can collect your sample at home.' },
              { icon: Users, title: 'Respectful to every patient', body: 'A calm, patient-friendly environment — especially comfortable for elderly family members.' },
              { icon: BadgeCheck, title: 'Transparent communication', body: 'No confusion about pricing or process. We confirm details before your booking.' },
            ].map((f, i) => (
              <article
                key={f.title}
                className="card card-hover p-6 animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-teal-500 text-white">
                  <f.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SERVICES ================= */}
      <section className="section bg-slate-50/50">
        <div className="container-site">
          <SectionHeading
            eyebrow="Our services"
            title="Diagnostic services for everyday health needs"
            description="From routine blood tests to grouped health checkups, explore the categories we support. Availability is confirmed at the time of booking."
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat, i) => {
              const count = tests.filter((t) => t.category_id === cat.id).length;
              return (
                <Link
                  key={cat.id}
                  href={`/tests?category=${cat.slug}`}
                  className="card card-hover group p-6 animate-fade-up"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div
                    className={cn(
                      'mb-4 grid h-12 w-12 place-items-center rounded-xl text-white transition-transform group-hover:scale-110',
                      cat.colour === 'teal' ? 'bg-gradient-to-br from-teal-500 to-teal-600' : 'bg-gradient-to-br from-brand-500 to-brand-600'
                    )}
                  >
                    <CategoryIcon name={cat.icon} className="h-6 w-6" />
                  </div>
                  <h3 className="font-display font-bold text-slate-900">{cat.name}</h3>
                  <p className="mt-1.5 line-clamp-2 text-sm text-slate-500">{cat.description}</p>
                  <p className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
                    {count > 0 ? `${count} test${count > 1 ? 's' : ''}` : 'View'}{' '}
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </p>
                </Link>
              );
            })}
          </div>

          {packages.length > 0 && (
            <div className="mt-12">
              <h3 className="heading-md text-center">Health packages</h3>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {packages.map((pkg) => (
                  <article key={pkg.id} className="card card-hover overflow-hidden">
                    <div className="gradient-brand h-1.5" aria-hidden="true" />
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="font-display text-lg font-bold text-slate-900">{pkg.name}</h4>
                        {pkg.is_popular && <span className="badge-warning">Popular</span>}
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{pkg.description}</p>
                      {pkg.includes?.length > 0 && (
                        <ul className="mt-4 space-y-1.5">
                          {pkg.includes.slice(0, 4).map((inc) => (
                            <li key={inc} className="flex items-start gap-2 text-sm text-slate-600">
                              <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal-500" aria-hidden="true" />
                              {inc}
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                        <div>
                          <p className="text-xs text-slate-400">Starting at</p>
                          <p className="font-display text-lg font-bold text-brand-700">{formatPrice(pkg.price)}</p>
                        </div>
                        <Link href={`/book?package=${pkg.slug}`} className="btn-primary btn-sm">
                          Book Package
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ================= OUR TWO CENTRES ================= */}
      <section className="section">
        <div className="container-site">
          <SectionHeading
            eyebrow="Our centres"
            title="Two centres, one standard of care"
            description="Visit whichever centre is convenient for you — or book home sample collection and we come to you."
          />

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {centres.map((centre, i) => (
              <article
                key={centre.id}
                className="card card-hover overflow-hidden animate-fade-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="gradient-brand flex items-center justify-between px-6 py-5 text-white">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Centre {i + 1}</p>
                    <h3 className="font-display text-xl font-bold">{centre.name}</h3>
                  </div>
                  <MapPin className="h-8 w-8 text-white/70" aria-hidden="true" />
                </div>
                <div className="p-6">
                  <p className="text-sm font-medium text-slate-500">{centre.tagline}</p>
                  <address className="mt-4 flex gap-3 not-italic">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" aria-hidden="true" />
                    <span className="text-sm leading-relaxed text-slate-700">{centre.address}</span>
                  </address>
                  <p className="mt-4 flex gap-3">
                    <Clock className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" aria-hidden="true" />
                    <span className="text-sm text-slate-700">{centre.hours}</span>
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {centre.services.map((s) => (
                      <span key={s} className="badge-neutral">{s}</span>
                    ))}
                  </div>

                  <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
                    <a href={centre.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                      <MapPin className="h-4 w-4" aria-hidden="true" /> Get Directions
                    </a>
                    <Link href={`/book?centre=${centre.id}`} className="btn-primary">
                      Book at this centre
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ================= HOME COLLECTION ================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-teal-600 text-white">
        <div className="absolute inset-0 grid-bg opacity-10" aria-hidden="true" />
        <div className="container-site relative section">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider backdrop-blur">
                <Home className="h-3.5 w-3.5" aria-hidden="true" /> Home sample collection
              </p>
              <h2 className="heading-lg mt-5 text-white">{settings.home_collection.headline}</h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
                {settings.home_collection.body}
              </p>

              <ol className="mt-8 space-y-4">
                {settings.home_collection.steps.map((step, i) => (
                  <li key={step.title} className="flex gap-4">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/15 font-display text-sm font-bold backdrop-blur">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-semibold">{step.title}</p>
                      <p className="text-sm text-white/80">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/home-collection" className="btn-lg inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-brand-700 transition-colors hover:bg-white/90">
                  Learn more <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <a
                  href={whatsappLink('Hello Modern Diagnostic, I would like to book a home sample collection.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-lg inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-white/10"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" /> Book via WhatsApp
                </a>
              </div>
            </div>

            <BookingFormCTA />
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      {testimonials.length > 0 && (
        <section className="section bg-slate-50/50">
          <div className="container-site">
            <SectionHeading
              eyebrow="Patient stories"
              title="What families say about us"
              description="Reviews are published only with the patient's permission."
            />
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t, i) => (
                <figure key={t.id} className="card p-6 animate-fade-up" style={{ animationDelay: `${i * 70}ms` }}>
                  <Stars rating={t.rating} />
                  <blockquote className="mt-4 text-sm leading-relaxed text-slate-700">
                    “{t.message}”
                  </blockquote>
                  <figcaption className="mt-5 border-t border-slate-100 pt-4">
                    <p className="font-semibold text-slate-900">{t.name}</p>
                    {t.location && <p className="text-xs text-slate-500">{t.location}</p>}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= FINAL CTA / CONTACT ================= */}
      <section className="section">
        <div className="container-site">
          <div className="card overflow-hidden">
            <div className="grid lg:grid-cols-2">
              <div className="p-8 sm:p-10">
                <p className="eyebrow">Ready to book?</p>
                <h2 className="heading-lg mt-4">Book your test in a few simple steps</h2>
                <p className="lede mt-4">
                  Fill in the booking form, call us, or send a WhatsApp message — whichever is easiest
                  for you. Our team will confirm the details and guide you through the process.
                </p>

                <div className="mt-6 space-y-3">
                  <a href={`tel:${BUSINESS.phone.replace(/\s/g, '')}`} className="flex items-center gap-3 rounded-xl border border-slate-100 p-4 transition-colors hover:border-brand-200 hover:bg-brand-50">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white">
                      <Phone className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-xs font-medium text-slate-400">Call us</span>
                      <span className="font-semibold text-slate-900">{BUSINESS.phone}</span>
                    </span>
                  </a>
                  <a
                    href={whatsappLink(WHATSAPP_DEFAULT_MESSAGE)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-slate-100 p-4 transition-colors hover:border-teal-200 hover:bg-teal-50"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#25D366] text-white">
                      <MessageCircle className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-xs font-medium text-slate-400">WhatsApp</span>
                      <span className="font-semibold text-slate-900">Chat with our team</span>
                    </span>
                  </a>
                  <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-4">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-600 text-white">
                      <Clock className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-xs font-medium text-slate-400">Opening hours</span>
                      <span className="font-semibold text-slate-900">{settings.contact.hours}</span>
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <Link href="/book" className="btn-primary btn-lg w-full sm:w-auto">
                    <CalendarCheck className="h-4 w-4" aria-hidden="true" /> Book a Test Now
                  </Link>
                </div>
              </div>

              <div className="relative bg-slate-50 p-8 sm:p-10">
                <h3 className="heading-md">Visit our centres</h3>
                <div className="mt-5 space-y-4">
                  {centres.map((c) => (
                    <div key={c.id} className="rounded-xl border border-slate-100 bg-white p-4">
                      <p className="font-semibold text-slate-900">{c.name}</p>
                      <p className="mt-1 text-sm text-slate-600">{c.address}</p>
                      <a href={c.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
                        <MapPin className="h-4 w-4" aria-hidden="true" /> Get directions
                      </a>
                    </div>
                  ))}
                </div>
                <p className="mt-6 text-xs text-slate-500">
                  Looking for a specific test?{' '}
                  <Link href="/tests" className="font-semibold text-brand-600 hover:underline">
                    Browse the full test catalogue →
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

/** Decorative hero illustration used when no photo is uploaded. */
function HeroIllustration() {
  return (
    <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-500 to-teal-500 shadow-lift">
      <div className="absolute inset-0 grid-bg opacity-20" aria-hidden="true" />
      {/* Lab flask */}
      <svg viewBox="0 0 320 400" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="flask" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="1" stopColor="#d2faf4" stopOpacity="0.85" />
          </linearGradient>
        </defs>
        <g opacity="0.95">
          <rect x="120" y="60" width="80" height="18" rx="9" fill="url(#flask)" opacity="0.9" />
          <path d="M134 78 L134 150 L88 268 a40 40 0 0 0 36 58 h72 a40 40 0 0 0 36 -58 L186 150 L186 78 Z"
            fill="url(#flask)" stroke="#ffffff" strokeWidth="4" strokeLinejoin="round" />
          <path d="M110 250 h100 l26 46 a28 28 0 0 1 -25 41 h-102 a28 28 0 0 1 -25 -41 Z" fill="#0c63e0" opacity="0.28" />
          <circle cx="140" cy="280" r="7" fill="#ffffff" opacity="0.7" />
          <circle cx="176" cy="300" r="5" fill="#ffffff" opacity="0.6" />
          <circle cx="158" cy="262" r="4" fill="#ffffff" opacity="0.5" />
        </g>
      </svg>
      <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-white/95 p-4 shadow-card backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Modern Diagnostic</p>
        <p className="mt-1 font-display text-base font-bold text-slate-900">
          Careful diagnostics, clear answers.
        </p>
      </div>
    </div>
  );
}
