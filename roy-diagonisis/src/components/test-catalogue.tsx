'use client';

// Searchable, filterable test + package catalogue with a sticky filter bar and
// a slide-over detail panel for each test.
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, X, SlidersHorizontal, ArrowRight, Clock, TestTube, FileText, MessageCircle } from 'lucide-react';
import type { Category, Package, Test } from '@/lib/types';
import { formatPrice, cn } from '@/lib/utils';
import { CategoryIcon, EmptyState } from '@/components/ui';
import { whatsappLink } from '@/lib/constants';

export function TestCatalogue({
  tests,
  categories,
  packages,
}: {
  tests: Test[];
  categories: Category[];
  packages: Package[];
}) {
  const params = useSearchParams();
  const initialCategory = params.get('category') ?? '';
  const initialQ = params.get('q') ?? '';

  const [query, setQuery] = useState(initialQ);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [selected, setSelected] = useState<Test | null>(null);
  const [tab, setTab] = useState<'tests' | 'packages'>('tests');

  // Keep filters in the URL so results are shareable.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (query) url.searchParams.set('q', query);
    else url.searchParams.delete('q');
    if (activeCategory) url.searchParams.set('category', activeCategory);
    else url.searchParams.delete('category');
    window.history.replaceState({}, '', url.toString());
  }, [query, activeCategory]);

  // Lock background scroll while the detail panel is open.
  useEffect(() => {
    document.body.style.overflow = selected ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [selected]);

  // Close panel on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSelected(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tests.filter((t) => {
      const matchesCategory = !activeCategory || t.category_id === activeCategory;
      const matchesQuery =
        !q ||
        t.name.toLowerCase().includes(q) ||
        (t.short_description ?? '').toLowerCase().includes(q) ||
        (t.description ?? '').toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [tests, query, activeCategory]);

  const activeCategoryObj = categories.find((c) => c.id === activeCategory);

  return (
    <div>
      {/* Tabs */}
      <div className="container-site mt-10">
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-soft">
          <button
            type="button"
            onClick={() => setTab('tests')}
            className={cn(
              'rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors',
              tab === 'tests' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-50'
            )}
          >
            Tests ({tests.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('packages')}
            className={cn(
              'rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors',
              tab === 'packages' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-50'
            )}
          >
            Health Packages ({packages.length})
          </button>
        </div>
      </div>

      {tab === 'packages' ? (
        <section className="section-tight">
          <div className="container-site">
            {packages.length === 0 ? (
              <EmptyState
                title="No packages published yet"
                description="Health packages will appear here once they are published. Please call us for the latest available packages."
                icon={<FileText className="h-7 w-7" aria-hidden="true" />}
              />
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {packages.map((pkg) => (
                  <article key={pkg.id} className="card card-hover overflow-hidden">
                    <div className="gradient-brand h-1.5" aria-hidden="true" />
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="font-display text-xl font-bold text-slate-900">{pkg.name}</h2>
                        {pkg.is_popular && <span className="badge-warning">Popular</span>}
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{pkg.description}</p>

                      {pkg.includes?.length > 0 && (
                        <ul className="mt-4 space-y-1.5 border-t border-slate-100 pt-4">
                          {pkg.includes.map((inc) => (
                            <li key={inc} className="flex items-start gap-2 text-sm text-slate-600">
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" aria-hidden="true" />
                              {inc}
                            </li>
                          ))}
                        </ul>
                      )}

                      <dl className="mt-4 space-y-1.5 text-xs text-slate-500">
                        {pkg.test_count && (
                          <div className="flex justify-between"><dt>Tests included</dt><dd className="font-medium text-slate-700">{pkg.test_count}</dd></div>
                        )}
                        <div className="flex justify-between">
                          <dt>Fasting</dt>
                          <dd className="font-medium text-slate-700">{pkg.fasting_required ? 'Required' : 'Not required'}</dd>
                        </div>
                        {pkg.report_time && (
                          <div className="flex justify-between"><dt>Report</dt><dd className="font-medium text-slate-700">{pkg.report_time}</dd></div>
                        )}
                      </dl>

                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                        <div>
                          <p className="text-xs text-slate-400">Package price</p>
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
            )}
          </div>
        </section>
      ) : (
        <section className="section-tight">
          <div className="container-site">
            {/* Search + filters */}
            <div className="card p-4 sm:p-5">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for a test — e.g. CBC, thyroid, sugar, lipid…"
                  aria-label="Search tests"
                  className="field pl-12 pr-11"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 py-1">
                  <button
                    type="button"
                    onClick={() => setActiveCategory('')}
                    className={cn(
                      'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors',
                      !activeCategory
                        ? 'border-brand-600 bg-brand-600 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-brand-200 hover:text-brand-700'
                    )}
                  >
                    All tests
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setActiveCategory(c.id === activeCategory ? '' : c.id)}
                      className={cn(
                        'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors',
                        activeCategory === c.id
                          ? 'border-brand-600 bg-brand-600 text-white'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-brand-200 hover:text-brand-700'
                      )}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Result meta */}
            <p className="mt-6 text-sm text-slate-500">
              Showing <span className="font-semibold text-slate-800">{filtered.length}</span> test
              {filtered.length !== 1 && 's'}
              {activeCategoryObj && (
                <>
                  {' '}in <span className="font-semibold text-slate-800">{activeCategoryObj.name}</span>
                </>
              )}
              {query && (
                <>
                  {' '}matching “<span className="font-semibold text-slate-800">{query}</span>”
                </>
              )}
            </p>

            {/* Results */}
            {filtered.length === 0 ? (
              <div className="mt-6">
                <EmptyState
                  title="No tests found"
                  description="Try a different search term, or clear the filters. You can also call us — we may still be able to help."
                  action={
                    <div className="flex flex-wrap justify-center gap-2.5">
                      <button type="button" onClick={() => { setQuery(''); setActiveCategory(''); }} className="btn-secondary btn-sm">
                        Clear filters
                      </button>
                      <a
                        href={whatsappPath(query)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-whatsapp btn-sm"
                      >
                        <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" /> Ask on WhatsApp
                      </a>
                    </div>
                  }
                />
              </div>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((test, i) => {
                  const cat = categories.find((c) => c.id === test.category_id);
                  return (
                    <article
                      key={test.id}
                      id={test.slug}
                      className="card card-hover flex flex-col p-5 animate-fade-up scroll-mt-32"
                      style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-50 to-teal-50 text-brand-600">
                          <CategoryIcon name={cat?.icon} className="h-5 w-5" />
                        </span>
                        {test.is_popular && <span className="badge-info">Popular</span>}
                      </div>

                      <h2 className="mt-3 font-display text-base font-bold leading-snug text-slate-900">
                        {test.name}
                      </h2>
                      {cat && <p className="mt-1 text-xs font-medium text-slate-400">{cat.name}</p>}
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                        {test.short_description ?? test.description}
                      </p>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                        <span className="font-display text-base font-bold text-brand-700">
                          {formatPrice(test.price)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelected(test)}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
                        >
                          Details <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Detail slide-over */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={selected.name}>
          <button
            type="button"
            aria-label="Close details"
            onClick={() => setSelected(null)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
          />
          <div className="relative h-full w-full max-w-md animate-fade-up overflow-y-auto bg-white shadow-2xl">
            <div className="gradient-brand sticky top-0 flex items-start justify-between gap-4 px-6 py-5 text-white">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Test details</p>
                <h2 className="mt-1 font-display text-xl font-bold">{selected.name}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/15 hover:bg-white/25"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-6">
              {selected.description && (
                <p className="text-sm leading-relaxed text-slate-700">{selected.description}</p>
              )}

              <dl className="mt-6 space-y-3">
                {[
                  selected.sample_type && { icon: TestTube, label: 'Sample type', value: selected.sample_type },
                  selected.report_time && { icon: Clock, label: 'Report turnaround', value: selected.report_time },
                  selected.preparation && { icon: FileText, label: 'Preparation', value: selected.preparation },
                ].filter(Boolean).map((row: any) => (
                  <div key={row.label} className="flex gap-3 rounded-xl border border-slate-100 p-4">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                      <row.icon className="h-4.5 w-4.5" aria-hidden="true" />
                    </span>
                    <div>
                      <dt className="text-xs font-medium text-slate-400">{row.label}</dt>
                      <dd className="text-sm font-medium text-slate-800">{row.value}</dd>
                    </div>
                  </div>
                ))}
              </dl>

              <div className="mt-6 rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">Price</p>
                <p className="font-display text-2xl font-bold text-brand-700">{formatPrice(selected.price)}</p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Final price is confirmed by our team at the time of booking.
                </p>
              </div>

              <div className="mt-6 grid gap-2.5">
                <Link
                  href={`/book?test=${selected.slug}`}
                  onClick={() => setSelected(null)}
                  className="btn-primary"
                >
                  Book this test <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <a
                  href={whatsappPath(selected.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" /> Ask about this test
                </a>
              </div>

              <p className="mt-5 text-[11px] leading-relaxed text-slate-400">
                This information is for general guidance. Please follow your doctor's advice regarding
                which tests you need.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Builds a WhatsApp deep-link asking about the given test (or search term). */
function whatsappPath(term: string): string {
  const msg = term
    ? `Hello Modern Diagnostic, I would like to know more about the "${term}" test. Please share the details.`
    : 'Hello Modern Diagnostic, I need help choosing the right test.';
  return whatsappLink(msg);
}
