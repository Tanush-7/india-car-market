-- Phase 4: notes on launch and price history (approximate dates, re-dating, caveats).
alter table launch_history add column if not exists notes text;
alter table price_history add column if not exists notes text;
