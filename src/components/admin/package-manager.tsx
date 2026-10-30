'use client';

// Health package manager with image upload to Supabase Storage.
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, X, Loader2, Upload, Eye, EyeOff } from 'lucide-react';
import type { Package } from '@/lib/types';
import { formatPrice, cn } from '@/lib/utils';
import { savePackage, deletePackage, type PackageInput } from '@/actions/admin';
import { createClient } from '@/lib/supabase/client';
import { EmptyState } from '@/components/ui';

function PackageEditor({ pkg, onClose }: { pkg?: Package | null; onClose: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<PackageInput & { includes_text?: string }>({
    id: pkg?.id,
    name: pkg?.name ?? '',
    description: pkg?.description ?? '',
    long_description: pkg?.long_description ?? '',
    price: pkg?.price ?? null,
    mrp: pkg?.mrp ?? null,
    image_url: pkg?.image_url ?? null,
    test_count: pkg?.test_count ?? null,
    fasting_required: pkg?.fasting_required ?? false,
    report_time: pkg?.report_time ?? '',
    is_popular: pkg?.is_popular ?? false,
    is_published: pkg?.is_published ?? false,
    sort_order: pkg?.sort_order ?? 0,
    includes_text: pkg?.includes?.join('\n') ?? '',
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const uploadImage = async (file: File) => {
    const supabase = createClient();
    if (!supabase) { setError('Supabase is not configured — image upload unavailable.'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5 MB.'); return; }

    setUploading(true);
    setError(null);
    try {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `packages/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage.from('package-images').upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from('package-images').getPublicUrl(path);
      set('image_url', data.publicUrl);
    } catch (e: any) {
      setError(e?.message ?? 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const includes = (form.includes_text ?? '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    startTransition(async () => {
      const res = await savePackage({ ...form, includes });
      if (res.success) { router.refresh(); onClose(); }
      else setError(res.error ?? 'Failed to save.');
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={pkg ? 'Edit package' : 'Add package'}>
      <div className="relative my-8 w-full max-w-2xl animate-fade-up rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between rounded-t-2xl border-b border-slate-100 bg-white px-6 py-4">
          <h2 className="font-display text-lg font-bold text-slate-900">{pkg ? 'Edit package' : 'Add health package'}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">{error}</div>}

          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="p-name" className="label">Package name <span className="text-red-500">*</span></label>
              <input id="p-name" required value={form.name} onChange={(e) => set('name', e.target.value)} className="field" placeholder="e.g. Full Body Checkup" />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="p-desc" className="label">Short description</label>
              <input id="p-desc" value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} className="field" placeholder="One-line summary" />
            </div>

            <div>
              <label htmlFor="p-price" className="label">Price (₹)</label>
              <input id="p-price" type="number" min="0" step="0.01" value={form.price ?? ''} onChange={(e) => set('price', e.target.value === '' ? null : Number(e.target.value))} className="field" placeholder="Leave blank if not finalised" />
            </div>
            <div>
              <label htmlFor="p-mrp" className="label">MRP (₹) <span className="font-normal text-slate-400">(optional)</span></label>
              <input id="p-mrp" type="number" min="0" step="0.01" value={form.mrp ?? ''} onChange={(e) => set('mrp', e.target.value === '' ? null : Number(e.target.value))} className="field" />
            </div>

            <div>
              <label htmlFor="p-count" className="label">Tests included (count)</label>
              <input id="p-count" type="number" min="0" value={form.test_count ?? ''} onChange={(e) => set('test_count', e.target.value === '' ? null : Number(e.target.value))} className="field" />
            </div>
            <div>
              <label htmlFor="p-report" className="label">Report turnaround</label>
              <input id="p-report" value={form.report_time ?? ''} onChange={(e) => set('report_time', e.target.value)} className="field" placeholder="e.g. Same day" />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="p-includes" className="label">Included tests <span className="font-normal text-slate-400">(one per line)</span></label>
              <textarea id="p-includes" rows={5} value={form.includes_text} onChange={(e) => set('includes_text', e.target.value)} className="field" placeholder={'Complete Blood Count (CBC)\nBlood Sugar Fasting\nLipid Profile'} />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="p-long" className="label">Long description</label>
              <textarea id="p-long" rows={3} value={form.long_description ?? ''} onChange={(e) => set('long_description', e.target.value)} className="field" placeholder="Detailed information shown on the package page" />
            </div>

            {/* Image upload */}
            <div className="sm:col-span-2">
              <label className="label">Package image</label>
              <div className="flex items-center gap-4">
                {form.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.image_url} alt="Package" className="h-20 w-28 rounded-xl object-cover ring-1 ring-slate-200" />
                ) : (
                  <div className="grid h-20 w-28 place-items-center rounded-xl bg-slate-100 text-slate-400">
                    <Upload className="h-5 w-5" aria-hidden="true" />
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <label className="btn-secondary btn-sm cursor-pointer">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Upload className="h-4 w-4" aria-hidden="true" />}
                    {form.image_url ? 'Replace image' : 'Upload image'}
                    <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); }} />
                  </label>
                  {form.image_url && (
                    <button type="button" onClick={() => set('image_url', null)} className="btn-ghost btn-sm text-red-600 hover:bg-red-50">Remove</button>
                  )}
                  <p className="text-[11px] text-slate-400">JPG/PNG/WebP, max 5 MB</p>
                </div>
              </div>
            </div>

            <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3.5">
              <input type="checkbox" checked={form.fasting_required} onChange={(e) => set('fasting_required', e.target.checked)} className="h-4 w-4 accent-teal-600" />
              <span className="text-sm font-medium text-slate-700">Fasting required</span>
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3.5">
              <input type="checkbox" checked={form.is_popular} onChange={(e) => set('is_popular', e.target.checked)} className="h-4 w-4 accent-brand-600" />
              <span className="text-sm font-medium text-slate-700">Mark as popular</span>
            </label>

            <div>
              <label htmlFor="p-sort" className="label">Sort order</label>
              <input id="p-sort" type="number" value={form.sort_order ?? 0} onChange={(e) => set('sort_order', Number(e.target.value))} className="field" />
            </div>
            <label className="flex items-center gap-3 self-end rounded-xl border border-slate-200 p-3.5">
              <input type="checkbox" checked={form.is_published} onChange={(e) => set('is_published', e.target.checked)} className="h-4 w-4 accent-teal-600" />
              <span className="text-sm font-medium text-slate-700">Published (visible on site)</span>
            </label>

            <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4 sm:col-span-2">
              <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={isPending || uploading} className="btn-primary">
                {isPending ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Saving…</> : pkg ? 'Save changes' : 'Add package'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function PackageManager({ packages }: { packages: Package[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Package | null | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  const togglePublish = (p: Package) =>
    startTransition(async () => {
      await savePackage({ id: p.id, name: p.name, is_published: !p.is_published });
      router.refresh();
    });

  const remove = async (p: Package) => {
    if (!window.confirm(`Delete the package "${p.name}"? This cannot be undone.`)) return;
    await deletePackage(p.id);
    router.refresh();
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button type="button" onClick={() => setEditing(null)} className="btn-primary">
          <Plus className="h-4 w-4" aria-hidden="true" /> Add package
        </button>
      </div>

      {packages.length === 0 ? (
        <div className="card p-6">
          <EmptyState
            title="No packages yet"
            description="Create health packages with images, included tests and pricing. Unpublished packages stay hidden from the public site."
            action={<button type="button" onClick={() => setEditing(null)} className="btn-primary btn-sm"><Plus className="h-4 w-4" aria-hidden="true" /> Add package</button>}
          />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {packages.map((p) => (
            <article key={p.id} className="card overflow-hidden">
              {p.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image_url} alt={p.name} className="h-40 w-full object-cover" loading="lazy" />
              ) : (
                <div className="gradient-brand h-20" aria-hidden="true" />
              )}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display font-bold text-slate-900">{p.name}</h3>
                  <span className={cn('badge capitalize', p.is_published ? 'badge-success' : 'badge-neutral')}>
                    {p.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="mt-1.5 line-clamp-2 text-sm text-slate-600">{p.description}</p>

                <dl className="mt-3 space-y-1 text-xs text-slate-500">
                  <div className="flex justify-between"><dt>Price</dt><dd className="font-semibold text-brand-700">{formatPrice(p.price)}</dd></div>
                  {p.test_count && <div className="flex justify-between"><dt>Tests</dt><dd>{p.test_count}</dd></div>}
                  <div className="flex justify-between"><dt>Included list</dt><dd>{p.includes?.length ?? 0} items</dd></div>
                </dl>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                  <button type="button" onClick={() => setEditing(p)} className="btn-secondary btn-sm flex-1">
                    <Pencil className="h-4 w-4" aria-hidden="true" /> Edit
                  </button>
                  <button type="button" onClick={() => togglePublish(p)} disabled={isPending} className="btn-secondary btn-sm" aria-label="Toggle publish">
                    {p.is_published ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                  </button>
                  <button type="button" onClick={() => remove(p)} className="btn-ghost btn-sm text-red-600 hover:bg-red-50" aria-label="Delete package">
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {editing !== undefined && <PackageEditor pkg={editing} onClose={() => setEditing(undefined)} />}
    </div>
  );
}
