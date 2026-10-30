'use server';

// =============================================================================
// Admin server actions — every action re-checks the caller's admin role
// server-side (defence in depth beyond middleware).
// =============================================================================
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/supabase/auth';
import { slugify } from '@/lib/utils';
import { ADMIN_EMAIL_DOMAIN } from '@/lib/constants';
import type { ActionResult } from '@/lib/types';

const OK = () => ({ success: true as const });

async function requireSupabaseAdmin() {
  const admin = await requireAdmin();
  if (!admin) return { error: 'Not authorised.' as const };
  const supabase = await createClient();
  if (!supabase) return { error: 'Database not configured.' as const };
  return { admin, supabase };
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export async function signIn(identifier: string, password: string): Promise<ActionResult> {
  if (!identifier || !password)
    return { success: false, error: 'Enter your username and password.' };
  const supabase = await createClient();
  if (!supabase) return { success: false, error: 'Supabase is not configured.' };

  // Supabase Auth identifies users by email. A username (no "@") is mapped to
  // its canonical admin email; a value containing "@" is used as-is (backwards
  // compatible with direct email login). The password is verified by Supabase
  // against its hashed store — it is never handled or stored in our code.
  const trimmed = identifier.trim();
  const email = trimmed.includes('@')
    ? trimmed.toLowerCase()
    : `${trimmed.toLowerCase()}@${ADMIN_EMAIL_DOMAIN}`;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    // Do not leak whether the account exists.
    return { success: false, error: 'Invalid username or password.' };
  }
  return OK();
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  redirect('/admin/login');
}

// ---------------------------------------------------------------------------
// Bookings
// ---------------------------------------------------------------------------
export interface BookingFilters {
  q?: string;
  status?: string;
  centre?: string;
  dateFrom?: string;
  dateTo?: string;
}

export async function updateBookingStatus(
  id: string,
  status: string
): Promise<ActionResult> {
  const ctx = await requireSupabaseAdmin();
  if ('error' in ctx) return { success: false, error: ctx.error };

  const allowed = ['new', 'pending', 'confirmed', 'completed', 'cancelled'];
  if (!allowed.includes(status)) return { success: false, error: 'Invalid status.' };

  const { error } = await ctx.supabase.from('bookings').update({ status }).eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/bookings');
  revalidatePath('/admin');
  return OK();
}

export async function updateBookingNotes(id: string, notes: string): Promise<ActionResult> {
  const ctx = await requireSupabaseAdmin();
  if ('error' in ctx) return { success: false, error: ctx.error };

  const { error } = await ctx.supabase
    .from('bookings')
    .update({ internal_notes: notes.slice(0, 2000) })
    .eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/bookings');
  return OK();
}

export async function deleteBooking(id: string): Promise<ActionResult> {
  const ctx = await requireSupabaseAdmin();
  if ('error' in ctx) return { success: false, error: ctx.error };

  const { error } = await ctx.supabase.from('bookings').delete().eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/bookings');
  revalidatePath('/admin');
  return OK();
}

// ---------------------------------------------------------------------------
// Enquiries
// ---------------------------------------------------------------------------
export async function updateEnquiryStatus(id: string, status: string): Promise<ActionResult> {
  const ctx = await requireSupabaseAdmin();
  if ('error' in ctx) return { success: false, error: ctx.error };
  if (!['new', 'in_progress', 'resolved'].includes(status))
    return { success: false, error: 'Invalid status.' };

  const { error } = await ctx.supabase.from('enquiries').update({ status }).eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/enquiries');
  revalidatePath('/admin');
  return OK();
}

