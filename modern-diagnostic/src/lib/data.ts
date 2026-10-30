// =============================================================================
// Public data access layer.
// Every function prefers live Supabase data and falls back to bundled content
// when Supabase isn't configured, so the marketing site always renders.
// These run on the server (Server Components / Server Actions).
// =============================================================================
import { createClient } from '@/lib/supabase/server';
import { CENTRES, BUSINESS } from '@/lib/constants';
import {
  FALLBACK_CATEGORIES,
  FALLBACK_PACKAGES,
  FALLBACK_TESTS,
  FALLBACK_TESTIMONIALS,
} from '@/lib/content-fallback';
import type { Category, Package, SiteSettings, Test, Testimonial } from '@/lib/types';

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------
const FALLBACK_SETTINGS: SiteSettings = {
  brand: { name: BUSINESS.name, tagline: 'Accurate Diagnostics. Caring Service.', logo_url: null, favicon_url: null },
  hero: {
    eyebrow: 'Trusted Diagnostic Laboratory in Sonitpur, Assam',
    headline: 'Reliable diagnostic care for your family, close to home.',
    subheadline:
      'Modern Diagnostic provides careful sample collection, tested processes and clear reports for everyday health checks — at our Dhekiajuli and Sirajuli centres, or from the comfort of your home.',
    primary_cta: { label: 'Book a Test', href: '/book' },
    secondary_cta: { label: 'Chat on WhatsApp', href: 'whatsapp' },
    image_url: null,
    highlights: ['Two centres in Assam', 'Home sample collection', 'Easy online booking'],
  },
  about: {
    headline: 'A neighbourhood diagnostic laboratory built on care and consistency.',
    mission:
      'To make dependable diagnostic services easily accessible to families in Dhekiajuli, Sirajuli and the surrounding communities — with honest communication at every step.',
    body:
      'Modern Diagnostic was started by Pritam Roy with a simple belief: people deserve clear answers about their health, delivered with respect and without confusion.\n\nWe serve patients at two centres in Assam and also offer home sample collection for those who prefer to give samples at home.',
    commitments: [
      'Careful and hygienic sample collection',
      'Clear explanations before every test',
      'Reports shared on time',
      'Respectful treatment of every patient',
      'Convenient home sample collection',
    ],
    image_url: null,
  },
  contact: { phone: BUSINESS.phone, whatsapp: BUSINESS.whatsapp, email: BUSINESS.email, website: BUSINESS.domain, hours: BUSINESS.hours, owner: BUSINESS.owner },
  home_collection: {
    headline: 'Prefer to give samples at home?',
    body: 'Book home sample collection and our phlebotomist will visit your address at the scheduled time.',
    steps: [
      { title: 'Choose your tests', body: 'Pick the tests you need from our catalogue or health packages.' },
      { title: 'Share your address', body: 'Tell us your locality and a convenient date and time slot.' },
      { title: 'Sample collected at home', body: 'Our team visits your home and collects the sample with care.' },
      { title: 'Get your report', body: 'Your report is prepared and shared with you as soon as it is ready.' },
    ],
    phone: BUSINESS.phone,
    whatsapp: BUSINESS.whatsapp,
  },
  announcement: {
    enabled: true,
    text: 'Home sample collection available in Dhekiajuli & Sirajuli — call +91 9101090862 to book.',
    link_href: '/home-collection',
    link_label: 'Learn more',
  },
  seo: {
    meta_description:
      'Modern Diagnostic is a diagnostic laboratory in Dhekiajuli and Sirajuli, Assam offering blood tests, health packages and home sample collection. Book your test today.',
    keywords: ['diagnostic laboratory Dhekiajuli', 'pathology lab Sirajuli', 'blood test Sonitpur', 'health checkup Assam'],
  },
  social: { facebook: null, instagram: null, youtube: null },
};

/** Deep-merge helper so partial DB settings never break rendering. */
function mergeSettings(base: SiteSettings, patch: any): SiteSettings {
  if (!patch || typeof patch !== 'object') return base;
  const out: any = { ...base };
  for (const key of Object.keys(base as any)) {
    const b = (base as any)[key];
    const p = patch[key];
    if (p && typeof p === 'object' && !Array.isArray(p) && b && typeof b === 'object' && !Array.isArray(b)) {
      out[key] = { ...b, ...p };
    } else if (p !== undefined) {
      out[key] = p;
    }
  }
  return out as SiteSettings;
}

