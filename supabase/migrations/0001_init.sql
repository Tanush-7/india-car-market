-- CarScope India: initial schema.
-- Run in the Supabase SQL editor. All prices are ex-showroom INR (integer rupees).

create table if not exists makers (
  id text primary key,
  name text not null unique,
  country_of_origin text
);

create table if not exists models (
  id text primary key,
  maker_id text not null references makers(id) on delete cascade,
  model_name text not null,
  body_type text not null check (body_type in
    ('SUV','Crossover','Sedan','Hatchback','MPV','Coupe','Off-road','Other')),
  first_launch_date date,
  latest_generation_date date,
  latest_facelift_date date,
  current_status text not null default 'active'
    check (current_status in ('active','discontinued')),
  source_url text not null,
  last_verified_at date not null,
  is_estimate boolean not null default true,
  unique (maker_id, model_name)
);

create table if not exists variants (
  id text primary key,
  model_id text not null references models(id) on delete cascade,
  variant_name text not null,
  fuel_type text not null check (fuel_type in
    ('Petrol','Diesel','CNG','Electric','Hybrid','Plug-in Hybrid','Other')),
  transmission text not null check (transmission in
    ('Manual','AMT','iMT','CVT','DCT','Automatic')),
  drivetrain text,
  ex_showroom_price integer not null check (ex_showroom_price > 0),
  launch_date date,
  availability_status text not null default 'available'
    check (availability_status in ('available','discontinued')),
  source_url text,
  last_verified_at date,
  is_estimate boolean not null default true
);

create table if not exists price_history (
  id text primary key,
  variant_id text not null references variants(id) on delete cascade,
  ex_showroom_price integer not null check (ex_showroom_price > 0),
  city text,
  on_road_price integer,
  effective_date date not null,
  source_url text not null,
  last_verified_at date not null default current_date
);

create table if not exists launch_history (
  id text primary key,
  model_id text not null references models(id) on delete cascade,
  launch_date date not null,
  launch_type text not null check (launch_type in
    ('New nameplate','New generation','Major facelift','EV derivative')),
  launch_price integer,
  source_url text not null
);

create index if not exists idx_models_maker on models(maker_id);
create index if not exists idx_models_status on models(current_status);
create index if not exists idx_variants_model on variants(model_id);
create index if not exists idx_variants_price on variants(ex_showroom_price);
create index if not exists idx_price_history_variant on price_history(variant_id);
create index if not exists idx_launch_history_date on launch_history(launch_date);

-- Public read access for the static frontend; writes stay behind the service key.
alter table makers enable row level security;
alter table models enable row level security;
alter table variants enable row level security;
alter table price_history enable row level security;
alter table launch_history enable row level security;

create policy "public read" on makers for select using (true);
create policy "public read" on models for select using (true);
create policy "public read" on variants for select using (true);
create policy "public read" on price_history for select using (true);
create policy "public read" on launch_history for select using (true);

-- The frontend (src/data/provider.ts) maps these snake_case columns to camelCase
-- fields, with model_name/variant_name -> name and current_status -> status.
