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
- **Data & Setup**: dataset status, counting rules, Supabase setup, update workflow.

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

## Project layout

- `src/data/` - types, sample dataset, data provider (sample/Supabase switch)
- `src/lib/` - price-band logic, formatting, CSV export, model enrichment
- `src/pages/` - the seven site pages
- `src/components/` - layout, cards, filters, badges
- `supabase/migrations/` - PostgreSQL schema
- `.github/workflows/` - build, test and deploy pipeline
