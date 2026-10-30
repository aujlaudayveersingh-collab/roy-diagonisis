'use client';

// Testimonials manager — reviews are only shown publicly after an admin marks
// them visible. No reviews are ever fabricated.
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, X, Loader2, Eye, EyeOff, Star } from 'lucide-react';
import type { Testimonial } from '@/lib/types';
import { cn } from '@/lib/utils';
import { saveTestimonial, deleteTestimonial } from '@/actions/admin';
import { EmptyState } from '@/components/ui';

function Editor({ item, onClose }: { item?: Testimonial | null; onClose: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    id: item?.id,
    name: item?.name ?? '',
    location: item?.location ?? '',
    rating: item?.rating ?? 5,
    message: item?.message ?? '',
    is_visible: item?.is_visible ?? false,
    sort_order: item?.sort_order ?? 0,
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await saveTestimonial(form);
      if (res.success) { router.refresh(); onClose(); }
      else setError(res.error ?? 'Failed to save.');
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={item ? 'Edit testimonial' : 'Add testimonial'}>
      <div className="relative my-8 w-full max-w-xl animate-fade-up rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between rounded-t-2xl border-b border-slate-100 bg-white px-6 py-4">
          <h2 className="font-display text-lg font-bold text-slate-900">{item ? 'Edit testimonial' : 'Add testimonial'}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5">
          {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">{error}</div>}
          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="tm-name" className="label">Patient name <span className="text-red-500">*</span></label>
              <input id="tm-name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="field" placeholder="e.g. Rina Das" />
            </div>
            <div>
              <label htmlFor="tm-loc" className="label">Location</label>
              <input id="tm-loc" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} className="field" placeholder="e.g. Dhekiajuli" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="tm-msg" className="label">Review message <span className="text-red-500">*</span></label>
              <textarea id="tm-msg" rows={4} required value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} className="field" placeholder="The patient's own words (with their permission)." />
            </div>
            <div>
              <label className="label">Rating</label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button key={r} type="button" onClick={() => setForm((f) => ({ ...f, rating: r }))} aria-label={`${r} star`}>
                    <Star className={cn('h-6 w-6', r <= form.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300')} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="tm-sort" className="label">Sort order</label>
              <input id="tm-sort" type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))} className="field" />
            </div>
            <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 sm:col-span-2">
              <input type="checkbox" checked={form.is_visible} onChange={(e) => setForm((f) => ({ ...f, is_visible: e.target.checked }))} className="h-4 w-4 accent-teal-600" />
              <span className="text-sm font-medium text-slate-700">Show on the website</span>
            </label>
            <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4 sm:col-span-2">
              <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={isPending} className="btn-primary">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function TestimonialManager({ items }: { items: Testimonial[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Testimonial | null | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  const toggle = (t: Testimonial) =>
    startTransition(async () => {
      await saveTestimonial({ id: t.id, name: t.name, message: t.message, location: t.location ?? undefined, rating: t.rating, sort_order: t.sort_order, is_visible: !t.is_visible });
      router.refresh();
    });

  const remove = async (t: Testimonial) => {
    if (!window.confirm(`Delete the review from ${t.name}?`)) return;
    await deleteTestimonial(t.id);
    router.refresh();
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button type="button" onClick={() => setEditing(null)} className="btn-primary">
          <Plus className="h-4 w-4" aria-hidden="true" /> Add testimonial
        </button>
      </div>

      {items.length === 0 ? (
        <div className="card p-6">
          <EmptyState
            title="No testimonials yet"
            description="Add genuine patient reviews here. Only testimonials you mark as visible appear on the website — reviews are never fabricated."
            action={<button type="button" onClick={() => setEditing(null)} className="btn-primary btn-sm"><Plus className="h-4 w-4" aria-hidden="true" /> Add testimonial</button>}
          />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((t) => (
            <article key={t.id} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <Star key={r} className={cn('h-4 w-4', r <= t.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200')} aria-hidden="true" />
                  ))}
                </div>
                <span className={cn('badge capitalize', t.is_visible ? 'badge-success' : 'badge-neutral')}>
                  {t.is_visible ? 'Visible' : 'Hidden'}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-700">“{t.message}”</p>
              <p className="mt-3 text-sm font-semibold text-slate-900">{t.name}{t.location ? ` · ${t.location}` : ''}</p>
              <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
                <button type="button" onClick={() => setEditing(t)} className="btn-secondary btn-sm flex-1">
                  <Pencil className="h-4 w-4" aria-hidden="true" /> Edit
                </button>
                <button type="button" onClick={() => toggle(t)} disabled={isPending} className="btn-secondary btn-sm" aria-label="Toggle visibility">
                  {t.is_visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
                <button type="button" onClick={() => remove(t)} className="btn-ghost btn-sm text-red-600 hover:bg-red-50" aria-label="Delete">
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {editing !== undefined && <Editor item={editing} onClose={() => setEditing(undefined)} />}
    </div>
  );
}
