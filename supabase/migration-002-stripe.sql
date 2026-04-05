-- ═══════════════════════════════════════════════════════════
-- LORE — Migration 002: Stripe + Contact ID fields
-- Run this in Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════

-- Add sender_email to briefs (needed for Stripe checkout + delivery)
alter table briefs add column if not exists sender_email text;

-- Add contact_id_requested flag (for $1.99 add-on)
alter table briefs add column if not exists contact_id_requested boolean default false;

-- Add contact_id_status to track Apollo lookup result
alter table briefs add column if not exists contact_id_status text default 'none'
  check (contact_id_status in ('none', 'pending', 'found', 'not_found'));

-- Add contact_id_data to store Apollo results (JSON as text)
alter table briefs add column if not exists contact_id_data text;
