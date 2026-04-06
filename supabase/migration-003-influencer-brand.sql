-- ───────────────────────────────────────────
-- Migration 003: Influencer / Brand partnership path
-- Adds the columns the intake form has been collecting
-- for the influencer_brand user type but nothing was
-- persisting.
-- ───────────────────────────────────────────

-- Allow the new user_type value
alter table briefs
  drop constraint if exists briefs_user_type_check;

alter table briefs
  add constraint briefs_user_type_check
  check (user_type in ('job_seeker', 'hiring_manager', 'salesperson', 'influencer_brand'));

-- Partnership-specific fields
alter table briefs add column if not exists brand_creator_name text;
alter table briefs add column if not exists partnership_type text;
alter table briefs add column if not exists partnership_fit text;
alter table briefs add column if not exists audience_overlap_notes text;
alter table briefs add column if not exists unique_angle text;
