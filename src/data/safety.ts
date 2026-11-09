// NCAP crash-test safety ratings per model. Only ratings that were
// actually published for the model (or its exact platform twin) are
// listed here. Every other active model says "Not tested" on the page -
// never a guessed rating.
//
// Sources (checked 2026-11-09):
//   Bharat NCAP list (33 cars on sale, updated 16 Sep 2026):
//   https://www.autocarindia.com/auto-features-amp/every-car-tested-by-bharat-ncap-so-far-431936
//   Global NCAP new-protocol results (2022-2023, 10 made-in-India models):
//   https://www.autocarpro.in/news/indias-top-10-highest-rated-cars-and-suvs-in-new-gncap-crash-tests--116419
//   https://www.thehindubusinessline.com/companies/maruti-cars-show-poorer-ratings-on-global-ncap-crash-tests-from-2014-2023/article67379549.ece
//   Global NCAP 2024 Magnite (6-airbag version), 5 stars adult / 3 stars child:
//   https://motomotar.com/car-safety-features/safest-cars-india/
//
// How to read the stars:
//   Bharat NCAP scores adult protection out of 32 and child out of 49.
//   Global NCAP (new protocol, 2022 onwards) scores adult out of 34 and
//   child out of 49. Global NCAP old-protocol results (before 2022) used a
//   different test set and are NOT directly comparable - they are marked
//   as such. A rating applies to the variant tested; where the agency says
//   the rating covers the whole line-up, the note says so. Where it only
//   covers specific trims (e.g. Baleno Zeta/Alpha), the note says so too.

export const SAFETY_UPDATED_AT = '2026-11-09';

export const SAFETY_SOURCES = [
  'https://www.autocarindia.com/auto-features-amp/every-car-tested-by-bharat-ncap-so-far-431936',
  'https://www.autocarpro.in/news/indias-top-10-highest-rated-cars-and-suvs-in-new-gncap-crash-tests--116419',
];

export type SafetyAgency = 'BNCAP' | 'GNCAP' | 'GNCAP-old';

export interface SafetyRating {
  /** Model id as in src/data/verifiedData.ts (or the sample dataset). */
  modelId: string;
  agency: SafetyAgency;
  adultStars: number; // 0-5
  childStars: number; // 0-5
  /** Adult occupant protection score, out of 32 (BNCAP) or 34 (GNCAP). */
  aop?: number;
  /** Child occupant protection score, out of 49. */
  cop?: number;
  /** When the test result was published. */
  tested: string;
  note?: string;
}

