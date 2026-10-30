// Next.js metadata — root layout defaults.
import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { BUSINESS } from '@/lib/constants';
import { DEFAULT_META, localBusinessJsonLd, JsonLd } from '@/lib/seo';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  fallback: ['var(--font-sans)', 'system-ui', 'sans-serif'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0c63e0',
};

export const metadata: Metadata = {
  metadataBase: new URL(BUSINESS.siteUrl),
  title: {
    default: DEFAULT_META.title,
    template: `%s | ${BUSINESS.name}`,
  },
  description: DEFAULT_META.description,
  applicationName: BUSINESS.name,
  authors: [{ name: BUSINESS.owner }],
  keywords: [
    'diagnostic laboratory Dhekiajuli',
    'pathology lab Sirajuli',
    'blood test Sonitpur Assam',
    'health checkup Dhekiajuli',
    'home sample collection Assam',
    'Modern Diagnostic',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: BUSINESS.siteUrl,
    siteName: BUSINESS.name,
    title: DEFAULT_META.title,
    description: DEFAULT_META.description,
    images: [{ url: '/og-default.svg', width: 1200, height: 630, alt: BUSINESS.name }],
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_META.title,
    description: DEFAULT_META.description,
    images: ['/og-default.svg'],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: BUSINESS.siteUrl },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-touch-icon.png' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <head>
        <JsonLd data={localBusinessJsonLd()} />
      </head>
      <body className="min-h-screen bg-white font-sans text-slate-700">
        <a
          href="#main-content"
          className="sr-only-focusable fixed left-4 top-4 z-[100] rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
