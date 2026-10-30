// Public site shell: announcement bar + header + main + footer + WhatsApp FAB.
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { WhatsAppFloat } from '@/components/whatsapp-float';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import type { SiteSettings } from '@/lib/types';

function AnnouncementBar({ settings }: { settings: SiteSettings }) {
  const a = settings.announcement;
  if (!a?.enabled || !a.text) return null;
  return (
    <div className="relative z-30 bg-gradient-to-r from-brand-700 via-brand-600 to-teal-600 text-white">
      <div className="container-site flex min-h-10 items-center justify-center gap-2 py-1.5 text-center text-xs font-medium sm:text-sm">
        <Sparkles className="hidden h-3.5 w-3.5 shrink-0 sm:block" aria-hidden="true" />
        <span>{a.text}</span>
        {a.link_href && (
          <Link
            href={a.link_href}
            className="ml-1 inline-flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 font-semibold underline-offset-2 hover:bg-white/25 hover:underline"
          >
            {a.link_label || 'Learn more'} →
          </Link>
        )}
      </div>
    </div>
  );
}

export function SiteShell({
  settings,
  children,
}: {
  settings: SiteSettings;
  children: React.ReactNode;
}) {
  return (
    <>
      <AnnouncementBar settings={settings} />
      <Header logoUrl={settings.brand.logo_url} />
      <main id="main-content">{children}</main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
