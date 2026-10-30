-- =============================================================================
-- MODERN DIAGNOSTIC — Migration 0002: Row Level Security Policies
-- =============================================================================
-- Security model:
--   * Public (anon) can READ published catalogue/content only.
--   * Public can INSERT new bookings and enquiries (booking is the point of the
--     site) but can never read anyone's booking data back, and can never update
--     or delete rows.
--   * Only authenticated admins/staff (role check via is_admin()) can read,
--     update or delete operational data. Patient data never leaves the admin
--     panel.
--   * No admin self-registration: sign-up is disabled in Supabase Auth settings;
--     admins are created by the owner in the dashboard.
--
-- CORRECTION (2026-10-30): every "create policy" is now preceded by
-- "drop policy if exists" so this migration is idempotent (safe to re-run).
-- The previous version failed on re-run with:
--   ERROR 42710: policy "Profiles: admin read" for table "profiles" already exists
-- All policy definitions (commands, USING and WITH CHECK expressions) are
-- byte-for-byte identical to the original.
-- =============================================================================

alter table public.profiles        enable row level security;
alter table public.test_categories enable row level security;
alter table public.tests           enable row level security;
alter table public.packages        enable row level security;
alter table public.bookings        enable row level security;
alter table public.enquiries       enable row level security;
alter table public.testimonials    enable row level security;
alter table public.site_settings   enable row level security;
alter table public.centres         enable row level security;

-- ---------- profiles ----------
drop policy if exists "Profiles: admin read" on public.profiles;
create policy "Profiles: admin read"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

drop policy if exists "Profiles: admin update" on public.profiles;
create policy "Profiles: admin update"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- test_categories ----------
drop policy if exists "Categories: anyone active read" on public.test_categories;
create policy "Categories: anyone active read"
  on public.test_categories for select
  using (is_active = true or public.is_admin());

drop policy if exists "Categories: admin write" on public.test_categories;
create policy "Categories: admin write"
  on public.test_categories for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- tests ----------
drop policy if exists "Tests: anyone active read" on public.tests;
create policy "Tests: anyone active read"
  on public.tests for select
  using (is_active = true or public.is_admin());

drop policy if exists "Tests: admin write" on public.tests;
create policy "Tests: admin write"
  on public.tests for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- packages ----------
drop policy if exists "Packages: public read published" on public.packages;
create policy "Packages: public read published"
  on public.packages for select
  using (is_published = true or public.is_admin());

drop policy if exists "Packages: admin write" on public.packages;
create policy "Packages: admin write"
  on public.packages for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- bookings ----------
-- Public may create a booking, but only with sensible defaults and without
-- touching admin-managed columns.
drop policy if exists "Bookings: public create" on public.bookings;
create policy "Bookings: public create"
  on public.bookings for insert
  with check (
    status = 'new'
    and patient_name <> '__id_probe__'
    and (internal_notes is null or internal_notes = '')
  );

-- Only staff can read bookings — patient data is never public.
drop policy if exists "Bookings: admin read" on public.bookings;
create policy "Bookings: admin read"
  on public.bookings for select
  using (public.is_admin());

drop policy if exists "Bookings: admin update" on public.bookings;
create policy "Bookings: admin update"
  on public.bookings for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Bookings: admin delete" on public.bookings;
create policy "Bookings: admin delete"
  on public.bookings for delete
  using (public.is_admin());

-- ---------- enquiries ----------
drop policy if exists "Enquiries: public create" on public.enquiries;
create policy "Enquiries: public create"
  on public.enquiries for insert
  with check (status = 'new');

drop policy if exists "Enquiries: admin read" on public.enquiries;
create policy "Enquiries: admin read"
  on public.enquiries for select
  using (public.is_admin());

drop policy if exists "Enquiries: admin update" on public.enquiries;
create policy "Enquiries: admin update"
  on public.enquiries for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Enquiries: admin delete" on public.enquiries;
create policy "Enquiries: admin delete"
  on public.enquiries for delete
  using (public.is_admin());

-- ---------- testimonials ----------
drop policy if exists "Testimonials: public read visible" on public.testimonials;
create policy "Testimonials: public read visible"
  on public.testimonials for select
  using (is_visible = true or public.is_admin());

drop policy if exists "Testimonials: admin write" on public.testimonials;
create policy "Testimonials: admin write"
  on public.testimonials for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- site_settings ----------
drop policy if exists "Settings: public read" on public.site_settings;
create policy "Settings: public read"
  on public.site_settings for select
  using (true);

drop policy if exists "Settings: admin write" on public.site_settings;
create policy "Settings: admin write"
  on public.site_settings for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- centres ----------
drop policy if exists "Centres: public read" on public.centres;
create policy "Centres: public read"
  on public.centres for select
  using (is_active = true or public.is_admin());

drop policy if exists "Centres: admin write" on public.centres;
create policy "Centres: admin write"
  on public.centres for all
  using (public.is_admin())
  with check (public.is_admin());
