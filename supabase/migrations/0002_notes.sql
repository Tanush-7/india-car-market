-- Phase 3: per-model data-quality notes (flags, caveats, omitted sub-variants).
alter table models add column if not exists notes text;
