// Admin-only data fetchers. All of these run behind requireAdmin() so patient
// data never leaves the authorised back-office.
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/supabase/auth';
import type { Booking, Category, Enquiry, Package, Test, Testimonial } from '@/lib/types';
import type { BookingFilters } from '@/actions/admin';

export interface DashboardStats {
  totalBookings: number;
  newBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  totalTests: number;
  activeTests: number;
  activePackages: number;
  newEnquiries: number;
  totalEnquiries: number;
}

export async function getDashboardStats(): Promise<DashboardStats | null> {
  const ctx = await requireAdmin();
  if (!ctx) return null;
  const supabase = await createClient();
  if (!supabase) return null;

  const [bookings, tests, packages, enquiries] = await Promise.all([
    supabase.from('bookings').select('status'),
    supabase.from('tests').select('id, is_active'),
    supabase.from('packages').select('id, is_published'),
    supabase.from('enquiries').select('id, status'),
  ]);

  const bk = bookings.data ?? [];
  const ts = tests.data ?? [];
  const pk = packages.data ?? [];
  const en = enquiries.data ?? [];

  return {
    totalBookings: bk.length,
    newBookings: bk.filter((b) => b.status === 'new').length,
    pendingBookings: bk.filter((b) => b.status === 'pending').length,
    confirmedBookings: bk.filter((b) => b.status === 'confirmed').length,
    completedBookings: bk.filter((b) => b.status === 'completed').length,
    totalTests: ts.length,
    activeTests: ts.filter((t) => t.is_active).length,
    activePackages: pk.filter((p) => p.is_published).length,
    newEnquiries: en.filter((e) => e.status === 'new').length,
    totalEnquiries: en.length,
  };
}

export async function getAdminBookings(filters?: BookingFilters): Promise<Booking[]> {
  const ctx = await requireAdmin();
  if (!ctx) return [];
  const supabase = await createClient();
  if (!supabase) return [];

  let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });

  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.centre) query = query.eq('centre_id', filters.centre);
  if (filters?.dateFrom) query = query.gte('created_at', `${filters.dateFrom}T00:00:00`);
  if (filters?.dateTo) query = query.lte('created_at', `${filters.dateTo}T23:59:59`);
  if (filters?.q?.trim()) {
    const q = filters.q.trim();
    query = query.or(`patient_name.ilike.%${q}%,phone.ilike.%${q}%,booking_id.ilike.%${q}%,test_names.ilike.%${q}%`);
  }

  const { data } = await query;
  return (data as Booking[]) ?? [];
}

export async function getRecentBookings(limit = 8): Promise<Booking[]> {
  const ctx = await requireAdmin();
  if (!ctx) return [];
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data as Booking[]) ?? [];
}

export async function getAdminEnquiries(): Promise<Enquiry[]> {
  const ctx = await requireAdmin();
  if (!ctx) return [];
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false });
  return (data as Enquiry[]) ?? [];
}

export async function getAdminTests(): Promise<Test[]> {
  const ctx = await requireAdmin();
  if (!ctx) return [];
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from('tests')
    .select('*, category:test_categories(name, slug)')
    .order('sort_order', { ascending: true });
  return (data as unknown as Test[]) ?? [];
}

export async function getAdminCategories(): Promise<Category[]> {
  const ctx = await requireAdmin();
  if (!ctx) return [];
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase.from('test_categories').select('*').order('sort_order', { ascending: true });
  return (data as Category[]) ?? [];
}

export async function getAdminPackages(): Promise<Package[]> {
  const ctx = await requireAdmin();
  if (!ctx) return [];
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase.from('packages').select('*').order('sort_order', { ascending: true });
  return (data as Package[]) ?? [];
}

export async function getAdminTestimonials(): Promise<Testimonial[]> {
  const ctx = await requireAdmin();
  if (!ctx) return [];
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase.from('testimonials').select('*').order('sort_order', { ascending: true });
  return (data as Testimonial[]) ?? [];
}
