# CarScope India - indian-car-market

A public, interactive website for exploring the Indian passenger-car market by
price band, manufacturer, body type and fuel type. Built with React,
TypeScript, Vite, Tailwind CSS and Recharts; data lives in Supabase
(PostgreSQL), with a bundled sample dataset so the site works with no backend.

## What is built (Phase 1-2)

- **Dashboard**: active models, manufacturers, variants, average starting price,
  cheapest/most expensive models, models per ₹5L band, maker/fuel/body distributions.
  Every figure is computed from the dataset, never hardcoded.
- **Model Explorer**: searchable, filterable, sortable table of on-sale models with
  variant counts, fuel/transmission options, launch year, source and verification
  info, model detail view, pagination and CSV export.
- **Price Segments**: ₹5L bands from ₹0 to ₹70L+ with two counting modes
  (starting-price vs variant-overlap), per-band model/variant/maker counts, top
  makers, avg/median prices, and body/fuel breakdowns.
- **Makers**: manufacturer x price-band heatmap (distinct models or variants),
  ranked maker chart, average starting price by maker.
- **Body & Fuel**: stacked body-type vs band and fuel-type vs band charts with
  maker/fuel filters.
- **Launches**: Oct 2023 - Oct 2026 launch history (nameplates, generations,
  facelifts, EV derivatives) plus discontinued models kept separate.
- **Complaints & Recalls**: why India has no public per-model complaint counts,
  2025 vehicle recalls by maker (SIAM data via Moneycontrol), recalls since 2012
  and defect categories (Factly / SIAM portal), plus where to check a recall or
  file a complaint (NCH 1915).
- **Bengaluru on-road price**: every variant in the Model Explorer shows an
  estimated on-road total for Bengaluru (Karnataka road-tax slabs + 11% cess +
  Rs 1,000 road-safety tax + registration / HSRP / FASTag + first-year insurance
  estimate + 1% TCS above Rs 10 lakh), with a full breakdown in the model view.
- **Annual maintenance**: Dashboard chart of typical annual maintenance by maker
  and a per-model segment estimate in the Model Explorer, from published 2026
  segment averages (scheduled service + wear-and-tear reserve; fuel, insurance
  and depreciation excluded). All figures are labelled estimates.
- **Data & Setup**: verification progress with the researched-vs-sample split
  computed from the dataset (banner, Explorer badges and this page always agree),
  counting rules, Supabase setup, and the weekly refresh checklist.

## Counting rules

- Model counts use distinct model IDs.
- Price bands are ₹5L steps, lower-inclusive / upper-exclusive; the final band is ₹70L+.
- All segment math uses ex-showroom prices. On-road prices never feed the bands.
- Variant-overlap mode counts a model in every band holding one of its variants.

## Local development

```bash
npm install
npm run dev      # sample data, http://localhost:5173/india-car-market/
npm test         # vitest: price-band logic and counting rules
npm run build    # static output in dist/
```

## Data: sample vs live

The bundled dataset in `src/data/sampleData.ts` is **clearly-labelled illustrative
sample data** - every record has `isEstimate: true` and `sourceUrl: 'sample'`,
and the site shows a banner while it is active. Do not present it as market data.

To go live:

1. Create a Supabase project and run `supabase/migrations/0001_init.sql`.
2. Insert verified records (official price lists, press releases, permitted feeds -
   never scrape against a site's terms). Every record needs `source_url`,
   `last_verified_at` and `is_estimate`. Never invent prices.
3. Copy `.env.example` to `.env`, set `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY` (anon key only - never the service-role key).
4. Rebuild. The site reads Supabase automatically when the variables are set;
   no frontend changes are needed.

## Deploy to GitHub Pages

1. Create the repo `india-car-market` on GitHub and push this code.
2. In repo Settings - Pages, set Source to **GitHub Actions**.
3. (Optional) Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as repository
   secrets for live data; without them the sample banner stays on.
4. Push to `main` - `.github/workflows/deploy.yml` runs tests, builds and deploys.
   The site is served from `https://<user>.github.io/india-car-market/`.

## Updating prices without touching the frontend

- Price change: insert a row in `price_history` (and update the variant's current price).
- New launch: insert a row in `launch_history`; add the model + variants.
- Discontinuation: set `current_status = 'discontinued'`; history is preserved.

## Weekly refresh (every Monday)

The site shows two visible dates: the price-data date (banner, footer, Data &
Setup) and the derived-figures date (on-road, maintenance, recalls). Both come
from data files, never from components, so a refresh is a data edit + push.

1. **Prices** - check official manufacturer price lists and the portal sources
   listed in `data-collection/VALIDATION.md` for changes since the last refresh.
   Update `src/data/verifiedData.ts` (and `src/data/verifiedHistory.ts` for price
   changes) and set `VERIFIED_AT` to the refresh date. Do not re-date prices you
   did not actually check.
2. **Bengaluru on-road** - re-check the Karnataka slabs in
   `src/data/onRoad.ts` (Spinny, mycarhelpline) and update `ONROAD_UPDATED_AT`.
   Change the slab table if the state revises rates; the components compute from it.
3. **Maintenance** - re-check the segment averages in
   `src/data/maintenance.ts` (motomotar 2026 guide) and update
   `MAINTENANCE_UPDATED_AT`. Only change a segment range when the source updates it.
4. **Complaints & recalls** - re-check the SIAM portal summaries in
   `src/data/complaints.ts` (Moneycontrol / Factly) and update
   `COMPLAINTS_UPDATED_AT`. If a per-model complaint dataset ever becomes public,
   add it as a new table in this file with its source and date; do not use
   aggregator counts (self-selected, unverified).
5. **Verify** - run `npm test` and `npm run build` locally; fix any failures.
6. **Ship** - commit and push to `main`. `.github/workflows/deploy.yml` runs
   tests, builds and deploys to GitHub Pages. Check the live site afterwards:
   `https://tanush.tech/india-car-market/` and
   `https://tanush-7.github.io/india-car-market/`.

Price-data re-verification against official lists is a separate, larger pass
(most current prices are portal estimates); it is not part of the weekly refresh.

## Project layout

- `src/data/` - types, sample dataset, verified dataset, data provider (sample/Supabase switch),
  and the derived tables refreshed weekly: `onRoad.ts` (Karnataka on-road math),
  `maintenance.ts` (segment maintenance estimates), `complaints.ts` (recall figures + sources)
- `src/lib/` - price-band logic, formatting, CSV export, model enrichment
- `src/pages/` - the eight site pages
- `src/components/` - layout, cards, filters, badges
- `supabase/migrations/` - PostgreSQL schema
- `.github/workflows/` - build, test and deploy pipeline
