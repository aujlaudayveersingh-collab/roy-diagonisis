import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageShell } from '@/components/page-shell';
import { buildMetadata } from '@/lib/seo';
import { getCategories, getTests, getPackages } from '@/lib/data';
import { TestCatalogue } from '@/components/test-catalogue';

export const metadata: Metadata = buildMetadata({
  title: 'Tests & Health Packages',
  description:
    'Search our catalogue of blood tests, thyroid, diabetes, liver and kidney tests, lipid profile and health packages. Serving Dhekiajuli, Sirajuli and nearby areas in Assam.',
  path: '/tests',
});

export default async function TestsPage() {
  const [tests, categories, packages] = await Promise.all([
    getTests(),
    getCategories(),
    getPackages(),
  ]);

  return (
    <PageShell
      eyebrow="Tests & packages"
      title="Search our test catalogue"
      description="Find the test you need, check the preparation and report time, and book online. Prices shown are confirmed by our team before your booking is finalised."
      path="/tests"
    >
      <Suspense fallback={<div className="container-site section-tight" aria-live="polite">Loading catalogue…</div>}>
        <TestCatalogue tests={tests} categories={categories} packages={packages} />
      </Suspense>
    </PageShell>
  );
}
