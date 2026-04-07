-- Add missing influencer/brand + misc columns
alter table briefs add column if not exists brand_creator_name text;
alter table briefs add column if not exists partnership_type text;
alter table briefs add column if not exists partnership_fit text;
alter table briefs add column if not exists audience_overlap_notes text;
alter table briefs add column if not exists unique_angle text;
alter table briefs add column if not exists contact_id_requested boolean default false;

-- Also add salesperson + hiring manager fields if they were missed
alter table briefs add column if not exists role_hiring_for text;
alter table briefs add column if not exists role_compelling text;
alter table briefs add column if not exists specific_angle text;
alter table briefs add column if not exists prospect_industry text;
alter table briefs add column if not exists pain_points text;
alter table briefs add column if not exists your_product text;
alter table briefs add column if not exists sender_company text;
alter table briefs add column if not exists sender_company_desc text;
