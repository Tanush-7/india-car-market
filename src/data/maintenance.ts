// Approximate annual maintenance (servicing) cost per model, derived from
// published segment averages. There is no official per-model maintenance
// price list in India, so figures are segment estimates, never exact
// per-model quotes.
//
// Basis (checked 2026-11-09):
//   https://motomotar.com/car-ownership/annual-car-maintenance-cost/
//   2026 guide built from owner invoices, dealer service menus and spare
//   part prices. Each segment figure is the average for years 1-5 and
//   INCLUDES scheduled service plus a yearly reserve for wear-and-tear
//   items (brake pads, 12V battery, tyres prorated). It EXCLUDES fuel,
//   insurance and depreciation.
// Note the definition matters: brand-average "annual service cost"
// figures quoted elsewhere (e.g. Maruti Rs 5,000-7,000, Hyundai
// Rs 6,500-9,000, Tata Rs 6,000-8,500, Mahindra Rs 7,000-9,500 - see
// https://autoindiadaily.in/car-news/maruti-vs-hyundai-vs-tata-service-cost-comparison-2026/
// and https://www.analyticsinsight.net/photo/car-service-costs-in-2026-compared-maruti-hyundai-tata-mahindra)
// cover scheduled servicing only, so they are lower than the all-in
// segment figures used here. Both are estimates; this file uses the
// all-in definition so every model can be compared on the same basis.
//
// Mapping is by body type, starting ex-showroom price and fuel. A model
// offering only electric variants uses the EV segment. Diesel SUVs in the
// Rs 12-20L band use the turbo/diesel segment (DPF and major-service
// costs); petrol/hybrid in the same band use the naturally-aspirated one.

import type { BodyType, FuelType } from './types';

export const MAINTENANCE_UPDATED_AT = '2026-11-09';
export const MAINTENANCE_SOURCE_URL =
  'https://motomotar.com/car-ownership/annual-car-maintenance-cost/';

export interface MaintenanceSegment {
  key: string;
  label: string;
  low: number;
  high: number;
}

export const MAINTENANCE_SEGMENTS: MaintenanceSegment[] = [
  { key: 'ev', label: 'Mainstream EV', low: 12000, high: 18000 },
  { key: 'entryHatch', label: 'Entry hatchback', low: 12000, high: 18000 },
  { key: 'premiumHatch', label: 'Premium hatchback', low: 16000, high: 24000 },
  { key: 'compactSedan', label: 'Compact sedan', low: 16000, high: 28000 },
  { key: 'midSedan', label: 'Mid-size sedan', low: 24000, high: 32000 },
  { key: 'sub4mSuv', label: 'Sub-4m SUV', low: 18000, high: 26000 },
  { key: 'midSuvNa', label: 'Mid-size SUV, petrol / hybrid', low: 22000, high: 28000 },
  { key: 'midSuvTurboDiesel', label: 'Mid-size SUV, turbo / diesel', low: 28000, high: 38000 },
  { key: 'largeSuv', label: 'Large SUV', low: 28000, high: 42000 },
];

function byKey(key: string): MaintenanceSegment {
  return MAINTENANCE_SEGMENTS.find((s) => s.key === key) as MaintenanceSegment;
}

/**
 * Segment estimate for one model. startPrice is the model's lowest
 * available ex-showroom variant price in rupees (null when unknown).
 */
export function maintenanceForModel(
  bodyType: BodyType,
  startPrice: number | null,
  fuels: FuelType[],
): MaintenanceSegment {
  const onlyElectric = fuels.length > 0 && fuels.every((f) => f === 'Electric');
  if (onlyElectric) return byKey('ev');
  const price = startPrice ?? 0;
  if (bodyType === 'Hatchback') return byKey(price < 700000 ? 'entryHatch' : 'premiumHatch');
  if (bodyType === 'Sedan') return byKey(price < 1200000 ? 'compactSedan' : 'midSedan');
  // SUV, Crossover, Coupe, MPV, Off-road, Other.
  if (price < 1200000) return byKey('sub4mSuv');
  if (price > 2000000) return byKey('largeSuv');
  const hasDiesel = fuels.includes('Diesel');
  return byKey(hasDiesel ? 'midSuvTurboDiesel' : 'midSuvNa');
}

/** Midpoint of the segment range, for charting. */
export function maintenanceMidpoint(seg: MaintenanceSegment): number {
  return Math.round((seg.low + seg.high) / 2);
}
