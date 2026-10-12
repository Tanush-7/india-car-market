# Phase 3 Validation Report — ₹10–25L ex-showroom segment

Researched 2026-10-12. Raw per-maker files in `data-collection/raw/*.json`.
Scope: every passenger car model on sale in India with at least one variant
priced ₹10,00,000–₹25,00,000 ex-showroom.

## Headline totals

- **75 models** included across **12 makers**
- **1,109 variants** collected (full variant lists, including variants priced outside the band)
- **15 of 1,109 prices (1.4%) from official manufacturer sources**; the rest are portal-sourced estimates (`is_estimate=true`)
- **62 models excluded** with documented reasons
- **207 flags** recorded across all makers

## Per-maker summary

| Maker | Models | Variants | Official-src prices | Excluded | Flag count |
|---|---|---|---|---|---|
| Tata Motors | 13 | 292 | 0 | 7 | 32 |
| Mahindra | 12 | 160 | 0 | 5 | 34 |
| Hyundai | 9 | 149 | 1 | 6 | 27 |
| Kia | 7 | 146 | 3 | 4 | 18 |
| Maruti Suzuki | 10 | 106 | 0 | 10 | 28 |
| Toyota | 6 | 68 | 1 | 7 | 13 |
| MG Motor | 6 | 40 | 10 | 6 | 26 |
| Nissan | 2 | 40 | 0 | 2 | 4 |
| Skoda | 3 | 36 | 0 | 3 | 9 |
| Renault | 2 | 30 | 0 | 6 | 5 |
| Volkswagen | 2 | 23 | 0 | 3 | 5 |
| Honda | 3 | 19 | 0 | 3 | 6 |

## Coverage checks (all pass)

- Every included model has ≥ 1 variant priced within ₹10–25L. **No model fails the band check.**
- No model has zero variants. No variant is missing a `source_url`. No model is missing a `source_url`.
- All `body_type`, `fuel`, `transmission` values match the allowed vocab exactly (checked programmatically).
- Every record carries verification date 2026-10-12.

## Systemic data-quality concerns (from flags)

1. **Official price lists are not text-accessible.** Only 1.4% of prices come from
   manufacturer sites (10 MG, 3 Kia base figures, 1 Hyundai, 1 Toyota). Official
   India sites are JS-heavy or publish only "starts from" prices (Honda). The
   brief's preferred source (official price lists) could not be used at scale
   without a live browser. Recommendation: re-verify portal figures against
   official PDFs/dealer lists before publishing as verified.
2. **GST 2.0 rate cut (22 Sep 2026) churn.** Many portal variant tables predate
   the cut; several makers revised prices in late Sep / early Oct 2026 (Skoda
   ~1.2% hike Oct 1; Kia post-GST revisions; Nissan Oct hike). Figures may be
   marginally stale. Recommendation: one re-verification pass against
   post-cut tables.
3. **Precision loss.** Several portals quote prices in whole or 2-decimal lakhs;
   researchers converted to integer rupees (e.g. 7.45L → 745000). These are
   flagged as unverified exacts. A few dual-tone premiums were derived, not quoted.
4. **Variant granularity inflation.** High variant counts on some models
   (Sierra 47, Nexon 44, Safari 43, Seltos 40, Carens Clavis ICE 39, Creta 38)
   include edition/sub-trim splits whose individual prices could not always be
   verified; unverified sub-variants were omitted and flagged (e.g. Nexon Dark
   editions, Creta Electric Knight/Lounge packs, Thar Roxx AX7L 4WD).
5. **Borderline inclusions.** Toyota Glanza (₹9.99L vs ₹10.00L across sources),
   Renault Kiger and Nissan Magnite top variants sit exactly at the ₹10L floor;
   a price revision either way moves them in/out. Flagged per model.

## Notable market findings (verify before publishing)

- Mahindra XUV700 discontinued Jan 2026, replaced by XUV 7XO; XUV400 EV appears discontinued (stock clearance), replaced by XUV 3XO EV.
- New 2026 launches captured: Tata Sierra / Sierra EV, Renault Duster (Mar 2026), Nissan Tekton (Jul 2026), Toyota Ebella EV (May 2026), Maruti Victoris (Sep 2025) and e-Vitara (Feb 2026), Kia Syros / Syros EV / Carens Clavis / Clavis EV, MG Majestor (above band).
- Rebadged twins kept separate as instructed: Toyota Hyryder / Maruti Grand Vitara (+ Victoris noted as related).
- MG Windsor BaaS (battery-rental) figures kept in flags only; full-purchase prices used.

## Excluded models (62)

Excluded for three reasons: (a) entirely below ₹10L (25 models: Baleno, Swift, Dzire, Exter, Tiago/Tigor ranges, Triber, Kwid, Gravite, etc.),
(b) entirely above ₹25L (27 models: Fortuner, Tucson, Ioniq 5, EV6, Carnival, Kodiaq, Gloster, Tiguan R-Line, Golf GTI, etc.),
(c) discontinued or not yet launched (10 models: S-Cross, Kona Electric, Marazzo, XUV700, Superb, Boreal/Bigster, Kardian, MG 4/Bingo EV, etc.).
Full per-model reasons are in each maker's `excluded_models` array.

## What remains unverified

- 98.6% of variant prices need a second pass against official manufacturer price
  lists or dealer quotes before `is_estimate` can be flipped to false.
- Post-GST-cut (22 Sep 2026) price tables should be re-checked maker by maker.
- Omitted sub-variants (editions, dual-tones, charger packs) need individual
  price confirmation or a documented decision to fold them into base trims.
