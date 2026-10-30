import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { PageShell } from '@/components/page-shell';
import { buildMetadata } from '@/lib/seo';
import { getCategories, getTests } from '@/lib/data';
import { CategoryIcon } from '@/components/ui';
import { cn } from '@/lib/utils';

export const metadata: Metadata = buildMetadata({
  title: 'Our Services',
  description:
    'Explore diagnostic services at Modern Diagnostic, Dhekiajuli & Sirajuli — blood tests, CBC, thyroid, diabetes, liver and kidney function tests, lipid profile and health checkups.',
  path: '/services',
});

export default async function ServicesPage() {
  const [categories, tests] = await Promise.all([getCategories(), getTests()]);

  return (
    <PageShell
      eyebrow="Our services"
      title="Diagnostic services for everyday health needs"
      description="We support a wide range of routine and specialist investigations. Explore the categories below — the exact tests available are confirmed at the time of booking."
      path="/services"
    >
      <section className="section">
        <div className="container-site">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat, i) => {
              const catTests = tests.filter((t) => t.category_id === cat.id);
              return (
                <article
                  key={cat.id}
                  className="card card-hover flex flex-col p-7 animate-fade-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div
                    className={cn(
                      'mb-5 grid h-14 w-14 place-items-center rounded-2xl text-white',
                      cat.colour === 'teal'
                        ? 'bg-gradient-to-br from-teal-500 to-teal-600'
                        : 'bg-gradient-to-br from-brand-500 to-brand-600'
                    )}
                  >
                    <CategoryIcon name={cat.icon} className="h-7 w-7" />
                  </div>

                  <h2 className="font-display text-xl font-bold text-slate-900">{cat.name}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{cat.description}</p>

                  {catTests.length > 0 && (
                    <ul className="mt-5 flex-1 space-y-2 border-t border-slate-100 pt-5">
                      {catTests.slice(0, 4).map((t) => (
                        <li key={t.id} className="flex items-start gap-2 text-sm text-slate-600">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-500" aria-hidden="true" />
                          {t.name}
                        </li>
                      ))}
                      {catTests.length > 4 && (
                        <li className="pl-6 text-xs font-medium text-brand-600">
                          + {catTests.length - 4} more
                        </li>
                      )}
                    </ul>
                  )}

                  <Link
                    href={`/tests?category=${cat.slug}`}
                    className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700"
                  >
                    View tests <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section-tight bg-slate-50/60">
        <div className="container-site">
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow">How it works</p>
            <h2 className="heading-lg mt-4">Getting your test done is simple</h2>
          </div>
          <ol className="mx-auto mt-10 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: 'Choose your tests', body: 'Browse the catalogue or call us for guidance.' },
              { title: 'Book online or call', body: 'Submit the booking form, call or WhatsApp us.' },
              { title: 'Give your sample', body: 'Visit a centre or opt for home collection.' },
              { title: 'Receive your report', body: 'Your report is prepared and shared with you.' },
            ].map((s, i) => (
              <li key={s.title} className="card p-6">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-600 font-display text-sm font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-display font-bold text-slate-900">{s.title}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{s.body}</p>
              </li>
            ))}
          </ol>

          <div className="mt-10 text-center">
            <Link href="/book" className="btn-primary btn-lg">
              Book a Test <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
