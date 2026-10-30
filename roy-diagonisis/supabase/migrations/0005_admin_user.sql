-- =============================================================================
-- MODERN DIAGNOSTIC — Migration 0005: Provision the primary admin account
-- =============================================================================
-- Creates the owner's admin login.
--
--   Username : ROYLAB123      (signs in on /admin/login)
--   Password : ADMINROY123    (stored below as a bcrypt HASH — never plaintext)
--
-- Behind the scenes the username maps to the Supabase Auth email:
--   ROYLAB123  ->  roylab123@moderndiagnostic.com
--
-- Run this ONCE in the Supabase SQL Editor. It is idempotent (safe to re-run).
--
-- ⚠️  SECURITY: "ADMINROY123" is a weak, guessable password. After you sign in,
--     change it to something strong (Supabase → Authentication → Users →
--     → user → Update password), then update this file or delete it so the
--     value is not kept in version control.
-- =============================================================================

do $$
declare
  target_email text := 'roylab123@moderndiagnostic.com';
  target_uuid  uuid;
  hashed_pwd   text;
begin
  -- Bcrypt-hash the password (pgcrypto is enabled in migration 0001).
  hashed_pwd := crypt('ADMINROY123', gen_salt('bf', 10));

  -- 1) Ensure the auth user exists (do not overwrite an existing password).
  select id into target_uuid from auth.users where email = target_email;

  if target_uuid is null then
    target_uuid := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, invited_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000', target_uuid, 'authenticated', 'authenticated',
      target_email, hashed_pwd,
      now(), now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Pritam Roy"}',
      now(), now(), '', '', '', ''
    );

    -- Companion identity row required by Supabase Auth.
    insert into auth.identities (
      id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), target_uuid, target_uuid::text,
      json_build_object('sub', target_uuid::text, 'email', target_email, 'email_verified', true)::jsonb,
      'email', now(), now(), now()
    );

    raise notice 'Created admin auth user: % (%)', target_email, target_uuid;
  else
    raise notice 'Admin auth user already exists (%) — password left unchanged.', target_email;
  end if;

  -- 2) Ensure the profile exists with the admin role.
  insert into public.profiles (id, email, full_name, role)
  values (target_uuid, target_email, 'Pritam Roy', 'admin')
  on conflict (id) do update set role = 'admin', email = excluded.email, full_name = excluded.full_name;

  raise notice 'Admin profile ready. Sign in with username ROYLAB123.';
end $$;
