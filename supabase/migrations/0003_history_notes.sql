-- Phase 4: notes and estimate flags on launch and price history
-- (approximate dates, GST re-dating, caveats).
alter table launch_history add column if not exists notes text;
alter table price_history add column if not exists notes text;
alter table price_history add column if not exists is_estimate boolean not null default true;
