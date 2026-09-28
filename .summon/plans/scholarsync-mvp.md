---
status: pending
title: ScholarSync MVP — AI Scholarship Application Generator
---

## Context

Empty project (only README.md, env.example). Everything is built from scratch on
React + Vite + TypeScript + TanStack Router (file-based) + Tailwind CSS v4 + Supabase.
Supabase is already connected and env vars are written.

Out of scope for this build: admin dashboards, analytics suites, complex billing/checkout
flows, mobile native apps, real payment processing, third-party scholarship API ingestion.

---

## Phase 0 — Project scaffold

1. Initialise a Vite React + TypeScript project at the repo root (`index.html`, `src/main.tsx`,
   `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `package.json`, `.gitignore`).
   Expected: `npm run dev` boots an empty app.
2. Install runtime deps: `@tanstack/react-router`, `@supabase/supabase-js`, `lucide-react`,
   `framer-motion`, `clsx`, `tailwind-merge`, `class-variance-authority`.
   Dev deps: `vite`, `@vitejs/plugin-react`, `typescript`, `@types/react`, `@types/react-dom`,
   `@tailwindcss/vite`, `tailwindcss`, `@tanstack/router-plugin`.
   Expected: lockfile present, no peer warnings blocking install.
3. Configure `vite.config.ts` with the React plugin, `@tailwindcss/vite`, the TanStack
   `tanstackRouter` plugin (autoCodeSplitting on, routes dir `src/routes`), and the `@/` alias
   to `src`. Mirror the alias in `tsconfig.json` `paths`.
   Expected: `src/routeTree.gen.ts` is generated on dev start and is git-ignored from manual edits.
4. Create `src/styles/global.css` starting with exactly `@import "tailwindcss";` and import it
   once in `src/main.tsx`. `src/main.tsx` creates the router from the generated tree and mounts
   `RouterProvider`.
   Expected: blank styled page renders at `/`.
5. Create `env.example` entries and confirm `.env` holds `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY`. Add `src/lib/supabase.ts` exporting a single typed browser client.
   Expected: client instantiates without runtime errors; missing env throws a clear message.

Acceptance: dev server runs, Tailwind utilities apply, Supabase client importable.

---

## Phase 1 — Design system

6. In `src/styles/global.css`, define design tokens as HSL custom properties inside `@theme`
   so they become Tailwind v4 utilities. Dark-mode-first: the dark palette is the default on
   `:root`, with a `.light` class override block.
   Token set:
   - `--color-background: hsl(222 24% 7%)`, `--color-surface: hsl(222 20% 11%)`,
     `--color-surface-raised: hsl(222 18% 15%)`
   - `--color-border: hsl(222 14% 22%)`, `--color-border-strong: hsl(222 14% 32%)`
   - `--color-foreground: hsl(210 20% 96%)`, `--color-muted: hsl(215 14% 62%)`
   - Single bold accent — warm signal amber, explicitly not purple:
     `--color-accent: hsl(28 96% 56%)`, `--color-accent-hover: hsl(28 96% 48%)`,
     `--color-accent-foreground: hsl(24 40% 8%)`, `--color-accent-soft: hsl(28 96% 56% / 0.12)`
   - Status colours: `--color-status-draft`, `--color-status-submitted`,
     `--color-status-review`, `--color-status-awarded` (green), `--color-status-rejected` (red)
   - Radii `--radius-sm/md/lg/xl`, and font tokens.
7. Typography: load a distinctive pairing via `index.html` preconnect + `@import` in
   `global.css` — display face `Space Grotesk` for headings/marks, body face `Inter` for UI,
   mono `JetBrains Mono` for deadline/ID chips. Expose as `--font-display`, `--font-sans`,
   `--font-mono`.
   Expected: headings visibly differ from body; no default system-sans look.
8. Add `src/lib/utils.ts` with a `cn` class-merge helper.
9. Build shadcn/ui-style primitives in `src/components/ui/`: `button.tsx` (variants: primary
   accent, secondary, ghost, outline, destructive; sizes sm/md/lg), `input.tsx`, `label.tsx`,
   `textarea.tsx`, `select.tsx`, `card.tsx` (Card/Header/Title/Description/Content/Footer),
   `badge.tsx` (status variants), `dialog.tsx`, `progress.tsx`, `skeleton.tsx`, `toast.tsx`
   plus `src/hooks/useToast.ts`.
   Expected: all primitives compile, are token-driven, keyboard accessible, focus rings visible.

Acceptance: a scratch render of each primitive looks consistent in dark mode.

---

## Phase 2 — Database schema, RLS, seed

10. Write SQL migrations under `supabase/migrations/` (timestamped files) and apply them to the
    connected project. Tables:

    **profiles** (1:1 with `auth.users`)
    - `id uuid primary key references auth.users(id) on delete cascade`
    - `email text not null`
    - `full_name text`
    - `school text`, `grad_year int`, `gpa numeric(3,2)`, `major text`
    - `state text`, `activities text`, `essay_highlights text`
    - `goal text` (onboarding step 1), `primary_use_case text` (onboarding step 2)
    - `plan text not null default 'free'` check in ('free','pro','scale')
    - `onboarded boolean not null default false`
    - `created_at timestamptz default now()`, `updated_at timestamptz default now()`

    **scholarships** (public catalogue, read-only to users)
    - `id uuid primary key default gen_random_uuid()`
    - `name text not null`, `sponsor text not null`, `description text not null`
    - `amount_cents int not null`, `deadline date not null`
    - `min_gpa numeric(3,2)`, `major_tags text[]`, `state text`, `level text`
      check in ('high_school','undergrad','graduate','any')
    - `prompt text not null` (the essay/application question)
    - `url text`, `created_at timestamptz default now()`

    **applications**
    - `id uuid primary key default gen_random_uuid()`
    - `user_id uuid not null references auth.users(id) on delete cascade`
    - `scholarship_id uuid not null references scholarships(id) on delete cascade`
    - `status text not null default 'draft'` check in
      ('draft','submitted','under_review','awarded','rejected')
    - `draft_content text`, `notes text`
    - `submitted_at timestamptz`, `decided_at timestamptz`
    - `created_at timestamptz default now()`, `updated_at timestamptz default now()`
    - unique (`user_id`,`scholarship_id`)

    **email_leads**
    - `id uuid primary key default gen_random_uuid()`
    - `email text not null unique`, `source text default 'landing'`
    - `created_at timestamptz default now()`

11. Enable RLS on all four tables and add policies:
    - profiles: select/update/insert where `auth.uid() = id`. No delete.
    - scholarships: `select` to `anon, authenticated` using `true`. No insert/update/delete
      policies (service role only).
    - applications: select/insert/update/delete where `auth.uid() = user_id`;
      insert also `with check (auth.uid() = user_id)`.
    - email_leads: `insert` policy for `anon, authenticated` with check `true`; no select policy
      (write-only capture).
12. Add a `handle_new_user()` trigger on `auth.users` insert that creates the matching
    `profiles` row with email. Add an `updated_at` touch trigger for profiles and applications.
13. Enable Supabase Realtime on the `applications` table (add to `supabase_realtime`
    publication) so status tracking updates live.
14. Seed `scholarships` with 12 realistic rows in a `supabase/seed.sql` — e.g. "Horizon STEM
    Futures Grant", "First-Generation Scholars Award", "Rural Innovators Fund", "Women in
    Computing Fellowship", "Community Impact Scholarship", "Trade & Technical Excellence Award",
    varied amounts ($1,000–$15,000), deadlines spread 3 weeks to 8 months out, mixed GPA
    minimums, major tags and levels, each with a real essay prompt.
15. Generate `src/types/database.ts` with hand-written TypeScript types mirroring the schema
    (`Profile`, `Scholarship`, `Application`, `ApplicationStatus`, `EmailLead`), and type the
    Supabase client with them.

Acceptance: a signed-in user can read all scholarships and only their own applications;
anonymous insert into email_leads succeeds; cross-user application access returns zero rows.

---

## Phase 3 — Auth + routing shell

16. `src/routes/__root.tsx`: html shell, `<Outlet />`, toast host, global background treatment
    (subtle radial accent glow, no purple gradient), and the auth provider wrapper.
17. `src/lib/auth.tsx`: `AuthProvider` + `useAuth` hook holding `session`, `user`, `profile`,
    `loading`, and `signUp`/`signIn`/`signOut`/`refreshProfile`. Subscribes to
    `supabase.auth.onAuthStateChange` and fetches the profile row on session change.
18. `src/lib/guards.ts`: helpers used in route `beforeLoad` —
    `requireAuth` (redirect to `/sign-in` with a `redirect` search param),
    `requireOnboarded` (redirect to `/onboarding` when `profile.onboarded` is false),
    `requireAnon` (redirect signed-in users to `/app`).
19. Route files:
    - `src/routes/index.tsx` — landing
    - `src/routes/sign-in.tsx`, `src/routes/sign-up.tsx`
    - `src/routes/onboarding.tsx`
    - `src/routes/app.tsx` — authenticated layout (sidebar/topbar + `<Outlet />`)
    - `src/routes/app/index.tsx` — dashboard
    - `src/routes/app/scholarships.tsx` — matched scholarship browser
    - `src/routes/app/applications.$applicationId.tsx` — single application workspace
    - `src/routes/app/settings.tsx` — profile, plan, sign out
    - `src/routes/$.tsx` — 404
20. Components `src/components/auth/AuthForm.tsx` (shared sign-in/sign-up form with inline error
    handling for wrong password, duplicate email, weak password) and
    `src/components/layout/AppShell.tsx`, `src/components/layout/SiteHeader.tsx`,
    `src/components/layout/SiteFooter.tsx`.

Acceptance: sign up creates auth user + profile row and lands on `/onboarding`; sign in on a
completed profile lands on `/app`; visiting `/app` signed out redirects to `/sign-in` and back
after login; refresh preserves the session.

---

## Phase 4 — Landing page

21. `src/components/landing/Hero.tsx` — eyebrow "ScholarSync", H1 "Building the future",
    subhead covering automated scholarship applications with real-time status tracking,
    primary CTA "Start free" → `/sign-up`, secondary "See how it works" anchor. Confident
    moonshot copy, no jargon, no lorem ipsum.
22. `src/components/landing/ProblemSection.tsx` — three-stat problem framing (missed deadlines,
    hours lost per application, unclaimed aid) with a short narrative paragraph.
23. `src/components/landing/FeatureCards.tsx` — exactly 3 cards with lucide icons:
    "Profile-matched discovery" (Sparkles), "One-click application drafts" (Wand2),
    "Live status tracking" (Radar).
24. `src/components/landing/Pricing.tsx` — 3 usage-based tiers: **Free** (5 drafts/mo, matching,
    tracking), **Pro** (unlimited matching, 50 drafts/mo, deadline reminders, priority
    generation) marked "Most popular" with accent ring, **Scale** (institution seats, bulk
    student rosters, shared reporting, "Talk to us"). Note "usage-based pricing, final rates in
    beta" honestly rather than inventing firm prices.
25. `src/components/landing/EmailCapture.tsx` — email input + submit inserting into
    `email_leads`, success and duplicate-email states, GTM-aligned copy referencing campus
    partnerships and workshops.
26. Wire all sections into `src/routes/index.tsx` with `SiteHeader`/`SiteFooter`, and add
    framer-motion fade/rise-on-scroll for section entrances only (respect
    `prefers-reduced-motion`). No looping or decorative animation.

Acceptance: landing renders full-bleed dark, is responsive at 375/768/1440, email capture
persists a row, all CTAs route correctly, Lighthouse a11y contrast passes.

---

## Phase 5 — Onboarding

27. `src/routes/onboarding.tsx` — 2-step flow with a progress indicator and animated step
    transition. Step 1: goal (cards — "Fund my first year", "Cover tuition gap", "Graduate
    debt-free", "Support my students"). Step 2: primary use case (cards — "Find matching
    scholarships", "Generate application drafts", "Track deadlines & statuses") plus lightweight
    profile fields used by matching and generation: full name, school, grad year, GPA, major,
    state.
28. `src/components/onboarding/StepCardGroup.tsx` and `src/components/onboarding/StepNav.tsx`.
29. On finish, update `profiles` with goal, primary_use_case, profile fields and
    `onboarded = true`, refresh the auth context, and navigate to `/app`.

Acceptance: both steps validate before advancing, back navigation preserves state, completing
persists to the DB and `/onboarding` redirects to `/app` on revisit.

---

## Phase 6 — Core dashboard (the value)

30. `src/lib/matching.ts` — deterministic client-side match scoring: GPA threshold, major tag
    overlap, state match, level match, deadline proximity. Returns 0–100 score plus human
    reasons ("Matches your Computer Science major", "Deadline in 12 days").
31. `src/lib/generateDraft.ts` — builds a personalised application draft from the profile and
    the scholarship's `prompt`: structured opening, background from school/major/activities,
    goal paragraph derived from onboarding `goal`, closing tied to the sponsor. Deterministic
    templating with sentence variation so output reads written, not filled-in. Keep the module
    boundary clean so a model-backed generator can replace it later without touching the UI.
32. `src/hooks/useScholarships.ts`, `src/hooks/useApplications.ts` — fetch + mutate via Supabase;
    `useApplications` subscribes to Realtime changes on the user's rows for live status updates.
33. `src/routes/app/index.tsx` dashboard: stat row (active applications, in review, awarded,
    total requested), "Deadlines this month" strip, "Top matches for you" list, and the
    pipeline board grouped by status.
34. `src/components/app/ScholarshipCard.tsx` — name, sponsor, amount, deadline countdown chip,
    match score ring, match reasons, primary action "Generate application".
35. `src/components/app/GenerateDraftDialog.tsx` — shows generation progress, then the produced
    draft in an editable textarea; Save creates/updates the `applications` row as `draft`.
36. `src/components/app/ApplicationRow.tsx` + `src/components/app/StatusBadge.tsx` +
    `src/components/app/StatusSelect.tsx` — status transitions draft → submitted → under_review
    → awarded/rejected, stamping `submitted_at`/`decided_at`.
37. `src/routes/app/applications.$applicationId.tsx` — full workspace: scholarship detail, draft
    editor with autosave, status timeline, notes, external apply link.
38. `src/routes/app/scholarships.tsx` — full catalogue with search, sort (match / deadline /
    amount) and a "hide ones I've applied to" filter.
39. Empty, loading (skeleton) and error states for every list.

Acceptance: a new user sees ranked matches, can generate and edit a draft in under 15 seconds,
status changes persist and reflect instantly in the pipeline and in a second open tab via
Realtime, deadline countdowns are accurate.

---

## Phase 7 — Settings + account

40. `src/routes/app/settings.tsx` with three cards: **Profile** (editable name, school, grad
    year, GPA, major, state, activities, essay highlights — saves to `profiles`), **Plan**
    (current tier, usage counter of drafts generated this month, upgrade buttons that are
    clearly non-transactional placeholders), **Account** (email, sign out, danger-zone note).
41. `src/components/app/ProfileForm.tsx` and `src/components/app/PlanCard.tsx`.

Acceptance: edits persist and immediately improve match scores on the dashboard; sign out
clears the session and redirects to `/`.

---

## Phase 8 — Polish and ship

42. Add `src/routes/$.tsx` 404 with a route back to `/`, and a global error boundary in
    `__root.tsx`.
43. Accessibility and responsive pass: focus-visible rings on all interactive elements, labelled
    inputs, dialog focus trap, 44px touch targets, `prefers-reduced-motion` honoured.
44. Meta pass in `index.html`: title "ScholarSync — Building the future", description, favicon,
    OG tags, `theme-color` matching the background token.
45. Final verification: `npx tsc --noEmit` clean, `npm run build` succeeds, dev walkthrough of
    sign up → onboarding → generate draft → status change → settings → sign out.

Acceptance: production build passes with no type errors and the full happy path works end to end.
