-- =============================================================================
-- MODERN DIAGNOSTIC — Migration 0003: Storage Buckets & Policies
-- =============================================================================
-- Creates the media buckets used by the admin panel for logos, banners,
-- package images and testimonial photos. Public read, admin-only write.
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('site-images', 'site-images', true, 5242880, array['image/png','image/jpeg','image/webp','image/svg+xml','image/avif']),
  ('package-images', 'package-images', true, 5242880, array['image/png','image/jpeg','image/webp','image/avif'])
on conflict (id) do nothing;

-- Public read for site media
drop policy if exists "Site images: public read" on storage.objects;
create policy "Site images: public read"
  on storage.objects for select
  using (bucket_id in ('site-images', 'package-images'));

-- Admin-only write
drop policy if exists "Site images: admin write" on storage.objects;
create policy "Site images: admin write"
  on storage.objects for insert
  to authenticated
  with check (bucket_id in ('site-images', 'package-images') and public.is_admin());

drop policy if exists "Site images: admin update" on storage.objects;
create policy "Site images: admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id in ('site-images', 'package-images') and public.is_admin());

drop policy if exists "Site images: admin delete" on storage.objects;
create policy "Site images: admin delete"
  on storage.objects for delete
  using (bucket_id in ('site-images', 'package-images') and public.is_admin());
