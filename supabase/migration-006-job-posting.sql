-- Migration 006: job posting paste, published work links
alter table briefs add column if not exists job_posting_text text;
alter table briefs add column if not exists published_work_links text;
