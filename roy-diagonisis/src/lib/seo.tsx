// =============================================================================
// SEO helpers: metadata builders + JSON-LD structured data.
// =============================================================================
import type { Metadata } from 'next';
import { BUSINESS, CENTRES } from '@/lib/constants';

const SITE_URL = BUSINESS.siteUrl;

export const DEFAULT_META = {
  title: 'Modern Diagnostic | Diagnostic Laboratory in Dhekiajuli & Sirajuli, Assam',
  description:
    'Modern Diagnostic is a diagnostic laboratory in Dhekiajuli and Sirajuli, Assam offering blood tests, health packages and home sample collection. Book your test today.',
};

/** Builds page metadata with a consistent title/description template. */
export function buildMetadata({
  title,
  description,
  path = '/',
  image,
}: {
  title: string;
  description: string;
  path?: string;
  image?: string;
}): Metadata {
  const url = `${SITE_URL}${path}`;
  const ogImage = image ?? `${SITE_URL}/og-default.svg`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: BUSINESS.name,
      type: 'website',
      locale: 'en_IN',
      images: [{ url: ogImage, width: 1200, height: 630, alt: BUSINESS.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    robots: { index: true, follow: true },
  };
}

/** Organization / LocalBusiness schema for the two centres. */
export function localBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    name: BUSINESS.name,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.svg`,
    description: DEFAULT_META.description,
    telephone: BUSINESS.phone,
    email: BUSINESS.email,
    founder: { '@type': 'Person', name: BUSINESS.owner },
    medicalSpecialty: 'Diagnostic',
    areaServed: [
      { '@type': 'City', name: 'Dhekiajuli' },
      { '@type': 'City', name: 'Sirajuli' },
      { '@type': 'State', name: 'Assam' },
    ],
    address: CENTRES.map((c) => ({
      '@type': 'PostalAddress',
      streetAddress: c.addressLines[0],
      addressLocality: c.shortName,
      addressRegion: 'Assam',
      addressCountry: 'IN',
      ...(c.id === 'dhekiajuli' ? { postalCode: '784110' } : {}),
    })),
    openingHours: 'Mo-Sa 07:00-20:00, Su 07:00-12:00',
    sameAs: [],
  };
}

/** Breadcrumb list schema. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

/** MedicalTest / service schema helper. */
export function testJsonLd(test: { name: string; description?: string | null; slug: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalTest',
    name: test.name,
    description: test.description ?? undefined,
    url: `${SITE_URL}/tests#${test.slug}`,
    usedBy: { '@type': 'MedicalBusiness', name: BUSINESS.name, url: SITE_URL },
  };
}

/** Renders JSON-LD script tags safely. */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
