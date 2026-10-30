// Shared page header used across interior pages.
import { SiteShell } from '@/components/site-shell';
import { getSettings } from '@/lib/data';
import { JsonLd, breadcrumbJsonLd } from '@/lib/seo';
import { cn } from '@/lib/utils';

export async function PageShell({
  eyebrow,
  title,
  description,
  path,
  children,
  tone = 'light',
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  path: string;
  children: React.ReactNode;
  tone?: 'light' | 'brand';
}) {
  const settings = await getSettings();

  return (
    <SiteShell settings={settings}>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: title, path },
        ])}
      />
      <section
        className={cn(
          'relative overflow-hidden border-b',
          tone === 'brand'
            ? 'bg-gradient-to-br from-brand-700 via-brand-600 to-teal-600 text-white'
            : 'bg-hero-fade'
        )}
      >
        <div className="absolute inset-0 grid-bg opacity-30" aria-hidden="true" />
        <div className="container-site relative py-14 sm:py-16 lg:py-20">
          {eyebrow && (
            <p
              className={cn(
                'eyebrow mb-4',
                tone === 'brand' && 'border-white/20 bg-white/10 text-white'
              )}
            >
              {eyebrow}
            </p>
          )}
          <h1 className={cn('heading-xl max-w-3xl', tone === 'brand' && 'text-white')}>{title}</h1>
          {description && (
            <p className={cn('lede mt-4 max-w-2xl', tone === 'brand' && 'text-white/90')}>
              {description}
            </p>
          )}
        </div>
      </section>
      {children}
    </SiteShell>
  );
}
