-- ============================================================
-- Vipāka — Supabase schema
-- Run in: Supabase Dashboard → SQL Editor → New query → Run
--
-- Identity model: Supabase ANONYMOUS AUTH.
--
-- The browser calls `supabase.auth.signInAnonymously()` on first visit. That
-- mints a real user row in auth.users and a real signed JWT, so `auth.uid()`
-- is a value the database issued and the client cannot forge. Every policy
-- below hangs off it.
--
-- This replaces an earlier draft that trusted an `x-anon-id` request header.
-- That header was set by the client, so anyone could put someone else's UUID
-- in it and edit their row — the honeypot and rate limit were doing the work
-- the policy was supposed to do. Do not reintroduce it.
--
-- Still no backend server: the browser talks to Supabase directly with the
-- ANON key. RLS is the only thing protecting it, so do not weaken it.
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Prerequisite — enable Anonymous sign-ins
-- ------------------------------------------------------------
-- Dashboard → Authentication → Providers → Anonymous Sign-Ins → ON.
-- Cannot be set from SQL. Nothing below works until it is on.
--
-- Also turn on CAPTCHA (Authentication → Settings → Bot and Abuse Protection)
-- before launch. Anonymous sign-in is an unauthenticated row-creating endpoint;
-- without a captcha, auth.users is the thing that gets flooded, not reviews.

-- ------------------------------------------------------------
-- reviews
-- ------------------------------------------------------------
create table if not exists public.reviews (
  id           uuid primary key default gen_random_uuid(),

  -- The anonymous user's auth.uid(). FK so a deleted auth user takes their
  -- reviews with them, which is also how moderation removes a bad actor.
  anon_id      uuid not null references auth.users (id) on delete cascade,

  target       text not null default 'film',     -- 'film' | 'trailer-1' | ...
  rating       smallint not null check (rating between 1 and 5),
  sentiment    text check (sentiment in ('like','dislike')),
  body         text check (char_length(body) <= 1000),
  display_name text check (char_length(display_name) <= 40),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  -- one review per identity per target; the client upserts on this
  unique (anon_id, target)
);

create index if not exists reviews_target_created_idx
  on public.reviews (target, created_at desc);

-- ------------------------------------------------------------
-- sentiment_rank — sort key for "liked first, then neutral, then disliked"
-- ------------------------------------------------------------
-- The list has to group by sentiment, and sentiment cannot do it itself:
-- ordering on the text column puts 'dislike' before 'like' alphabetically and
-- leaves nulls at one end or the other, which is neither of the groupings we
-- want. A CASE in the client's ORDER BY is not an option either — PostgREST
-- only takes column names.
--
-- Generated STORED rather than an expression index, because the client needs
-- something it can name in `.order()`. The index below is what makes it cheap;
-- the column is what makes it addressable.
--
-- It is `generated always`, so it cannot be inserted or updated. That is why
-- neither RLS `with check` clause mentions it — there is no way for a client
-- to supply one, spoofed or otherwise.
alter table public.reviews
  add column if not exists sentiment_rank smallint
  generated always as (
    (case sentiment when 'like' then 0 when 'dislike' then 2 else 1 end)::smallint
  ) stored;

-- Matches the list query exactly: filter on target, then the three ORDER BY
-- keys in order. `id` is in the index because it is in the sort — see below.
create index if not exists reviews_target_sentiment_created_idx
  on public.reviews (target, sentiment_rank, created_at desc, id);

-- keep updated_at honest
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists reviews_touch on public.reviews;
create trigger reviews_touch
  before update on public.reviews
  for each row execute function public.touch_updated_at();

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------
alter table public.reviews enable row level security;

-- Clean slate: drop the header-based policies from the previous draft if this
-- is a re-run over an existing project.
drop policy if exists "reviews readable by all"      on public.reviews;
drop policy if exists "reviews insertable by all"    on public.reviews;
drop policy if exists "reviews updatable by owner"   on public.reviews;

-- anyone may read, signed in or not
create policy "reviews are readable by everyone"
  on public.reviews for select
  to anon, authenticated
  using (true);

-- you may only insert a row that belongs to you.
-- `to authenticated` matters: an anonymous-auth user IS authenticated — they
-- hold a real JWT whose `is_anonymous` claim is true. A caller with no session
-- at all has auth.uid() = null and fails the check outright.
create policy "reviews are insertable by their owner"
  on public.reviews for insert
  to authenticated
  with check (
    anon_id = (select auth.uid())
    and rating between 1 and 5
    and char_length(coalesce(body, '')) <= 1000
    and char_length(coalesce(display_name, '')) <= 40
  );

