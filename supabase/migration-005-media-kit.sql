-- Migration 005: media kit fields for influencer/brand intake
alter table briefs add column if not exists media_kit_text text;
alter table briefs add column if not exists media_kit_file_name text;
