-- ═══════════════════════════════════════════════════════════
-- LORE — Database Schema
-- Run this in Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════

-- Briefs table — stores every intake submission + generated output
create table if not exists briefs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,

  -- User type: 'job_seeker' | 'hiring_manager' | 'salesperson'
  user_type text not null check (user_type in ('job_seeker', 'hiring_manager', 'salesperson')),

  -- Sender info
  sender_name text not null,
  sender_role text,
  sender_background text,
  sender_company text,
  sender_company_desc text,

  -- Resume (for job_seeker & hiring_manager flows)
  resume_text text,
  resume_file_name text,

  -- Target / candidate / prospect
  target_name text not null,
  target_title text,
  target_company text,
  target_linkedin text,

  -- Context
  outreach_type text,
  goal text,
  notes text,

  -- Hiring manager specific
  role_hiring_for text,
  role_compelling text,
  specific_angle text,

  -- Salesperson specific
  prospect_industry text,
  pain_points text,
  your_product text,

  -- Pricing & payment
  plan text not null default 'one_off' check (plan in ('one_off', 'subscription', 'pack_five')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  stripe_session_id text,
  stripe_customer_id text,

  -- Generated output (populated after payment + AI generation)
  brief_html text,
  brief_status text not null default 'draft' check (brief_status in ('draft', 'generating', 'ready', 'revised', 'error')),
  email_subject text,
  email_body text,

  -- Revision tracking (1 round included)
  revision_requested boolean default false,
  revision_notes text,
  revision_completed boolean default false
);

-- Subscriptions table — tracks $49.99/mo unlimited plans
create table if not exists subscriptions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,

  email text not null,
  stripe_customer_id text not null,
  stripe_subscription_id text not null,
  status text not null default 'active' check (status in ('active', 'canceled', 'past_due', 'paused')),
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  plan text not null default 'subscription'
);

-- Credit packs table — tracks 5-pack purchases
create table if not exists credit_packs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now() not null,

  email text not null,
  stripe_session_id text,
  total_credits integer not null default 6,  -- 5 + 1 free
  used_credits integer not null default 0,
  remaining_credits integer generated always as (total_credits - used_credits) stored
);

-- Auto-update updated_at on briefs
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger briefs_updated_at
  before update on briefs
  for each row execute function update_updated_at();

create trigger subscriptions_updated_at
  before update on subscriptions
  for each row execute function update_updated_at();

-- Index for fast lookups
create index if not exists idx_briefs_payment_status on briefs(payment_status);
create index if not exists idx_briefs_stripe_session on briefs(stripe_session_id);
create index if not exists idx_subscriptions_email on subscriptions(email);
create index if not exists idx_subscriptions_stripe_sub on subscriptions(stripe_subscription_id);
create index if not exists idx_credit_packs_email on credit_packs(email);

-- ═══════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- Enforces that only server-side (service_role key) can
-- read/write data. No anonymous client access.
-- ═══════════════════════════════════════════════════════════

alter table briefs enable row level security;
alter table subscriptions enable row level security;
alter table credit_packs enable row level security;

-- Service role can do everything (used by our API routes)
create policy "Service role full access on briefs"
  on briefs for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "Service role full access on subscriptions"
  on subscriptions for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "Service role full access on credit_packs"
  on credit_packs for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Allow anonymous inserts to briefs (intake form submissions)
-- but NOT reads (briefs are only readable via server-side)
create policy "Anon can insert briefs"
  on briefs for insert
  with check (true);
