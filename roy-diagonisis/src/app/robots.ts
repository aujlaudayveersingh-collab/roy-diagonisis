import type { MetadataRoute } from 'next';
import { BUSINESS } from '@/lib/constants';

export default function robots(): MetadataRoute.Robots {
  const base = BUSINESS.siteUrl.replace(/\/$/, '');
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Admin area and booking form results must never be indexed.
        disallow: ['/admin', '/book?*success'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
