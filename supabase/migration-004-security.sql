-- Migration 004 — security hardening
-- 1. Drop the anon-insert policy on briefs. All inserts now flow through
--    /api/briefs, which uses the service_role key server-side. This
--    prevents anyone with the public anon key from spamming rows that
--    bypass our API validation.
drop policy if exists "Anon can insert briefs" on briefs;

-- 2. Per-brief access token. Viewing a brief now requires both the UUID
--    and a random token. UUIDs are guessable enough to be treated as
--    identifiers, not secrets.
alter table briefs
  add column if not exists access_token text;

-- Backfill existing rows with a random token so live briefs keep working.
update briefs
   set access_token = encode(gen_random_bytes(24), 'hex')
 where access_token is null;

-- New rows get one automatically.
alter table briefs
  alter column access_token set default encode(gen_random_bytes(24), 'hex');

-- 3. Stripe webhook idempotency. Dedupe by event id so Stripe retries
--    don't double-insert subscriptions/credit packs.
create table if not exists stripe_events (
  id text primary key,
  received_at timestamptz not null default now()
);

alter table stripe_events enable row level security;

create policy "Service role full access on stripe_events"
  on stripe_events for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
