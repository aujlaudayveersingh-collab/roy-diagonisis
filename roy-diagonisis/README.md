# Modern Diagnostic — Official Website

A complete, production-ready diagnostic laboratory website for **Modern Diagnostic**
(Dhekiajuli & Sirajuli, Assam), built by **Pritam Roy**.

- **Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · Supabase (Postgres + Auth + Storage + RLS)
- **Pages:** Home, About, Services, Tests & Packages, Centres, Home Collection, Contact, Book
- **Admin panel:** `/admin` — secure dashboard for bookings, tests, packages, content, testimonials & enquiries
- **Integrations:** WhatsApp click-to-chat, Google Maps, SEO (sitemap, robots, Open Graph, JSON-LD)

> ⚠️ **IMPORTANT — If you build inside OneDrive:** OneDrive's sync engine can corrupt
> Next.js build output (missing `.next/server/vendor-chunks` → HTTP 500) and break
> `npm` installs (SSL errors). Before running `pnpm build` or `pnpm install`, either
> **pause OneDrive sync** for this folder or **move the project outside** the
> OneDrive-synced `Documents` folder. `pnpm` is used here because it is more
> resilient than `npm` in this environment. See [Troubleshooting](#troubleshooting).

---

## 1. Project folder structure

```
modern-diagnostic/
├── package.json                  # Dependencies + scripts (pnpm)
├── pnpm-lock.yaml
├── next.config.mjs              # Security headers, image config
├── tailwind.config.ts           # Brand palette, shadows, animations
├── tsconfig.json
├── postcss.config.mjs
├── .env.example                 # Copy to .env.local and fill in
├── .gitignore
│
├── public/
│   ├── favicon.svg
│   ├── logo.svg
│   ├── og-default.svg           # Open Graph share image
│   └── robots.txt
│
├── supabase/
│   └── migrations/
│       ├── 0001_initial_schema.sql   # Tables, enums, triggers, RLS helpers
│       ├── 0002_rls_policies.sql     # Row Level Security for every table
│       ├── 0003_storage.sql          # Storage buckets + policies
│       └── 0004_seed_data.sql        # Centres, settings, test catalogue
│
└── src/
    ├── middleware.ts            # Protects /admin, refreshes sessions
    ├── actions/                 # Server Actions (all validate + re-check auth)
    │   ├── booking.ts           # Public booking submission
    │   ├── enquiry.ts           # Public contact form
    │   └── admin.ts             # All admin CRUD (secured)
    ├── lib/
    │   ├── constants.ts         # Business info, centres, WhatsApp
    │   ├── types.ts             # Shared TypeScript types
    │   ├── utils.ts             # cn, formatPrice, slugify, dates
    │   ├── data.ts              # Public data layer (live → fallback)
    │   ├── content-fallback.ts  # Bundled content used before DB is live
    │   ├── admin-data.ts        # Admin-only queries
    │   ├── seo.tsx              # Metadata + JSON-LD helpers
    │   └── supabase/
    │       ├── env.ts           # isSupabaseConfigured()
    │       ├── client.ts        # Browser client (anon key)
    │       ├── server.ts        # Cookie-aware server client
    │       ├── admin.ts         # Service-role client (server only)
    │       └── auth.ts          # requireAdmin() guard
    ├── components/
    │   ├── ui.tsx               # Logo, SectionHeading, Stars, ImageBox…
    │   ├── header.tsx           # Sticky nav + mobile drawer
    │   ├── footer.tsx
    │   ├── site-shell.tsx       # Announcement + header + footer + FAB
    │   ├── whatsapp-float.tsx   # Global floating WhatsApp button
    │   ├── page-shell.tsx       # Interior page header + breadcrumbs
    │   ├── booking-form.tsx     # Booking + contact forms
    │   ├── test-catalogue.tsx   # Search/filter + detail slide-over
    │   ├── home/booking-cta.tsx
    │   └── admin/               # Login, nav, shell, managers, editors
    └── app/
        ├── layout.tsx           # Fonts, metadata, LocalBusiness schema
        ├── globals.css          # Design system
        ├── page.tsx             # Home
        ├── sitemap.ts · robots.ts
        ├── about/ services/ tests/ centres/ home-collection/ contact/ book/
        └── admin/
            ├── login/           # Sign in
            ├── page.tsx         # Dashboard overview
            ├── bookings/        # Manage bookings
            ├── enquiries/       # Manage contact messages
            ├── tests/           # Tests & categories CRUD
            ├── packages/        # Packages CRUD + image upload
            ├── content/         # Edit site copy, contact, centres, logo
            └── testimonials/    # Manage reviews
```

---

## 2. Installation commands

```bash
# 1. Install dependencies (pnpm recommended — see OneDrive note above)
corepack pnpm@9 install
#    ...or, if pnpm is globally installed:
pnpm install

# 2. (Optional) run the dev server
pnpm dev        # → http://localhost:3000
```

Available scripts:

| Command | Description |
|---|---|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm typecheck` | TypeScript type check (no emit) |
| `pnpm lint` | Next.js lint |

---

## 3. Environment variables

```bash
cp .env.example .env.local
```

Then edit `.env.local` and fill in every value from **Supabase → Project Settings → API**:

| Variable | Where to find it | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL | Connects the app to your database |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon/public key | Safe for browser — protected by RLS |
| `NEXT_PUBLIC_SITE_URL` | Your domain | Canonical URLs, sitemap, Open Graph |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | — | Default `919101090862` (digits only) |
| `NEXT_PUBLIC_ADMIN_EMAIL` | — | Shown in the admin setup guide |

> **Never** commit `.env.local`. The `service_role` key is **not** used anywhere in the
> frontend and should only be pasted into the Supabase SQL Editor if ever needed.

---

## 4. Supabase setup (step by step)

1. Go to [supabase.com](https://supabase.com) → **New project** (free tier is fine).
2. Choose a name (e.g. `modern-diagnostic`), a strong database password, and a region
   close to India (e.g. **South Asia (Mumbai)**).
3. Wait ~2 minutes for provisioning.
4. Open **Project Settings → API** and copy the **Project URL** and **anon/public key**
   into `.env.local` (see above).
5. Restart your dev server so the new env vars load.

---

## 5. SQL migrations

Run the four migration files **in order**. Easiest method — the SQL Editor:

1. In Supabase, open **SQL Editor → New query**.
2. Paste the **entire contents** of `supabase/migrations/0001_initial_schema.sql` → **Run**.
3. Repeat for `0002_rls_policies.sql`.
4. Repeat for `0003_storage.sql`.
5. Repeat for `0004_seed_data.sql`.

Each file is idempotent (safe to re-run). What they create:

- **0001** — tables (`profiles`, `tests`, `test_categories`, `packages`, `bookings`,
  `enquiries`, `testimonials`, `site_settings`, `centres`), enums, `updated_at`
  triggers, `is_admin()` helper and the booking-ID generator.
- **0002** — Row Level Security on every table. Public can only read published
  content and create bookings/enquiries; only admins/staff can read or modify
  operational data. **Patient data never leaves the admin panel.**
- **0003** — `site-images` & `package-images` storage buckets (public read,
  admin-only write).
- **0004** — Seeds the two centres, editable site settings and a starter test
  catalogue. **No prices are invented** — every test starts with a `NULL` price,
  which renders as *"Price on request"* until you set real prices in the admin.

---

## 6. Admin account creation

The admin logs in with a **username** (not an email):

| Field | Value |
|---|---|
| **Username** | `ROYLAB123` |
| **Password** | `ADMINROY123` |

Behind the scenes the username maps to the Supabase Auth email
`roylab123@moderndiagnostic.com`, and the password is stored **hashed** in Supabase —
it is never written into the website code.

**To provision it, run one migration:**

1. In Supabase, open **SQL Editor → New query**.
2. Paste the entire contents of `supabase/migrations/0005_admin_user.sql` → **Run**.
3. Sign in at **`/admin/login`** with username `ROYLAB123` / password `ADMINROY123`.

The script is idempotent (safe to re-run) and creates both the auth user and the
`admin`-role profile.

> 🔐 **Strongly recommended:** `ADMINROY123` is a weak, guessable password. After your
> first sign-in, change it to a strong password via **Supabase → Authentication →
> Users → roylab123@moderndiagnostic.com → Update password**, then delete or update
> `0005_admin_user.sql` so the value isn't kept in version control. You can also change
> the login username by setting `NEXT_PUBLIC_ADMIN_USERNAME` in `.env.local` (the
> Supabase email must match `<username>@moderndiagnostic.com`).

To add more staff later, create a user in **Authentication → Users** (auto-confirmed),
then run:

```sql
update public.profiles
set role = 'admin'   -- or 'staff'
where id = 'PASTE-THE-USER-UUID-HERE';
```

---

## 7. Local testing

```bash
pnpm dev
# → http://localhost:3000
```

Test checklist:

- **Public site** — every page loads; images and icons render; mobile menu works.
- **Tests page** — search by name (e.g. "thyroid"), filter by category, open the
  detail slide-over.
- **Booking flow** — submit the `/book` form. With Supabase connected, a booking
  appears in the admin with a `MD-YYMMDD-XXXX` ID and the WhatsApp hand-off message
  is pre-filled. (Without Supabase, the flow still completes but logs a warning.)
- **Contact form** — submit on `/contact`; appears under Admin → Enquiries.
- **Admin** — log in, update a booking status, add internal notes, add/edit/delete a
  test, create + publish a package with an image, edit the homepage headline and
  confirm it updates live, toggle a testimonial's visibility.
- **WhatsApp** — the floating button and every WhatsApp CTA open `wa.me/919101090862`
  with a pre-written message.
- **SEO** — `/sitemap.xml`, `/robots.txt`, and the `MedicalBusiness` JSON-LD in the
  home page source.

To run the production build locally:

```bash
pnpm build && pnpm start
```

---

## 8. Production deployment (Vercel — recommended)

1. Push the project to a Git provider (GitHub/GitLab/Bitbucket).
2. Go to [vercel.com](https://vercel.com) → **Add New → Project** → import the repo.
   Vercel auto-detects Next.js — no build-config changes needed.
3. Under **Environment Variables**, add every variable from `.env.local`
   (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, etc.). Set
   `NEXT_PUBLIC_SITE_URL` to `https://www.moderndiagnostic.com`.
4. **Deploy.** You get a live `*.vercel.app` URL.
5. Run the SQL migrations (Section 5) against the production Supabase project and
   create the admin user (Section 6).

### Netlify

The repo ships with a **`netlify.toml`** (plus `.npmrc` and `.nvmrc`) so Netlify
needs no manual build settings. To deploy:

1. **Use a Git-based deploy (recommended).** Push to GitHub/GitLab/Bitbucket and
   import the repo. This guarantees only source is uploaded — `node_modules` and
   `.next` are git-ignored and can never reach Netlify's Linux builder.
   *(If you drag‑drop a folder instead, **exclude `node_modules` and `.next`** — a
   Windows pnpm `node_modules` is a symlink/junction farm that is unreadable on
   Linux and will break the build.)*
2. In **Site settings → Build & deploy**, confirm the environment picks up
   Node `24` (pinned by `netlify.toml` / `.nvmrc`). Netlify auto-detects Next.js
   and provisions the official **OpenNext/Netlify Next.js runtime**.
3. Add the same environment variables as in step 3 above.
4. **Deploy.** The build command in `netlify.toml` performs a clean
   `pnpm install --frozen-lockfile` (throwing away anything uploaded) and then
   `pnpm build`.

**What the Netlify config fixes (root cause of the earlier deploy error):**

The previous failure —
`Unable to read file react-server-dom-turbopack-client.d.ts` — was **not** a
missing package or a bad React/Next/TypeScript version. That `.d.ts` is an
intentionally empty type stub *vendored inside `next`* (`…/app-page/vendored/ssr/`),
and the wording “Unable to read file” (present but **unreadable**, not “not found”)
meant the build was reading a broken cross-platform link. Two things caused it:

- **No Netlify config** → no pinned Node (an old build-image default was used) and
  no guaranteed clean install, so an uploaded Windows/OneDrive `node_modules`
  symlink farm was consumed on Netlify's Linux builder.
- **pnpm hoisting** → Netlify's own docs
  ([pnpm support](https://opennext.js.org/netlify)) require hoisting for pnpm +
  Next.js. `.npmrc` sets `public-hoist-pattern[]=*` so Next resolves its vendored
  files through a flat, npm‑like `node_modules`.

The fix pins the runtime, forces a clean lockfile-locked install on every build,
and enables the required hoisting — the actual root cause, not a workaround.

---

## 9. Domain connection (www.moderndiagnostic.com)

In your domain registrar's DNS settings, add:

| Type | Name | Value |
|---|---|---|
| `A` | `@` | `76.76.21.21` |
| `CNAME` | `www` | `cname.vercel-dns.com` |

Then in Vercel: **Project → Settings → Domains → Add** → enter
`www.moderndiagnostic.com` (and optionally redirect the bare domain to `www`). DNS
propagates within a few minutes to a few hours. Once live, set
`NEXT_PUBLIC_SITE_URL=https://www.moderndiagnostic.com` and redeploy so the sitemap
and Open Graph URLs use the real domain.

Finally, in **Supabase → Authentication → URL Configuration**, add your production
URL (and `http://localhost:3000`) to the allowed redirect URLs so admin login works.

---

## 10. Content that needs client confirmation

The site launches with sensible, editable defaults. The following should be confirmed
with the owner and updated via **Admin → Content** (no code changes needed):

- **Opening hours** — a placeholder (`Mon–Sat 7 AM–8 PM | Sun 7 AM–12 PM`) is set for
  both centres. Confirm the real hours.
- **Test prices & report turnaround** — seeded as *"Price on request"*. Enter real
  prices in **Admin → Tests**; publish packages in **Admin → Packages**.
- **Testimonials** — none are shown until you add genuine, patient-approved reviews in
  **Admin → Testimonials**. Reviews are never fabricated.
- **About copy & mission** — editable in **Admin → Content**.
- **Certifications/accreditations** — intentionally **not** claimed anywhere. Add only
  if genuinely held and verifiable.
- **Logo** — upload the official logo in **Admin → Content → Branding**.

---

## 11. Security & privacy notes

- Admin auth uses **real Supabase email/password** with hashed passwords — there is no
  localStorage or client-side "fake" auth anywhere.
- `/admin` routes are protected by **middleware** (session refresh + redirect) *and*
  every server action re-checks the role via `requireAdmin()`.
- **Row Level Security** enforces access at the database level, so even the anon key
  cannot read patient bookings or enquiries.
- No `service_role` key or secret is ever exposed to the browser.
- Booking/enquiry forms are validated on both client **and** server.
- Security headers (X-Frame-Options, nosniff, Referrer-Policy) are set in `next.config.mjs`.
- Patient information is never rendered publicly, and `/admin` is excluded from robots.

---

## Troubleshooting

**`npm install` fails with `ERR_SSL_CIPHER_OPERATION_FAILED`**
OneDrive's filter driver interferes with npm's TLS. Use `corepack pnpm@9 install`
instead, or pause OneDrive sync / move the project outside `Documents`.

**Pages return HTTP 500 after a build (`Cannot find module './vendor-chunks/...'`)**
OneDrive corrupted the build output. Stop the server, delete `.next`, pause OneDrive
sync (or build outside OneDrive), then `pnpm build` again.

**Admin login shows "Setup required"**
Supabase env vars aren't set. Copy `.env.example` → `.env.local`, fill in the URL and
anon key, and restart the dev server.

**Login always fails with "Invalid username or password"**
Confirm the user exists in **Authentication → Users** and was auto-confirmed, and that
a matching `profiles` row exists with role `admin` or `staff`. For the default account,
run `0005_admin_user.sql`. Remember the login uses the **username** `ROYLAB123`, which
maps to the email `roylab123@moderndiagnostic.com`.

**Bookings don't appear in the admin**
Check the browser network tab for a failed POST to the `bookings` table — this usually
means a migration wasn't run or RLS blocked the insert. Re-run migrations 0001 & 0002.
