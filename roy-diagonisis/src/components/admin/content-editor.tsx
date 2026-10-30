'use client';

// Website content editor — hero, about, contact, home collection, announcement,
// branding/logo and centre details. Each section saves independently.
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, Upload, Plus, Trash2, ChevronDown } from 'lucide-react';
import type { SiteSettings, Category } from '@/lib/types';
import { CENTRES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { saveSetting, saveCentre } from '@/actions/admin';
import { createClient } from '@/lib/supabase/client';

function Card({ title, description, children, id }: { title: string; description?: string; children: React.ReactNode; id?: string }) {
  const [open, setOpen] = useState(true);
  return (
    <section id={id} className="card overflow-hidden">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left" aria-expanded={open}>
        <div>
          <h2 className="font-display text-base font-bold text-slate-900">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
        </div>
        <ChevronDown className={cn('h-5 w-5 shrink-0 text-slate-400 transition-transform', open && 'rotate-180')} aria-hidden="true" />
      </button>
      {open && <div className="border-t border-slate-100 px-6 py-5">{children}</div>}
    </section>
  );
}

function SaveBar({ onSave, isPending, note }: { onSave: () => void; isPending: boolean; note?: string }) {
  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
      <p className="text-xs text-slate-400">{note ?? 'Changes apply to the live website immediately after saving.'}</p>
      <button type="button" onClick={onSave} disabled={isPending} className="btn-primary btn-sm">
        {isPending ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Saving…</> : <><Save className="h-4 w-4" aria-hidden="true" /> Save section</>}
      </button>
    </div>
  );
}