-- you may only update your own row, and may not reassign it to someone else.
-- This is what makes upsert-on-conflict work: the insert is attempted, the
-- unique (anon_id, target) conflict fires, and the update path is authorised
-- by the same uid.
create policy "reviews are updatable by their owner"
  on public.reviews for update
  to authenticated
  using  (anon_id = (select auth.uid()))
  with check (
    anon_id = (select auth.uid())
    and rating between 1 and 5
    and char_length(coalesce(body, '')) <= 1000
    and char_length(coalesce(display_name, '')) <= 40
  );

-- nobody deletes from the browser. Moderate from the dashboard.
-- (absence of a delete policy = delete denied)

-- ------------------------------------------------------------
-- Server-side rate limit
-- ------------------------------------------------------------
-- Client-side throttling is a courtesy, not a control. This is the real one:
-- one anonymous identity cannot post more than 5 reviews in any 10 minutes,
-- regardless of what the client does.
create or replace function public.enforce_review_rate_limit()
returns trigger language plpgsql security definer
set search_path = public as $$
declare
  recent_count int;
begin
  select count(*) into recent_count
  from public.reviews
  where anon_id = new.anon_id
    and target <> new.target
    and created_at > now() - interval '10 minutes';

  if recent_count >= 5 then
    raise exception 'rate limit exceeded' using errcode = 'check_violation';
  end if;

  return new;
end $$;

drop trigger if exists reviews_rate_limit on public.reviews;
create trigger reviews_rate_limit
  before insert on public.reviews
  for each row execute function public.enforce_review_rate_limit();

-- ------------------------------------------------------------
-- aggregate view — one cheap request for "4.6 ★ (128 Reviews)"
-- ------------------------------------------------------------
-- security_invoker so the view is subject to the caller's RLS rather than the
-- definer's. Reviews are world-readable anyway, but a view that quietly runs
-- as its owner is how a future schema change leaks.
create or replace view public.review_stats
with (security_invoker = true) as
select
  target,
  count(*)                                        as review_count,
  round(avg(rating)::numeric, 1)                  as average_rating,
  count(*) filter (where sentiment = 'like')      as likes,
  count(*) filter (where sentiment = 'dislike')   as dislikes
from public.reviews
group by target;

grant select on public.review_stats to anon, authenticated;

-- ------------------------------------------------------------
-- Test-data cleanup (safe to re-run; deletes nothing a visitor wrote)
-- ------------------------------------------------------------
-- The browser has no delete policy by design, so verification rows can only
-- be removed from here. `zz-probe-*` are the pagination-stability seeds; the
-- two film rows are the Sprint C gate and the sentiment round-trip.
--
--   delete from public.reviews where target like 'zz-probe-%';
--   delete from public.reviews
--    where target = 'film'
--      and (body like 'GATE-%'
--           or body = 'RLS gate — owned by A, no display name.'
--           or body = 'body text that must survive an edit'
--           or body is null and display_name is null);
--
-- The anonymous auth.users rows those tests created stay behind too, and
-- Supabase does not prune them. They are only reachable with elevated rights:
--   Dashboard → Authentication → Users → filter "Anonymous" → delete.
-- Deleting a user cascades to their reviews (see the FK on anon_id).

-- ------------------------------------------------------------
-- Post-run checklist
-- ------------------------------------------------------------
-- 1. Authentication → Providers → Anonymous Sign-Ins is ON.
-- 2. Table Editor → reviews → confirm the "RLS enabled" badge is green.
-- 3. Settings → API → copy Project URL + anon public key into .env.local as
--    NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY.
--    Never copy the service_role key into a Next.js app.
-- 4. Authentication → URL Configuration → add the Vercel domain.
-- 5. Before launch: Authentication → Settings → enable CAPTCHA, and consider
--    a scheduled cleanup of anonymous users older than 30 days that own no
--    reviews (they accumulate; Supabase does not prune them for you).
-- 6. Smoke test from the browser console on the deployed site:
--      insert your own review                  → succeeds
--      update your own review                  → succeeds
--      update a row where anon_id <> auth.uid() → 0 rows
--      insert with anon_id spoofed to another  → RLS violation
--      delete anything                          → RLS violation
-- 7. Client bootstraps identity with:
--      const { data: { session } } = await supabase.auth.getSession()
--      if (!session) await supabase.auth.signInAnonymously()
--    The JWT is persisted by supabase-js. localStorage still holds nothing
--    but that session and the "already rated" UI flag — never review content.
