import { describe, expect, it } from 'vitest';
import {
  bandForPrice,
  bandForPriceLakh,
  median,
  modelBands,
  priceBands,
  startPrice,
  topPrice,
} from './bands';
import type { CarModel, Variant } from '../data/types';

describe('price bands', () => {
  it('defines fifteen ₹5L bands ending in an open 70L+ band', () => {
    const bands = priceBands();
    expect(bands).toHaveLength(15);
    expect(bands[0]).toMatchObject({ minLakh: 0, maxLakh: 5, label: '₹0–5L' });
    expect(bands[2]).toMatchObject({ minLakh: 10, maxLakh: 15 });
    expect(bands[14]).toMatchObject({ minLakh: 70, maxLakh: null, label: '₹70L+' });
  });

  it('uses lower-inclusive, upper-exclusive boundaries', () => {
    expect(bandForPriceLakh(10)).toBe(2); // ₹10L -> 10-15 band
    expect(bandForPriceLakh(14.99)).toBe(2);
    expect(bandForPriceLakh(15)).toBe(3); // ₹15L -> 15-20 band
    expect(bandForPriceLakh(0)).toBe(0);
    expect(bandForPriceLakh(4.999)).toBe(0);
    expect(bandForPriceLakh(5)).toBe(1);
  });

  it('caps everything at or above ₹70L in the final band', () => {
    expect(bandForPriceLakh(70)).toBe(14);
    expect(bandForPriceLakh(120)).toBe(14);
    expect(bandForPrice(7_000_000)).toBe(14);
  });
});

const model: CarModel = {
  id: 'm1',
  makerId: 'mk1',
  name: 'Test Model',
  bodyType: 'SUV',
  status: 'active',
  sourceUrl: 'sample',
  lastVerifiedAt: '2026-10-12',
  isEstimate: true,
};

function variant(id: string, priceLakh: number): Variant {
  return {
    id,
    modelId: 'm1',
    name: id,
    fuelType: 'Petrol',
    transmission: 'Manual',
    exShowroomPrice: Math.round(priceLakh * 100000),
    availabilityStatus: 'available',
    isEstimate: true,
  };
}

describe('counting modes', () => {
  const variants = [variant('v1', 12), variant('v2', 16), variant('v3', 22)];

  it('start mode assigns the model to exactly one band', () => {
    // Spec example: variants at ₹12L, ₹16L, ₹22L.
    expect(modelBands(model, variants, 'start')).toEqual([2]); // 10-15
  });

  it('overlap mode counts the model in every band holding a variant', () => {
    expect(modelBands(model, variants, 'overlap')).toEqual([2, 3, 4]); // 10-15, 15-20, 20-25
  });

  it('ignores discontinued variants', () => {
    const vs = [...variants, { ...variant('v4', 45), availabilityStatus: 'discontinued' as const }];
    expect(modelBands(model, vs, 'overlap')).toEqual([2, 3, 4]);
  });

  it('returns no bands when a model has no available variants', () => {
    expect(modelBands(model, [], 'start')).toEqual([]);
  });
});

describe('price helpers', () => {
  const variants = [variant('v1', 12), variant('v2', 16), variant('v3', 22)];

  it('computes start and top price from available variants', () => {
    expect(startPrice(variants)).toBe(1_200_000);
    expect(topPrice(variants)).toBe(2_200_000);
  });

  it('returns null with no available variants', () => {
    expect(startPrice([])).toBeNull();
    expect(topPrice([])).toBeNull();
  });

  it('computes median correctly for odd and even counts', () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 3, 2])).toBe(2.5);
    expect(median([])).toBeNull();
  });
});
