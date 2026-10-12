# Phase 4 Validation Report — Launch & Price History, Oct 2023 – Oct 2026

Researched 2026-10-12. Raw per-maker files in `data-collection/raw-history/*.json`.
Scope: the 75 Phase 3 verified models (₹10–25L ex-showroom segment).

## Headline totals

- **50 launch events** (new nameplates, new generations, major facelifts, EV derivatives)
- **432 dated variant price changes**
- **86 model-level notes** (range-wide revisions, no-event attestations)
- **141 flags**
- **35 of 482 dated records (7.3%) from official manufacturer sources**; the rest are press/portal-sourced estimates

## Per-maker summary

| Maker | Launches | Price changes | Model notes | Flags |
|---|---|---|---|---|
| Mahindra | 12 | 29 | 9 | 15 |
| Tata Motors | 11 | 9 | 12 | 11 |
| Kia | 6 | 1 | 13 | 14 |
| Hyundai | 4 | 10 | 9 | 10 |
| Maruti Suzuki | 3 | 79 | 6 | 17 |
| Skoda | 3 | 67 | 10 | 14 |
| MG Motor | 3 | 29 | 5 | 12 |
| Toyota | 2 | 58 | 7 | 13 |
| Nissan | 2 | 22 | 2 | 7 |
| Renault | 2 | 24 | 5 | 7 |
| Honda | 1 | 62 | 4 | 11 |
| Volkswagen | 1 | 42 | 4 | 10 |

## Programmatic checks (all pass, 1 deviation noted)

- All launch and price-change dates within 2023-10-01..2026-10-31.
- All model_ids exist in the Phase 3 set of 75 (MG `windsor-ev` raw id noted for the
  existing `windsor` alias at integration).
- All launch_type values from the allowed four.
- Every dated record carries a source_url.
- **Deviation:** one Maruti model_note uses model_id `"all"` (range-wide GST note).
  Split into per-model notes or keep as a maker-level note at integration.

## CRITICAL — GST 2.0 effective date is 22 Sep 2025, not 2026

Independently verified (Financial Express, Business Today, testbook): India's GST 2.0
rate cut took effect **22 September 2025**. The "22 Sep 2026" date in the Phase 3
materials, the live site's banner, Data & Setup page, and VERIFIED_NOTE is wrong and
must be corrected on the site.

Impact on this dataset: **90 price-change records are dated 2026-09-22** for GST-cut
revisions (from the Hyundai, Tata, Nissan, Skoda, Toyota, Maruti and MG researchers);
**47 use the correct 2025-09-22** (Renault, Honda, Volkswagen researchers). At
integration, the 90 misdated records must be re-dated to 2025-09-22 (the underlying
price figures themselves are unaffected — only the effective-date year is wrong).

## Variant-name matching

411 of 432 price changes (95.2%) match a variant name in the verified dataset.
21 unmatched names, all flagged by researchers, mostly newer/older trims absent from
the Phase 3 lists:

- Honda Elevate: `ZX Black 1.5P`, `ZX Black 1.5P CVT`, `ZX 1.5P CVT Dual Tone`
- Honda City: `VX 1.5P`, `VX 1.5P CVT`, `Sports 1.5P CVT`
- Skoda Kushaq: `Sportline 1.5 TSI DSG`
- Skoda Slavia: `Monte Carlo 1.0 TSI MT`, `Sportline 1.5 TSI DSG`

Integration decision needed: attach to nearest trim, or drop with the flag preserved.

## Second-source cross-checks (coordinator-verified)

- Kia Sonet facelift: researcher 2024-01-12, Rs 7.99L — confirmed by Team-BHP
  ("went on sale January 12, Rs 7.99 lakh"), carandbike (published 12 Jan 2024),
  CarDekho (launch update 12/01/2024). MATCH.
- Mahindra Thar Roxx: researcher 2024-08-15, Rs 12.99L — confirmed by CNBC TV18
  ("launched Independence Day August 15", Rs 12.99 lakh) and Autocar India.
  Researcher-flagged nuance (reveal evening of Aug 14, prices announced Aug 15)
  is accurate. MATCH.

## Notable findings and risks for integration

1. **Phase 3 cross-contamination (Tata):** the Tata researcher found diesel variant
   names under `nexon-ev` in verifiedData.ts. Worth a Phase 3 data fix, not just
   a Phase 4 note.
2. **Approximate effective dates:** several revisions use month-start placeholders
   where sources gave no exact day (e.g. June 2026 Hyundai revision as 2026-06-01,
   Victoris Oct 2026 hike as 2026-10-01, VW Jan 2026 as 2026-01-01). All flagged
   in-file; the app should surface the approximation.
3. **Window-edge events:** Honda Elevate facelift 2026-10-06 and Skoda Slavia
   facelift 2026-10-06 fall inside the window but after the Phase 3 price snapshot
   (Oct 12 verified prices may already reflect them — Elevate's do not, flagged).
   VW Virtus facelift and Duster strong-hybrid prices were unannounced as of
   2026-10-12 — future events, correctly excluded.
4. **BaaS vs full price (MG Windsor, Maruti e-Vitara):** launch prices quoted are
   battery-rental figures; full-purchase prices differ. Recorded per researcher
   notes; keep the distinction at integration.
5. **Launch-price vs current-price drift:** several launch entry prices no longer
   match the Phase 3 snapshot (e.g. Kia Syros HTE 8.67L vs expected ~7.74L
   post-GST), implying incomplete pass-through or unrecorded interim revisions.
   Documented in flags; not reconciled.

## Top 5 concerns

1. **GST date error (verified):** 90 records misdated 2026-09-22; the live site's
   "22 Sep 2026" references are wrong. Fix both at integration.
2. **Only 7.3% official-source:** 447 of 482 dated records are press/portal
   estimates. Launch dates are the most reliable field; per-variant historical
   prices are the least.
3. **21 unmatched variant names** need an integration decision (attach vs drop).
4. **Approximate effective dates** on ~a dozen revisions — must stay flagged, not
   presented as exact.
5. **Phase 3 nexon-ev variant contamination** found incidentally — fix in the
   verified dataset, not just here.

## Files

- `data-collection/raw-history/*.json` — 12 maker files, schema-validated
- `data-collection/VALIDATION_HISTORY.md` — this report
- Integration is out of scope for this phase; nothing under `src/` was touched.