function ImageUploader({ value, onChange, label }: { value: string | null; onChange: (v: string | null) => void; label: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const upload = async (file: File) => {
    const supabase = createClient();
    if (!supabase) { setErr('Supabase not configured — upload unavailable.'); return; }
    if (file.size > 5 * 1024 * 1024) { setErr('Image must be under 5 MB.'); return; }
    setBusy(true); setErr(null);
    try {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `site/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from('site-images').upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from('site-images').getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (e: any) {
      setErr(e?.message ?? 'Upload failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex items-center gap-4">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt={label} className="h-20 w-28 rounded-xl object-cover ring-1 ring-slate-200" />
        ) : (
          <div className="grid h-20 w-28 place-items-center rounded-xl bg-slate-100 text-xs text-slate-400">No image</div>
        )}
        <div className="flex flex-col gap-2">
          <label className="btn-secondary btn-sm cursor-pointer">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Upload className="h-4 w-4" aria-hidden="true" />}
            {value ? 'Replace' : 'Upload'}
            <input type="file" accept="image/*" className="hidden" disabled={busy} onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }} />
          </label>
          {value && <button type="button" onClick={() => onChange(null)} className="btn-ghost btn-sm text-red-600 hover:bg-red-50">Remove</button>}
        </div>
      </div>
      {err && <p className="error-text">{err}</p>}
    </div>
  );
}

export function ContentEditor({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [flash, setFlash] = useState<string | null>(null);

  const [hero, setHero] = useState(settings.hero);
  const [about, setAbout] = useState(settings.about);
  const [contact, setContact] = useState(settings.contact);
  const [homeCollection, setHomeCollection] = useState(settings.home_collection);
  const [announcement, setAnnouncement] = useState(settings.announcement);
  const [brand, setBrand] = useState(settings.brand);
  const [seo, setSeo] = useState(settings.seo);
  const [centres, setCentres] = useState(
    CENTRES.map((c) => ({ id: c.id, name: c.name, address: c.address, phone: c.phone, hours: c.hours, maps_url: c.mapsUrl }))
  );

  const persist = (key: string, value: unknown) =>
    new Promise<void>((resolve) => {
      startTransition(async () => {
        const res = await saveSetting(key, value);
        setFlash(res.success ? `${key} saved.` : (res.error ?? 'Save failed.'));
        router.refresh();
        setTimeout(() => setFlash(null), 2500);
        resolve();
      });
    });

  return (
    <div className="space-y-5">
      {flash && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">
          {flash}
        </div>
      )}

      {/* Branding / logo */}
      <Card title="Branding & Logo" description="Business name, tagline and the site logo.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Business name</label>
            <input value={brand.name} onChange={(e) => setBrand((b) => ({ ...b, name: e.target.value }))} className="field" />
          </div>
          <div>
            <label className="label">Tagline</label>
            <input value={brand.tagline} onChange={(e) => setBrand((b) => ({ ...b, tagline: e.target.value }))} className="field" />
          </div>
          <div className="sm:col-span-2">
            <ImageUploader label="Logo image (shown in the header)" value={brand.logo_url} onChange={(v) => setBrand((b) => ({ ...b, logo_url: v }))} />
          </div>
        </div>
        <SaveBar isPending={isPending} onSave={() => persist('brand', brand)} />
      </Card>

      {/* Hero */}
      <Card title="Homepage Hero" description="Headline, supporting text and CTA buttons.">
        <div className="grid gap-4">
          <div>
            <label className="label">Eyebrow text</label>
            <input value={hero.eyebrow} onChange={(e) => setHero((h) => ({ ...h, eyebrow: e.target.value }))} className="field" />
          </div>
          <div>
            <label className="label">Headline</label>
            <textarea rows={2} value={hero.headline} onChange={(e) => setHero((h) => ({ ...h, headline: e.target.value }))} className="field" />
          </div>
          <div>
            <label className="label">Subheadline</label>
            <textarea rows={3} value={hero.subheadline} onChange={(e) => setHero((h) => ({ ...h, subheadline: e.target.value }))} className="field" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Primary CTA label</label>
              <input value={hero.primary_cta?.label ?? ''} onChange={(e) => setHero((h) => ({ ...h, primary_cta: { ...h.primary_cta, label: e.target.value } }))} className="field" />
            </div>
            <div>
              <label className="label">Secondary CTA label</label>
              <input value={hero.secondary_cta?.label ?? ''} onChange={(e) => setHero((h) => ({ ...h, secondary_cta: { ...h.secondary_cta, label: e.target.value } }))} className="field" />
            </div>
          </div>
          <div>
            <label className="label">Highlights <span className="font-normal text-slate-400">(one per line)</span></label>
            <textarea rows={3} value={(hero.highlights ?? []).join('\n')} onChange={(e) => setHero((h) => ({ ...h, highlights: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean) }))} className="field" />
          </div>
          <ImageUploader label="Hero image (optional — a branded illustration is used if empty)" value={hero.image_url} onChange={(v) => setHero((h) => ({ ...h, image_url: v }))} />
        </div>
        <SaveBar isPending={isPending} onSave={() => persist('hero', hero)} />
      </Card>

      {/* About */}
      <Card title="About Us Content" description="Mission statement and commitments shown on the About page.">
        <div className="grid gap-4">
          <div>
            <label className="label">Headline</label>
            <textarea rows={2} value={about.headline} onChange={(e) => setAbout((a) => ({ ...a, headline: e.target.value }))} className="field" />
          </div>
          <div>
            <label className="label">Mission</label>
            <textarea rows={3} value={about.mission} onChange={(e) => setAbout((a) => ({ ...a, mission: e.target.value }))} className="field" />
          </div>
          <div>
            <label className="label">Body <span className="font-normal text-slate-400">(separate paragraphs with a blank line)</span></label>
            <textarea rows={6} value={about.body} onChange={(e) => setAbout((a) => ({ ...a, body: e.target.value }))} className="field" />
          </div>
          <div>
            <label className="label">Commitments <span className="font-normal text-slate-400">(one per line)</span></label>
            <textarea rows={5} value={(about.commitments ?? []).join('\n')} onChange={(e) => setAbout((a) => ({ ...a, commitments: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean) }))} className="field" />
          </div>
          <ImageUploader label="About image (optional)" value={about.image_url} onChange={(v) => setAbout((a) => ({ ...a, image_url: v }))} />
        </div>
        <SaveBar isPending={isPending} onSave={() => persist('about', about)} />
      </Card>

      {/* Contact */}
      <Card id="contact" title="Contact Information" description="Phone, WhatsApp, email and opening hours shown site-wide.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Phone</label>
            <input value={contact.phone} onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))} className="field" />
          </div>
          <div>
            <label className="label">WhatsApp number <span className="font-normal text-slate-400">(with country code, digits only)</span></label>
            <input value={contact.whatsapp} onChange={(e) => setContact((c) => ({ ...c, whatsapp: e.target.value.replace(/\D/g, '') }))} className="field" placeholder="919101090862" />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" value={contact.email} onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))} className="field" />
          </div>
          <div>
            <label className="label">Website</label>
            <input value={contact.website} onChange={(e) => setContact((c) => ({ ...c, website: e.target.value }))} className="field" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Opening hours</label>
            <input value={contact.hours} onChange={(e) => setContact((c) => ({ ...c, hours: e.target.value }))} className="field" />
            <p className="hint">⚠ Confirm these hours with the owner before launch.</p>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Owner name</label>
            <input value={contact.owner} onChange={(e) => setContact((c) => ({ ...c, owner: e.target.value }))} className="field" />
          </div>
        </div>
        <SaveBar isPending={isPending} onSave={() => persist('contact', contact)} note="Saving here updates the header, footer, contact page and WhatsApp buttons." />
      </Card>

      {/* Centres */}
      <Card title="Our Centres" description="Addresses, phone and map links for both locations.">
        <div className="grid gap-6 lg:grid-cols-2">
          {centres.map((c, i) => (
            <div key={c.id} className="rounded-xl border border-slate-200 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-brand-700">{c.id === 'dhekiajuli' ? 'Centre 1' : 'Centre 2'}</p>
              <div className="grid gap-3">
                <div>
                  <label className="label">Name</label>
                  <input value={c.name} onChange={(e) => setCentres((cs) => cs.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} className="field" />
                </div>
                <div>
                  <label className="label">Full address</label>
                  <textarea rows={3} value={c.address} onChange={(e) => setCentres((cs) => cs.map((x, j) => j === i ? { ...x, address: e.target.value } : x))} className="field" />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input value={c.phone} onChange={(e) => setCentres((cs) => cs.map((x, j) => j === i ? { ...x, phone: e.target.value } : x))} className="field" />
                </div>
                <div>
                  <label className="label">Opening hours</label>
                  <input value={c.hours} onChange={(e) => setCentres((cs) => cs.map((x, j) => j === i ? { ...x, hours: e.target.value } : x))} className="field" />
                </div>
                <div>
                  <label className="label">Google Maps link</label>
                  <input value={c.maps_url} onChange={(e) => setCentres((cs) => cs.map((x, j) => j === i ? { ...x, maps_url: e.target.value } : x))} className="field" />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button type="button" disabled={isPending} onClick={() => startTransition(async () => { await saveCentre(c.id, c); setFlash(`${c.name} saved.`); router.refresh(); setTimeout(() => setFlash(null), 2500); })} className="btn-primary btn-sm">
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <><Save className="h-4 w-4" aria-hidden="true" /> Save {c.name}</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Home collection */}
      <Card title="Home Sample Collection" description="Content for the home collection section and page.">
        <div className="grid gap-4">
          <div>
            <label className="label">Headline</label>
            <input value={homeCollection.headline} onChange={(e) => setHomeCollection((h) => ({ ...h, headline: e.target.value }))} className="field" />
          </div>
          <div>
            <label className="label">Body</label>
            <textarea rows={3} value={homeCollection.body} onChange={(e) => setHomeCollection((h) => ({ ...h, body: e.target.value }))} className="field" />
          </div>
          <div>
            <label className="label">Steps <span className="font-normal text-slate-400">(format: Title | Description — one per line)</span></label>
            <textarea rows={4} value={(homeCollection.steps ?? []).map((s) => `${s.title} | ${s.body}`).join('\n')} onChange={(e) => setHomeCollection((h) => ({ ...h, steps: e.target.value.split('\n').map((line) => { const [title, body] = line.split('|').map((s) => s.trim()); return title ? { title, body: body ?? '' } : null; }).filter(Boolean) as any }))} className="field" />
          </div>
        </div>
        <SaveBar isPending={isPending} onSave={() => persist('home_collection', homeCollection)} />
      </Card>

      {/* Announcement */}
      <Card title="Announcement Bar" description="Optional banner shown at the very top of the site.">
        <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3.5">
          <input type="checkbox" checked={announcement.enabled} onChange={(e) => setAnnouncement((a) => ({ ...a, enabled: e.target.checked }))} className="h-4 w-4 accent-brand-600" />
          <span className="text-sm font-medium text-slate-700">Show announcement bar</span>
        </label>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-3">
            <label className="label">Announcement text</label>
            <input value={announcement.text} onChange={(e) => setAnnouncement((a) => ({ ...a, text: e.target.value }))} className="field" />
          </div>
          <div>
            <label className="label">Link (href)</label>
            <input value={announcement.link_href} onChange={(e) => setAnnouncement((a) => ({ ...a, link_href: e.target.value }))} className="field" placeholder="/home-collection" />
          </div>
          <div>
            <label className="label">Link label</label>
            <input value={announcement.link_label} onChange={(e) => setAnnouncement((a) => ({ ...a, link_label: e.target.value }))} className="field" placeholder="Learn more" />
          </div>
        </div>
        <SaveBar isPending={isPending} onSave={() => persist('announcement', announcement)} />
      </Card>

      {/* SEO */}
      <Card title="SEO" description="Meta description and keywords used across the site.">
        <div className="grid gap-4">
          <div>
            <label className="label">Meta description</label>
            <textarea rows={3} value={seo.meta_description} onChange={(e) => setSeo((s) => ({ ...s, meta_description: e.target.value }))} className="field" />
            <p className="hint">{seo.meta_description.length} characters — aim for 140–160.</p>
          </div>
          <div>
            <label className="label">Keywords <span className="font-normal text-slate-400">(one per line)</span></label>
            <textarea rows={4} value={(seo.keywords ?? []).join('\n')} onChange={(e) => setSeo((s) => ({ ...s, keywords: e.target.value.split('\n').map((k) => k.trim()).filter(Boolean) }))} className="field" />
          </div>
        </div>
        <SaveBar isPending={isPending} onSave={() => persist('seo', seo)} />
      </Card>
    </div>
  );
}

export type { Category };
export { Plus, Trash2 };
