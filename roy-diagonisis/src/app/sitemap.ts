import type { MetadataRoute } from 'next';
import { BUSINESS } from '@/lib/constants';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = BUSINESS.siteUrl.replace(/\/$/, '');
  const lastModified = new Date();

  const routes: { path: string; priority: number; changeFrequency: string }[] = [
    { path: '/', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/tests', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/services', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/book', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/home-collection', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/centres', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/about', priority: 0.6, changeFrequency: 'yearly' },
    { path: '/contact', priority: 0.7, changeFrequency: 'monthly' },
  ];

  return routes.map((r) => ({
    url: `${base}${r.path}`,
    lastModified,
    changeFrequency: r.changeFrequency as MetadataRoute.Sitemap[number]['changeFrequency'],
    priority: r.priority,
  }));
}
