-- ─────────────────────────────────────────────────────────────────────────────
-- SOMA — the schema this app expects.
--
-- Your Supabase project is already migrated. Use this file to CHECK that the
-- column names match what src/lib/store.ts reads and writes. If yours differ,
-- you have two options:
--   1. Rename the columns in Supabase to match, or
--   2. Edit PROFILE_COLUMNS at the top of src/lib/store.ts — that object is the
--      only place in the app that knows about column names.
--
-- Safe to run as-is on a fresh project: everything is IF NOT EXISTS.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.soma_profiles (
  user_id           uuid primary key references auth.users(id) on delete cascade,
  name              text,
  sex               text,
  age               int,
  cycle_length      int  default 28,
  cycle_days_since  int  default 8,
  cycle_regular     text,
  activity          text,
  goals             text[] default '{}',
  sleep_quality     text,
  stress            int,
  diet              text,
  premium           boolean not null default false,
  streak            int not null default 1,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table if not exists public.soma_scans (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  hormone     text not null check (
                hormone in ('cortisol','estrogen','testosterone','insulin','dopamine','melatonin')
              ),
  score       int  not null check (score between 0 and 100),
  answers     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists soma_scans_user_id_idx on public.soma_scans (user_id, created_at desc);

create table if not exists public.soma_daily_scores (
  user_id  uuid not null references auth.users(id) on delete cascade,
  day      date not null,
  score    int  not null check (score between 0 and 100),
  primary key (user_id, day)
);

-- ── Row level security ───────────────────────────────────────────────────────
-- Every policy is keyed to auth.uid(), which works identically for anonymous
-- sessions: an anonymous user is a real row in auth.users with a stable id.

alter table public.soma_profiles     enable row level security;
alter table public.soma_scans        enable row level security;
alter table public.soma_daily_scores enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'soma_profiles' and policyname = 'own profile') then
    create policy "own profile" on public.soma_profiles
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'soma_scans' and policyname = 'own scans') then
    create policy "own scans" on public.soma_scans
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'soma_daily_scores' and policyname = 'own daily scores') then
    create policy "own daily scores" on public.soma_daily_scores
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

-- Note: the Stripe webhook updates `premium` using the service_role key, which
-- bypasses RLS by design. Users can never grant themselves premium from the
-- client, because the client only ever reads that column.
