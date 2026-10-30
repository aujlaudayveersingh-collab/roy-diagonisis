import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, HeartHandshake, Microscope, Users, ShieldCheck } from 'lucide-react';
import { PageShell } from '@/components/page-shell';
import { buildMetadata } from '@/lib/seo';
import { getSettings } from '@/lib/data';
import { BUSINESS } from '@/lib/constants';
import { ImageBox } from '@/components/ui';

export const metadata: Metadata = buildMetadata({
  title: 'About Us',
  description:
    'Learn about Modern Diagnostic — a diagnostic laboratory in Dhekiajuli and Sirajuli, Assam, started by Pritam Roy with a focus on careful testing and respectful patient care.',
  path: '/about',
});

export default async function AboutPage() {
  const settings = await getSettings();
  const about = settings.about;

  return (
    <PageShell
      eyebrow="About us"
      title={about.headline}
      description={about.mission}
      path="/about"
    >
      {/* Intro */}
      <section className="section">
        <div className="container-site grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="heading-lg">Care, consistency and clear communication</h2>
            <div className="mt-5 space-y-4 text-base leading-relaxed text-slate-600">
              {about.body.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                { icon: Microscope, label: 'Careful testing process' },
                { icon: HeartHandshake, label: 'Patient-first approach' },
                { icon: Users, label: 'Serving local families' },
                { icon: ShieldCheck, label: 'Honest communication' },
              ].map((v) => (
                <div key={v.label} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3.5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                    <v.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-semibold text-slate-800">{v.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            {about.image_url ? (
              <ImageBox src={about.image_url} alt="Modern Diagnostic team" ratio="aspect-[4/3]" />
            ) : (
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-teal-500 shadow-lift">
                <div className="absolute inset-0 grid-bg opacity-20" aria-hidden="true" />
                <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full" aria-hidden="true">
                  <g fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.9">
                    <rect x="150" y="50" width="30" height="90" rx="15" />
                    <path d="M150 110 h30 v60 a15 15 0 0 1 -30 0 Z" fill="#ffffff" opacity="0.35" />
                    <path d="M60 220 h60 l15 -30 20 60 15 -45 12 25 h140" stroke="#9BE8DC" strokeWidth="4" />
                  </g>
                </svg>
                <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-white/95 p-4 shadow-card">
                  <p className="font-display text-base font-bold text-slate-900">
                    Started by {BUSINESS.owner}
                  </p>
                  <p className="text-xs text-slate-500">{BUSINESS.name} · Dhekiajuli & Sirajuli</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Commitments */}
      <section className="section-tight bg-slate-50/60">
        <div className="container-site">
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow">Our commitment</p>
            <h2 className="heading-lg mt-4">What you can expect from us</h2>
          </div>
          <ul className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
            {about.commitments.map((c) => (
              <li key={c} className="card flex items-start gap-3 p-5">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-500" aria-hidden="true" />
                <span className="font-medium text-slate-800">{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="section-tight">
        <div className="container-site">
          <div className="card flex flex-col items-center justify-between gap-6 p-8 text-center sm:p-10 lg:flex-row lg:text-left">
            <div>
              <h2 className="heading-md">Experience our service yourself</h2>
              <p className="mt-2 max-w-xl text-sm text-slate-600">
                Book a test online, visit one of our centres, or request home sample collection. Our
                team is happy to guide you.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/book" className="btn-primary">
                Book a Test <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/contact" className="btn-secondary">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