export async function deleteEnquiry(id: string): Promise<ActionResult> {
  const ctx = await requireSupabaseAdmin();
  if ('error' in ctx) return { success: false, error: ctx.error };

  const { error } = await ctx.supabase.from('enquiries').delete().eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/enquiries');
  revalidatePath('/admin');
  return OK();
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
export interface TestInput {
  id?: string;
  name: string;
  category_id?: string | null;
  short_description?: string;
  description?: string;
  price?: number | null;
  mrp?: number | null;
  preparation?: string;
  report_time?: string;
  sample_type?: string;
  is_popular?: boolean;
  is_active?: boolean;
  sort_order?: number;
}

export async function saveTest(input: TestInput): Promise<ActionResult<{ id: string }>> {
  const ctx = await requireSupabaseAdmin();
  if ('error' in ctx) return { success: false, error: ctx.error };

  if (!input.name || input.name.trim().length < 2)
    return { success: false, error: 'Test name is required.' };

  const payload = {
    name: input.name.trim(),
    slug: slugify(input.name) + (input.id ? '' : `-${Date.now().toString(36).slice(-4)}`),
    category_id: input.category_id || null,
    short_description: input.short_description?.trim() || null,
    description: input.description?.trim() || null,
    price: input.price ?? null,
    mrp: input.mrp ?? null,
    preparation: input.preparation?.trim() || null,
    report_time: input.report_time?.trim() || null,
    sample_type: input.sample_type?.trim() || null,
    is_popular: input.is_popular ?? false,
    is_active: input.is_active ?? true,
    sort_order: input.sort_order ?? 0,
  };

  try {
    if (input.id) {
      // Slug is preserved on update so existing links stay valid.
      const { data, error } = await ctx.supabase
        .from('tests')
        .update(payload)
        .eq('id', input.id)
        .select('id')
        .single();
      if (error) return { success: false, error: error.message };
      revalidatePath('/admin/tests');
      revalidatePath('/tests');
      return { success: true, data: { id: data.id } };
    }

    const { data, error } = await ctx.supabase.from('tests').insert(payload).select('id').single();
    if (error) return { success: false, error: error.message };
    revalidatePath('/admin/tests');
    revalidatePath('/tests');
    return { success: true, data: { id: data.id } };
  } catch (e: any) {
    return { success: false, error: e?.message ?? 'Failed to save test.' };
  }
}

export async function toggleTestActive(id: string, isActive: boolean): Promise<ActionResult> {
  const ctx = await requireSupabaseAdmin();
  if ('error' in ctx) return { success: false, error: ctx.error };

  const { error } = await ctx.supabase.from('tests').update({ is_active: isActive }).eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/tests');
  revalidatePath('/tests');
  return OK();
}

export async function deleteTest(id: string): Promise<ActionResult> {
  const ctx = await requireSupabaseAdmin();
  if ('error' in ctx) return { success: false, error: ctx.error };

  const { error } = await ctx.supabase.from('tests').delete().eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/tests');
  revalidatePath('/tests');
  revalidatePath('/');
  return OK();
}

export async function saveCategory(input: {
  id?: string;
  name: string;
  description?: string;
  icon?: string;
  colour?: string;
  sort_order?: number;
  is_active?: boolean;
}): Promise<ActionResult<{ id: string }>> {
  const ctx = await requireSupabaseAdmin();
  if ('error' in ctx) return { success: false, error: ctx.error };
  if (!input.name || input.name.trim().length < 2)
    return { success: false, error: 'Category name is required.' };

  const payload = {
    name: input.name.trim(),
    slug: input.id ? undefined : slugify(input.name),
    description: input.description?.trim() || null,
    icon: input.icon || 'TestTubes',
    colour: input.colour || 'brand',
    sort_order: input.sort_order ?? 0,
    is_active: input.is_active ?? true,
  };

  try {
    if (input.id) {
      const { slug, ...upd } = payload;
      void slug;
      const { data, error } = await ctx.supabase
        .from('test_categories')
        .update(upd)
        .eq('id', input.id)
        .select('id')
        .single();
      if (error) return { success: false, error: error.message };
      revalidatePath('/admin/tests');
      revalidatePath('/services');
      return { success: true, data: { id: data.id } };
    }

    const { data, error } = await ctx.supabase
      .from('test_categories')
      .insert(payload as any)
      .select('id')
      .single();
    if (error) return { success: false, error: error.message };
    revalidatePath('/admin/tests');
    revalidatePath('/services');
    return { success: true, data: { id: data.id } };
  } catch (e: any) {
    return { success: false, error: e?.message ?? 'Failed to save category.' };
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const ctx = await requireSupabaseAdmin();
  if ('error' in ctx) return { success: false, error: ctx.error };

  const { error } = await ctx.supabase.from('test_categories').delete().eq('id', id);
  if (error)
    return {
      success: false,
      error: 'Could not delete — tests may still use this category. Reassign them first.',
    };

  revalidatePath('/admin/tests');
  revalidatePath('/services');
  return OK();
}

// ---------------------------------------------------------------------------
// Packages
// ---------------------------------------------------------------------------
export interface PackageInput {
  id?: string;
  name: string;
  description?: string;
  long_description?: string;
  price?: number | null;
  mrp?: number | null;
  image_url?: string | null;
  test_count?: number | null;
  fasting_required?: boolean;
  report_time?: string;
  includes?: string[];
  is_popular?: boolean;
  is_published?: boolean;
  sort_order?: number;
}

export async function savePackage(input: PackageInput): Promise<ActionResult<{ id: string }>> {
  const ctx = await requireSupabaseAdmin();
  if ('error' in ctx) return { success: false, error: ctx.error };
  if (!input.name || input.name.trim().length < 2)
    return { success: false, error: 'Package name is required.' };

  const payload = {
    name: input.name.trim(),
    slug: input.id ? undefined : slugify(input.name),
    description: input.description?.trim() || null,
    long_description: input.long_description?.trim() || null,
    price: input.price ?? null,
    mrp: input.mrp ?? null,
    image_url: input.image_url || null,
    test_count: input.test_count ?? null,
    fasting_required: input.fasting_required ?? false,
    report_time: input.report_time?.trim() || null,
    includes: input.includes ?? [],
    is_popular: input.is_popular ?? false,
    is_published: input.is_published ?? false,
    sort_order: input.sort_order ?? 0,
  };

  try {
    if (input.id) {
      const { slug, ...upd } = payload;
      void slug;
      const { data, error } = await ctx.supabase
        .from('packages')
        .update(upd)
        .eq('id', input.id)
        .select('id')
        .single();
      if (error) return { success: false, error: error.message };
      revalidatePath('/admin/packages');
      revalidatePath('/tests');
      return { success: true, data: { id: data.id } };
    }

    const { data, error } = await ctx.supabase.from('packages').insert(payload as any).select('id').single();
    if (error) return { success: false, error: error.message };
    revalidatePath('/admin/packages');
    revalidatePath('/tests');
    return { success: true, data: { id: data.id } };
  } catch (e: any) {
    return { success: false, error: e?.message ?? 'Failed to save package.' };
  }
}

export async function deletePackage(id: string): Promise<ActionResult> {
  const ctx = await requireSupabaseAdmin();
  if ('error' in ctx) return { success: false, error: ctx.error };

  const { error } = await ctx.supabase.from('packages').delete().eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/packages');
  revalidatePath('/tests');
  return OK();
}

// ---------------------------------------------------------------------------
// Testimonials
// ---------------------------------------------------------------------------
export async function saveTestimonial(input: {
  id?: string;
  name: string;
  location?: string;
  rating?: number;
  message: string;
  is_visible?: boolean;
  sort_order?: number;
}): Promise<ActionResult> {
  const ctx = await requireSupabaseAdmin();
  if ('error' in ctx) return { success: false, error: ctx.error };
  if (!input.name?.trim() || !input.message?.trim())
    return { success: false, error: 'Name and message are required.' };

  const rating = Math.min(5, Math.max(1, Number(input.rating) || 5));
  const payload = {
    name: input.name.trim(),
    location: input.location?.trim() || null,
    rating,
    message: input.message.trim(),
    is_visible: input.is_visible ?? false,
    sort_order: input.sort_order ?? 0,
  };

  const { error } = input.id
    ? await ctx.supabase.from('testimonials').update(payload).eq('id', input.id)
    : await ctx.supabase.from('testimonials').insert(payload);

  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/testimonials');
  revalidatePath('/');
  return OK();
}

export async function deleteTestimonial(id: string): Promise<ActionResult> {
  const ctx = await requireSupabaseAdmin();
  if ('error' in ctx) return { success: false, error: ctx.error };

  const { error } = await ctx.supabase.from('testimonials').delete().eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/testimonials');
  revalidatePath('/');
  return OK();
}

// ---------------------------------------------------------------------------
// Site settings + centres
// ---------------------------------------------------------------------------
export async function saveSetting(key: string, value: unknown): Promise<ActionResult> {
  const ctx = await requireSupabaseAdmin();
  if ('error' in ctx) return { success: false, error: ctx.error };

  const { error } = await ctx.supabase
    .from('site_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

  if (error) return { success: false, error: error.message };

  revalidatePath('/', 'layout');
  revalidatePath('/admin/content');
  return OK();
}

export async function saveCentre(
  id: string,
  data: { name?: string; address?: string; phone?: string; hours?: string; maps_url?: string }
): Promise<ActionResult> {
  const ctx = await requireSupabaseAdmin();
  if ('error' in ctx) return { success: false, error: ctx.error };

  const { error } = await ctx.supabase
    .from('centres')
    .upsert(
      { id, name: data.name, address: data.address, phone: data.phone, hours: data.hours, maps_url: data.maps_url, updated_at: new Date().toISOString() },
      { onConflict: 'id' }
    );

  if (error) return { success: false, error: error.message };

  revalidatePath('/', 'layout');
  revalidatePath('/centres');
  revalidatePath('/admin/content');
  return OK();
}
