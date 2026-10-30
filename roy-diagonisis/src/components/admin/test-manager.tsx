'use client';

// Full CRUD for tests and categories, with inline edit forms in a modal.
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, X, Loader2, ChevronDown } from 'lucide-react';
import type { Category, Test } from '@/lib/types';
import { formatPrice, cn, slugify } from '@/lib/utils';
import {
  saveTest, deleteTest, toggleTestActive, saveCategory, deleteCategory,
  type TestInput,
} from '@/actions/admin';
import { EmptyState } from '@/components/ui';

const ICON_OPTIONS = ['TestTubes','Droplets','Activity','Zap','Gauge','HeartPulse','Droplet','Heart','ClipboardList','Microscope','FlaskConical','Stethoscope','Scan','Dna','Syringe'];

// ---------------------------------------------------------------------------
// Modal shell
// ---------------------------------------------------------------------------
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={title}>
      <div className="relative my-8 w-full max-w-2xl animate-fade-up rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between gap-4 rounded-t-2xl border-b border-slate-100 bg-white px-6 py-4">
          <h2 className="font-display text-lg font-bold text-slate-900">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Test editor
// ---------------------------------------------------------------------------
function TestEditor({
  test, categories, onClose,
}: { test?: Test | null; categories: Category[]; onClose: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<TestInput>({
    id: test?.id,
    name: test?.name ?? '',
    category_id: test?.category_id ?? categories[0]?.id ?? null,
    short_description: test?.short_description ?? '',
    description: test?.description ?? '',
    price: test?.price ?? null,
    mrp: test?.mrp ?? null,
    preparation: test?.preparation ?? '',
    report_time: test?.report_time ?? '',
    sample_type: test?.sample_type ?? '',
    is_popular: test?.is_popular ?? false,
    is_active: test?.is_active ?? true,
    sort_order: test?.sort_order ?? 0,
  });

  const set = <K extends keyof TestInput>(k: K, v: TestInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await saveTest(form);
      if (res.success) {
        router.refresh();
        onClose();
      } else {
        setError(res.error ?? 'Failed to save.');
      }
    });
  };

  return (
    <Modal title={test ? 'Edit test' : 'Add a new test'} onClose={onClose}>
      {error && (
        <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">{error}</div>
      )}
      <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="t-name" className="label">Test name <span className="text-red-500">*</span></label>
          <input id="t-name" required value={form.name} onChange={(e) => set('name', e.target.value)} className="field" placeholder="e.g. Thyroid Profile (T3, T4, TSH)" />
        </div>

        <div>
          <label htmlFor="t-cat" className="label">Category</label>
          <select id="t-cat" value={form.category_id ?? ''} onChange={(e) => set('category_id', e.target.value || null)} className="field">
            <option value="">Uncategorised</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="t-sample" className="label">Sample type</label>
          <input id="t-sample" value={form.sample_type ?? ''} onChange={(e) => set('sample_type', e.target.value)} className="field" placeholder="Blood / Serum / Urine" />
        </div>

        <div>
          <label htmlFor="t-price" className="label">Price (₹)</label>
          <input id="t-price" type="number" min="0" step="0.01" value={form.price ?? ''} onChange={(e) => set('price', e.target.value === '' ? null : Number(e.target.value))} className="field" placeholder="Leave blank for 'Price on request'" />
        </div>

        <div>
          <label htmlFor="t-mrp" className="label">MRP (₹) <span className="font-normal text-slate-400">(optional)</span></label>
          <input id="t-mrp" type="number" min="0" step="0.01" value={form.mrp ?? ''} onChange={(e) => set('mrp', e.target.value === '' ? null : Number(e.target.value))} className="field" placeholder="Struck-through price" />
        </div>

        <div>
          <label htmlFor="t-report" className="label">Report turnaround</label>
          <input id="t-report" value={form.report_time ?? ''} onChange={(e) => set('report_time', e.target.value)} className="field" placeholder="e.g. Same day" />
        </div>

        <div>
          <label htmlFor="t-sort" className="label">Sort order</label>
          <input id="t-sort" type="number" value={form.sort_order ?? 0} onChange={(e) => set('sort_order', Number(e.target.value))} className="field" />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="t-short" className="label">Short description</label>
          <input id="t-short" value={form.short_description ?? ''} onChange={(e) => set('short_description', e.target.value)} className="field" placeholder="One-line summary shown on cards" />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="t-desc" className="label">Full description</label>
          <textarea id="t-desc" rows={4} value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} className="field" placeholder="What the test measures and when it is advised" />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="t-prep" className="label">Preparation instructions</label>
          <textarea id="t-prep" rows={2} value={form.preparation ?? ''} onChange={(e) => set('preparation', e.target.value)} className="field" placeholder="e.g. Fast for 8–10 hours. Water is allowed." />
        </div>

        <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 sm:col-span-1">
          <input type="checkbox" checked={form.is_popular} onChange={(e) => set('is_popular', e.target.checked)} className="h-4 w-4 accent-brand-600" />
          <span className="text-sm font-medium text-slate-700">Show as popular</span>
        </label>

        <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 sm:col-span-1">
          <input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} className="h-4 w-4 accent-teal-600" />
          <span className="text-sm font-medium text-slate-700">Active (visible on site)</span>
        </label>

        <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4 sm:col-span-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={isPending} className="btn-primary">
            {isPending ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Saving…</> : test ? 'Save changes' : 'Add test'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Category editor
// ---------------------------------------------------------------------------
function CategoryEditor({ category, onClose }: { category?: Category | null; onClose: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    id: category?.id,
    name: category?.name ?? '',
    description: category?.description ?? '',
    icon: category?.icon ?? 'TestTubes',
    colour: category?.colour ?? 'brand',
    sort_order: category?.sort_order ?? 0,
    is_active: category?.is_active ?? true,
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await saveCategory(form);
      if (res.success) { router.refresh(); onClose(); }
      else setError(res.error ?? 'Failed to save.');
    });
  };

  return (
    <Modal title={category ? 'Edit category' : 'Add category'} onClose={onClose}>
      {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">{error}</div>}
      <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="c-name" className="label">Category name <span className="text-red-500">*</span></label>
          <input id="c-name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="field" placeholder="e.g. Thyroid Tests" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="c-desc" className="label">Description</label>
          <textarea id="c-desc" rows={2} value={form.description ?? ''} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="field" />
        </div>
        <div>
          <label htmlFor="c-icon" className="label">Icon</label>
          <select id="c-icon" value={form.icon ?? 'TestTubes'} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} className="field">
            {ICON_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="c-colour" className="label">Accent colour</label>
          <select id="c-colour" value={form.colour ?? 'brand'} onChange={(e) => setForm((f) => ({ ...f, colour: e.target.value }))} className="field">
            <option value="brand">Blue</option>
            <option value="teal">Teal</option>
          </select>
        </div>
        <div>
          <label htmlFor="c-sort" className="label">Sort order</label>
          <input id="c-sort" type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))} className="field" />
        </div>
        <label className="flex items-center gap-3 self-end rounded-xl border border-slate-200 p-3.5">
          <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} className="h-4 w-4 accent-teal-600" />
          <span className="text-sm font-medium text-slate-700">Active</span>
        </label>
        <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4 sm:col-span-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={isPending} className="btn-primary">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Main manager
