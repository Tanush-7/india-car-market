// Price-band logic: ₹5 lakh steps, lower-inclusive / upper-exclusive,
// final band open-ended. All segment calculations use ex-showroom prices.

import type { CarModel, Variant } from '../data/types';

export const BAND_SIZE_LAKH = 5;
/** Bands 0-5L ... 65-70L, then a final 70L+ band. */
export const BAND_COUNT = 15;

export interface PriceBand {
  index: number;
  minLakh: number;
  /** Null for the final open-ended band. */
  maxLakh: number | null;
  label: string;
  shortLabel: string;
}

let cached: PriceBand[] | null = null;

export function priceBands(): PriceBand[] {
  if (cached) return cached;
  const bands: PriceBand[] = [];
  for (let i = 0; i < BAND_COUNT - 1; i++) {
    bands.push({
      index: i,
      minLakh: i * BAND_SIZE_LAKH,
      maxLakh: (i + 1) * BAND_SIZE_LAKH,
      label: `₹${i * BAND_SIZE_LAKH}–${(i + 1) * BAND_SIZE_LAKH}L`,
      shortLabel: `${i * BAND_SIZE_LAKH}-${(i + 1) * BAND_SIZE_LAKH}`,
    });
  }
  bands.push({
    index: BAND_COUNT - 1,
    minLakh: 70,
    maxLakh: null,
    label: '₹70L+',
    shortLabel: '70+',
  });
  cached = bands;
  return bands;
}

/** Band index for an ex-showroom price given in lakh. */
export function bandForPriceLakh(priceLakh: number): number {
  if (priceLakh < 0) return 0;
  const i = Math.floor(priceLakh / BAND_SIZE_LAKH);
  return Math.min(i, BAND_COUNT - 1);
}

/** Band index for an ex-showroom price given in rupees. */
export function bandForPrice(priceRupees: number): number {
  return bandForPriceLakh(priceRupees / 100000);
}

export type CountingMode = 'start' | 'overlap';

export const COUNTING_MODES: { id: CountingMode; label: string; hint: string }[] = [
  {
    id: 'start',
    label: 'Starting-price mode',
    hint: 'Each model is counted once, in the band holding its lowest ex-showroom variant price.',
  },
  {
    id: 'overlap',
    label: 'Variant-overlap mode',
    hint: 'A model is counted in every band that contains at least one of its variants. Variants are counted individually.',
  },
];

/** Bands a model belongs to under the given counting mode. */
export function modelBands(
  model: CarModel,
  variants: Variant[],
  mode: CountingMode,
): number[] {
  const own = variants.filter(
    (v) => v.modelId === model.id && v.availabilityStatus === 'available',
  );
  if (own.length === 0) return [];
  if (mode === 'start') {
    const start = Math.min(...own.map((v) => v.exShowroomPrice));
    return [bandForPrice(start)];
  }
  const set = new Set<number>();
  for (const v of own) set.add(bandForPrice(v.exShowroomPrice));
  return [...set].sort((a, b) => a - b);
}

/** Lowest available ex-showroom variant price, in rupees. */
export function startPrice(variants: Variant[]): number | null {
  const prices = variants
    .filter((v) => v.availabilityStatus === 'available')
    .map((v) => v.exShowroomPrice);
  return prices.length ? Math.min(...prices) : null;
}

/** Highest available ex-showroom variant price, in rupees. */
export function topPrice(variants: Variant[]): number | null {
  const prices = variants
    .filter((v) => v.availabilityStatus === 'available')
    .map((v) => v.exShowroomPrice);
  return prices.length ? Math.max(...prices) : null;
}

export function average(nums: number[]): number | null {
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function median(nums: number[]): number | null {
  if (!nums.length) return null;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}
