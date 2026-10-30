-- =============================================================================
-- MODERN DIAGNOSTIC — Migration 0001: Initial Schema
-- =============================================================================
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Safe to re-run (idempotent).
--
-- CORRECTION (2026-10-30): public.profiles is now created BEFORE the is_admin()
-- function that reads it. PostgreSQL validates LANGUAGE sql function bodies at
-- CREATE time, so the original order failed on a fresh database with:
--   ERROR 42P01: relation "public.profiles" does not exist (LINE 40)
-- =============================================================================

-- ---------- Extensions ----------
create extension if not exists "pgcrypto";

-- ---------- Enums ----------
-- Booking lifecycle: new → pending → confirmed → completed / cancelled
do $$ begin
  create type public.booking_status as enum ('new', 'pending', 'confirmed', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.collection_type as enum ('home_collection', 'centre_visit');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.enquiry_status as enum ('new', 'in_progress', 'resolved');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.admin_role as enum ('admin', 'staff');
exception when duplicate_object then null; end $$;

-- ---------- profiles ----------
-- One row per back-office user, linked to auth.users.
-- MUST be created before is_admin() below (LANGUAGE sql function bodies are
-- validated against existing relations at creation time).
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  role        public.admin_role not null default 'staff',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------- Helpers ----------
-- Returns true when the currently authenticated user is an admin.
-- SECURITY DEFINER so RLS policies can call it without recursing into the
-- profiles table policies.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'staff')
  );
$$;

-- Auto-create a profile when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), 'staff')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- test_categories ----------
create table if not exists public.test_categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  icon        text,                     -- icon key resolved by the frontend
  colour      text default 'brand',    -- accent colour key
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------- tests ----------
create table if not exists public.tests (
  id                uuid primary key default gen_random_uuid(),
  category_id       uuid references public.test_categories(id) on delete set null,
  name              text not null,
  slug              text not null unique,
  short_description text,
  description       text,
  price             numeric(10,2),          -- NULL = "price on request" (never invent prices)
  mrp               numeric(10,2),          -- optional struck-through price
  preparation       text,                   -- fasting / sample instructions
  report_time       text,                   -- turnaround, e.g. "Same day"
  sample_type       text,                   -- e.g. "Blood", "Serum", "Urine"
  is_popular        boolean not null default false,
  is_active         boolean not null default true,
  sort_order        int not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists tests_category_id_idx on public.tests(category_id);
create index if not exists tests_is_active_idx on public.tests(is_active);
create index if not exists tests_is_popular_idx on public.tests(is_popular);

-- ---------- packages ----------
create table if not exists public.packages (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  slug              text not null unique,
  description       text,
  long_description  text,
  price             numeric(10,2),
  mrp               numeric(10,2),
  image_url         text,
  test_count        int,
  fasting_required  boolean default false,
  report_time       text,
  includes          jsonb default '[]'::jsonb,   -- array of included test names
  is_popular        boolean not null default false,
  is_published      boolean not null default false,
  sort_order        int not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ---------- bookings ----------
create table if not exists public.bookings (
  id              uuid primary key default gen_random_uuid(),
  booking_id      text not null unique,           -- human-friendly ID shown to the patient
  patient_name    text not null,
  phone           text not null,
  email           text,
  centre_id       text not null,                  -- 'dhekiajuli' | 'sirajuli'
  test_ids        jsonb default '[]'::jsonb,      -- array of test uuids
  test_names      text,                           -- denormalised label for display
  package_id      uuid,
  package_name    text,
  preferred_date  date,
  preferred_time  text,
  collection_type public.collection_type not null default 'centre_visit',
  address         text,                           -- required for home collection
  message         text,
  status          public.booking_status not null default 'new',
  internal_notes  text,                           -- admin-only
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists bookings_status_idx on public.bookings(status);
create index if not exists bookings_created_at_idx on public.bookings(created_at desc);
create index if not exists bookings_centre_idx on public.bookings(centre_id);

-- ---------- enquiries (contact form) ----------
create table if not exists public.enquiries (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  phone       text not null,
  email       text,
  subject     text,
  message     text not null,
  status      public.enquiry_status not null default 'new',
  created_at  timestamptz not null default now()
);

create index if not exists enquiries_status_idx on public.enquiries(status);

-- ---------- testimonials ----------
create table if not exists public.testimonials (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  location    text,
  rating      int not null default 5 check (rating between 1 and 5),
  message     text not null,
  is_visible  boolean not null default false,   -- only admin-published reviews show publicly
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------- site_settings ----------
-- Single-row style key/value store for editable website content.
create table if not exists public.site_settings (
  key         text primary key,
  value       jsonb not null,
  label       text,
  updated_at  timestamptz not null default now()
);

-- ---------- centres ----------
create table if not exists public.centres (
  id          text primary key,                  -- 'dhekiajuli' | 'sirajuli'
  name        text not null,
  address     text not null,
  phone       text,
  whatsapp    text,
  maps_url    text,
  embed_url   text,
  hours       text,
  services    jsonb default '[]'::jsonb,
  is_active   boolean not null default true,
  sort_order  int not null default 0,
  updated_at  timestamptz not null default now()
);

-- ---------- updated_at trigger ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['profiles','test_categories','tests','packages','bookings','testimonials','centres'] loop
    execute format('drop trigger if exists set_updated_at_%I on public.%I', t, t);
    execute format('create trigger set_updated_at_%I before update on public.%I for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;

-- ---------- Booking ID generator ----------
-- Publicly callable so the app can mint a readable booking reference.
create or replace function public.generate_booking_id()
returns text
language plpgsql
as $$
declare
  candidate text;
  counter int := 0;
begin
  loop
    candidate := 'MD-' || to_char(now(), 'YYMMDD') || '-' || upper(substr(md5(random()::text), 1, 4));
    counter := counter + 1;
    begin
      insert into public.bookings (booking_id, patient_name, phone)
      values (candidate, '__id_probe__', '__id_probe__');
      delete from public.bookings where booking_id = candidate;
      return candidate;
    exception when unique_violation then
      if counter > 20 then raise exception 'Could not generate a unique booking ID'; end if;
    end;
  end loop;
end;
$$;