export const SAFETY_RATINGS: SafetyRating[] = [
  // ---- Bharat NCAP (Autocar list, updated 16 Sep 2026) ----
  { modelId: 'xuv-7xo', agency: 'BNCAP', adultStars: 5, childStars: 5, aop: 30.76, cop: 44.97, tested: '2026-09', note: 'Applies across variants.' },
  { modelId: 'punch-ev', agency: 'BNCAP', adultStars: 5, childStars: 5, aop: 31.09, cop: 45, tested: '2026-07', note: 'Applies to the entire Punch EV line-up.' },
  { modelId: 'brezza', agency: 'BNCAP', adultStars: 5, childStars: 5, aop: 30.41, cop: 43, tested: '2026-06', note: '2026 Brezza facelift; applies to all variants.' },
  { modelId: 'tekton', agency: 'BNCAP', adultStars: 5, childStars: 5, aop: 30.49, cop: 45, tested: '2026-06', note: 'Applies to all variants.' },
  { modelId: 'duster', agency: 'BNCAP', adultStars: 5, childStars: 5, aop: 30.49, cop: 45, tested: '2026-04', note: 'Identical scores to its twin, the Tekton.' },
  { modelId: 'venue', agency: 'BNCAP', adultStars: 5, childStars: 5, aop: 31.15, cop: 44.46, tested: '2026-03', note: 'Applies to the entire line-up, including N Line.' },
  { modelId: 'venue-n-line', agency: 'BNCAP', adultStars: 5, childStars: 5, aop: 31.15, cop: 44.46, tested: '2026-03', note: 'BNCAP: the Venue rating applies to the entire line-up, including N Line.' },
  { modelId: 'seltos', agency: 'BNCAP', adultStars: 5, childStars: 5, aop: 31.7, cop: 45, tested: '2026-03', note: 'Second-generation Seltos; applies to all variants.' },
  { modelId: 'sierra', agency: 'BNCAP', adultStars: 5, childStars: 5, aop: 31.14, cop: 44.43, tested: '2026-03', note: 'Applies to the entire line-up.' },
  { modelId: 'punch', agency: 'BNCAP', adultStars: 5, childStars: 5, aop: 30.58, cop: 45, tested: '2026-01', note: '2026 Punch; applies to the entire line-up.' },
  { modelId: 'e-vitara', agency: 'BNCAP', adultStars: 5, childStars: 5, aop: 31.49, cop: 43, tested: '2025-12', note: 'Applies to the entire range.' },
  { modelId: 'invicto', agency: 'BNCAP', adultStars: 5, childStars: 5, aop: 30.43, cop: 44.9, tested: '2025-09', note: 'Applies to all variants.' },
  { modelId: 'altroz', agency: 'BNCAP', adultStars: 5, childStars: 5, aop: 29.65, cop: 44.9, tested: '2025-09', note: 'Applies to all variants.' },
  { modelId: 'victoris', agency: 'BNCAP', adultStars: 5, childStars: 5, aop: 31.66, cop: 43, tested: '2025-09', note: 'Applies to the entire line-up.' },
  { modelId: 'innova-hycross', agency: 'BNCAP', adultStars: 5, childStars: 5, aop: 30.47, cop: 45, tested: '2025-06', note: 'Applies to the entire range, petrol and hybrid.' },
  { modelId: 'harrier-ev', agency: 'BNCAP', adultStars: 5, childStars: 5, aop: 32, cop: 45, tested: '2025-06', note: 'Full marks for adult protection (32/32).' },
  { modelId: 'baleno', agency: 'BNCAP', adultStars: 4, childStars: 3, aop: 26.52, cop: 34.81, tested: '2025-06', note: 'Rating applies to the Zeta and Alpha (6-airbag) variants only.' },
  { modelId: 'nexon-ev', agency: 'BNCAP', adultStars: 5, childStars: 5, aop: 29.86, cop: 44.95, tested: '2025-04', note: 'Applies to the 45kWh range-topping variants and the range.' },
  { modelId: 'syros', agency: 'BNCAP', adultStars: 5, childStars: 5, aop: 30.21, cop: 44.42, tested: '2025-04', note: 'Applies to the entire Syros petrol range.' },
  { modelId: 'kylaq', agency: 'BNCAP', adultStars: 5, childStars: 5, aop: 30.88, cop: 45, tested: '2025-01', note: 'Applies to both adult and child protection.' },
  { modelId: 'xev-9e', agency: 'BNCAP', adultStars: 5, childStars: 5, aop: 32, cop: 45, tested: '2025-01', note: 'Full marks for adult protection (32/32).' },
  { modelId: 'be-6', agency: 'BNCAP', adultStars: 5, childStars: 5, aop: 31.97, cop: 45, tested: '2025-01', note: 'Rating applies from the base Pack One.' },
  { modelId: 'thar-roxx', agency: 'BNCAP', adultStars: 5, childStars: 5, aop: 31.09, cop: 45, tested: '2024-11', note: 'Applies to all variants of the 5-door Thar.' },
  { modelId: 'xuv-3xo', agency: 'BNCAP', adultStars: 5, childStars: 5, aop: 29.36, cop: 43, tested: '2024-11', note: 'Applies to the entire XUV 3XO line-up.' },
  { modelId: 'nexon', agency: 'BNCAP', adultStars: 5, childStars: 5, aop: 29.41, cop: 43.83, tested: '2024-10', note: 'Applies to the Nexon range.' },
  { modelId: 'curvv', agency: 'BNCAP', adultStars: 5, childStars: 5, aop: 29.5, cop: 43.66, tested: '2024-10', note: 'Applies across the range.' },
  { modelId: 'curvv-ev', agency: 'BNCAP', adultStars: 5, childStars: 5, aop: 30.81, cop: 44.83, tested: '2024-10', note: 'Applies across the range.' },
  { modelId: 'harrier', agency: 'BNCAP', adultStars: 5, childStars: 5, aop: 30.08, cop: 44.54, tested: '2023-12', note: 'Applies to the Harrier range.' },
  { modelId: 'safari', agency: 'BNCAP', adultStars: 5, childStars: 5, aop: 30.08, cop: 44.54, tested: '2023-12', note: 'Same scores as the Harrier.' },
  // ---- Global NCAP, new protocol (2022 onwards) ----
  { modelId: 'scorpio-n', agency: 'GNCAP', adultStars: 5, childStars: 3, aop: 29.25, cop: 28.93, tested: '2022-12', note: 'Adult 5 stars, child 3 stars (no 3-point belts in the middle rear seat at the time).' },
  { modelId: 'kushaq', agency: 'GNCAP', adultStars: 5, childStars: 5, aop: 29.64, cop: 42, tested: '2022-10', note: 'Platform twin of the Taigun; identical scores.' },
  { modelId: 'taigun', agency: 'GNCAP', adultStars: 5, childStars: 5, aop: 29.64, cop: 42, tested: '2022-10', note: 'Platform twin of the Kushaq; identical scores.' },
  { modelId: 'slavia', agency: 'GNCAP', adultStars: 5, childStars: 5, aop: 29.71, cop: 42, tested: '2022-10', note: 'Platform twin of the Virtus; identical scores.' },
  { modelId: 'virtus', agency: 'GNCAP', adultStars: 5, childStars: 5, aop: 29.71, cop: 42, tested: '2022-10', note: 'Platform twin of the Slavia; identical scores.' },
  { modelId: 'verna', agency: 'GNCAP', adultStars: 5, childStars: 5, aop: 28.18, cop: 42, tested: '2023-11', note: 'Five stars with six airbags as standard.' },
  { modelId: 'magnite', agency: 'GNCAP', adultStars: 5, childStars: 3, tested: '2024-02', note: '6-airbag version tested in 2024. The earlier 2-airbag Magnite scored 4 stars.' },
  { modelId: 'swift', agency: 'GNCAP', adultStars: 1, childStars: 1, aop: 19.19, cop: 16.68, tested: '2022-12', note: 'Tested in basic 2-airbag spec without ESC. The current 6-airbag Swift has not been re-tested.' },
  // ---- Global NCAP, old protocol (before 2022): not comparable to the above ----
  { modelId: 'creta', agency: 'GNCAP-old', adultStars: 3, childStars: 3, tested: '2022-04', note: 'Old-protocol test on the pre-facelift Creta. The 2024 facelift has not been re-tested.' },
  { modelId: 'thar', agency: 'GNCAP-old', adultStars: 4, childStars: 4, tested: '2020-11', note: 'Old-protocol test on the 3-door Thar.' },
];

export function safetyForModel(modelId: string): SafetyRating | null {
  return SAFETY_RATINGS.find((s) => s.modelId === modelId) ?? null;
}

export function agencyLabel(agency: SafetyAgency): string {
  if (agency === 'BNCAP') return 'Bharat NCAP';
  if (agency === 'GNCAP') return 'Global NCAP';
  return 'Global NCAP (old protocol)';
}

/** "★★★★★" style stars for display. */
export function stars(n: number): string {
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}