// ---------------------------------------------------------------------------
export function TestManager({ tests, categories }: { tests: Test[]; categories: Category[] }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [editingTest, setEditingTest] = useState<Test | null | undefined>(undefined);
  const [editingCat, setEditingCat] = useState<Category | null | undefined>(undefined);
  const [showCats, setShowCats] = useState(false);
  const [isPending, startTransition] = useTransition();

  const filtered = tests.filter((t) => {
    const matchesQ = !query || t.name.toLowerCase().includes(query.toLowerCase());
    const matchesCat = !filterCat || t.category_id === filterCat;
    return matchesQ && matchesCat;
  });

  const toggle = (t: Test) =>
    startTransition(async () => {
      await toggleTestActive(t.id, !t.is_active);
      router.refresh();
    });

  const remove = async (t: Test) => {
    if (!window.confirm(`Delete the test "${t.name}"? This cannot be undone.`)) return;
    await deleteTest(t.id);
    router.refresh();
  };

  const removeCat = async (c: Category) => {
    if (!window.confirm(`Delete the category "${c.name}"? Tests in it will become uncategorised.`)) return;
    const res = await deleteCategory(c.id);
    if (!res.success) window.alert(res.error ?? 'Could not delete.');
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="card p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tests…" aria-label="Search tests" className="field" />
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} aria-label="Filter by category" className="field">
            <option value="">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div className="flex gap-2">
            <button type="button" onClick={() => setEditingTest(null)} className="btn-primary flex-1">
              <Plus className="h-4 w-4" aria-hidden="true" /> Add test
            </button>
            <button type="button" onClick={() => setEditingCat(null)} className="btn-secondary">
              <Plus className="h-4 w-4" aria-hidden="true" /> Category
            </button>
          </div>
        </div>
      </div>

      {/* Categories panel */}
      <div className="card overflow-hidden">
        <button
          type="button"
          onClick={() => setShowCats((v) => !v)}
          className="flex w-full items-center justify-between px-5 py-4 text-left"
          aria-expanded={showCats}
        >
          <span className="font-display text-base font-bold text-slate-900">
            Categories ({categories.length})
          </span>
          <ChevronDown className={cn('h-5 w-5 text-slate-400 transition-transform', showCats && 'rotate-180')} aria-hidden="true" />
        </button>

        {showCats && (
          <div className="border-t border-slate-100">
            <ul className="divide-y divide-slate-100">
              {categories.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">{c.name}</p>
                    <p className="truncate text-xs text-slate-500">{c.description}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button type="button" onClick={() => setEditingCat(c)} className="btn-ghost btn-sm" aria-label={`Edit ${c.name}`}>
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button type="button" onClick={() => removeCat(c)} className="btn-ghost btn-sm text-red-600 hover:bg-red-50" aria-label={`Delete ${c.name}`}>
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Tests table */}
      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No tests found"
              description={query || filterCat ? 'Try adjusting your search or filters.' : 'Add your first test to build the public catalogue.'}
              action={<button type="button" onClick={() => setEditingTest(null)} className="btn-primary btn-sm"><Plus className="h-4 w-4" aria-hidden="true" /> Add test</button>}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table min-w-[860px]">
              <thead>
                <tr>
                  <th>Test</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Report</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} className={cn(!t.is_active && 'opacity-60')}>
                    <td>
                      <p className="font-medium text-slate-900">{t.name}</p>
                      {t.short_description && <p className="max-w-[280px] truncate text-xs text-slate-500">{t.short_description}</p>}
                      {t.is_popular && <span className="badge-info mt-1">Popular</span>}
                    </td>
                    <td className="text-sm">{t.category?.name ?? '—'}</td>
                    <td className="font-semibold text-brand-700">{formatPrice(t.price)}</td>
                    <td className="text-sm">{t.report_time ?? '—'}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => toggle(t)}
                        disabled={isPending}
                        className={cn('badge capitalize', t.is_active ? 'badge-success' : 'badge-neutral')}
                        title="Click to toggle visibility"
                      >
                        {t.is_active ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => setEditingTest(t)} className="btn-ghost btn-sm" aria-label={`Edit ${t.name}`}>
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button type="button" onClick={() => remove(t)} className="btn-ghost btn-sm text-red-600 hover:bg-red-50 hover:text-red-700" aria-label={`Delete ${t.name}`}>
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingTest !== undefined && (
        <TestEditor test={editingTest} categories={categories} onClose={() => setEditingTest(undefined)} />
      )}
      {editingCat !== undefined && (
        <CategoryEditor category={editingCat} onClose={() => setEditingCat(undefined)} />
      )}
    </div>
  );
}

export { slugify };