export async function getSettings(): Promise<SiteSettings> {
  const supabase = await createClient();
  if (!supabase) return FALLBACK_SETTINGS;
  try {
    const { data } = await supabase.from('site_settings').select('key, value');
    if (!data?.length) return FALLBACK_SETTINGS;
    const patch: Record<string, unknown> = {};
    data.forEach((row) => (patch[row.key] = row.value));
    return mergeSettings(FALLBACK_SETTINGS, patch);
  } catch {
    return FALLBACK_SETTINGS;
  }
}

// ---------------------------------------------------------------------------
// Catalogue
// ---------------------------------------------------------------------------
export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  if (!supabase) return FALLBACK_CATEGORIES;
  try {
    const { data } = await supabase
      .from('test_categories')
      .select('*')
      .order('sort_order', { ascending: true });
    return data?.length ? (data as Category[]) : FALLBACK_CATEGORIES;
  } catch {
    return FALLBACK_CATEGORIES;
  }
}

export async function getTests(opts?: { activeOnly?: boolean }): Promise<Test[]> {
  const supabase = await createClient();
  const activeOnly = opts?.activeOnly ?? true;
  if (!supabase) return activeOnly ? FALLBACK_TESTS.filter((x) => x.is_active) : FALLBACK_TESTS;
  try {
    const query = supabase
      .from('tests')
      .select('*, category:test_categories(*)')
      .order('sort_order', { ascending: true });
    const { data } = await query;
    let rows = (data as unknown as Test[]) ?? [];
    if (activeOnly) rows = rows.filter((r) => r.is_active);
    return rows.length ? rows : activeOnly ? FALLBACK_TESTS.filter((x) => x.is_active) : FALLBACK_TESTS;
  } catch {
    return FALLBACK_TESTS;
  }
}

export async function getPopularTests(limit = 6): Promise<Test[]> {
  const tests = await getTests();
  const popular = tests.filter((x) => x.is_popular);
  return (popular.length ? popular : tests).slice(0, limit);
}

export async function getPackages(opts?: { publishedOnly?: boolean }): Promise<Package[]> {
  const supabase = await createClient();
  const publishedOnly = opts?.publishedOnly ?? true;
  if (!supabase) return publishedOnly ? FALLBACK_PACKAGES.filter((p) => p.is_published) : FALLBACK_PACKAGES;
  try {
    const { data } = await supabase
      .from('packages')
      .select('*')
      .order('sort_order', { ascending: true });
    let rows = (data as Package[]) ?? [];
    if (publishedOnly) rows = rows.filter((p) => p.is_published);
    return rows.length ? rows : publishedOnly ? FALLBACK_PACKAGES.filter((p) => p.is_published) : FALLBACK_PACKAGES;
  } catch {
    return FALLBACK_PACKAGES;
  }
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const supabase = await createClient();
  if (!supabase) return FALLBACK_TESTIMONIALS;
  try {
    const { data } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_visible', true)
      .order('sort_order', { ascending: true });
    return (data as Testimonial[]) ?? [];
  } catch {
    return FALLBACK_TESTIMONIALS;
  }
}

// ---------------------------------------------------------------------------
// Centres
// ---------------------------------------------------------------------------
export async function getCentres() {
  const supabase = await createClient();
  if (!supabase) return CENTRES;
  try {
    const { data } = await supabase
      .from('centres')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (!data?.length) return CENTRES;
    // Merge DB rows onto the typed constants so address lines etc. stay rich.
    return CENTRES.map((c) => {
      const row = data.find((d) => d.id === c.id);
      if (!row) return c;
      return {
        ...c,
        name: row.name ?? c.name,
        address: row.address ?? c.address,
        phone: row.phone ?? c.phone,
        whatsapp: row.whatsapp ?? c.whatsapp,
        mapsUrl: row.maps_url ?? c.mapsUrl,
        hours: row.hours ?? c.hours,
        services: Array.isArray(row.services) && row.services.length
          ? (row.services as string[])
          : c.services,
      };
    });
  } catch {
    return CENTRES;
  }
}
