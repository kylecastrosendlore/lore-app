-- ═══════════════════════════════════════════════════════════
-- LORE — Migration 008: Brief Shell cut-over scaffolding
-- ═══════════════════════════════════════════════════════════
-- Adds a structured JSON column alongside the legacy brief_html,
-- enabling the new React-based Brief Shell to render content
-- from typed slots instead of AI-generated HTML.
--
-- Zero downtime:
--   • brief_json is nullable with no default
--   • Metadata-only change, no table rewrite
--   • Existing briefs render via legacy brief_html path
--   • New briefs dual-write both columns during transition
--
-- Run this in Supabase Dashboard → SQL Editor.
-- ═══════════════════════════════════════════════════════════

alter table briefs
  add column if not exists brief_json jsonb;

comment on column briefs.brief_json is
  'Structured brief content (BriefContent type). Rendered by the React Brief Shell. Nullable during transition — legacy briefs use brief_html.';

-- No RLS policy changes needed: existing policies on `briefs` use SELECT *,
-- so the new column inherits the same row-level gating automatically.
-- Verified against migration-004-security.sql.
