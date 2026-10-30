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
create policy "Profiles: admin read"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "Profiles: admin update"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- test_categories ----------
create policy "Categories: anyone active read"
  on public.test_categories for select
  using (is_active = true or public.is_admin());

create policy "Categories: admin write"
  on public.test_categories for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- tests ----------
create policy "Tests: anyone active read"
  on public.tests for select
  using (is_active = true or public.is_admin());

create policy "Tests: admin write"
  on public.tests for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- packages ----------
create policy "Packages: public read published"
  on public.packages for select
  using (is_published = true or public.is_admin());

create policy "Packages: admin write"
  on public.packages for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- bookings ----------
-- Public may create a booking, but only with sensible defaults and without
-- touching admin-managed columns.
create policy "Bookings: public create"
  on public.bookings for insert
  with check (
    status = 'new'
    and patient_name <> '__id_probe__'
    and (internal_notes is null or internal_notes = '')
  );

-- Only staff can read bookings — patient data is never public.
create policy "Bookings: admin read"
  on public.bookings for select
  using (public.is_admin());

create policy "Bookings: admin update"
  on public.bookings for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Bookings: admin delete"
  on public.bookings for delete
  using (public.is_admin());

-- ---------- enquiries ----------
create policy "Enquiries: public create"
  on public.enquiries for insert
  with check (status = 'new');

create policy "Enquiries: admin read"
  on public.enquiries for select
  using (public.is_admin());

create policy "Enquiries: admin update"
  on public.enquiries for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Enquiries: admin delete"
  on public.enquiries for delete
  using (public.is_admin());

-- ---------- testimonials ----------
create policy "Testimonials: public read visible"
  on public.testimonials for select
  using (is_visible = true or public.is_admin());

create policy "Testimonials: admin write"
  on public.testimonials for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- site_settings ----------
create policy "Settings: public read"
  on public.site_settings for select
  using (true);

create policy "Settings: admin write"
  on public.site_settings for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- centres ----------
create policy "Centres: public read"
  on public.centres for select
  using (is_active = true or public.is_admin());

create policy "Centres: admin write"
  on public.centres for all
  using (public.is_admin())
  with check (public.is_admin());
