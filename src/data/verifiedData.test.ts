import { describe, expect, it } from 'vitest';
import { VERIFIED_AT, verifiedMakers, verifiedModels, verifiedVariants } from './verifiedData';

const BODY = ['SUV', 'Crossover', 'Sedan', 'Hatchback', 'MPV', 'Coupe', 'Off-road', 'Other'];
const FUEL = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid', 'Plug-in Hybrid', 'Other'];
const TRANS = ['Manual', 'AMT', 'iMT', 'CVT', 'DCT', 'Automatic'];

describe('verified dataset integrity', () => {
  it('has 75 models and 1109 variants with unique ids', () => {
    expect(verifiedModels).toHaveLength(75);
    expect(verifiedVariants).toHaveLength(1109);
    expect(new Set(verifiedModels.map((m) => m.id)).size).toBe(75);
    expect(new Set(verifiedVariants.map((v) => v.id)).size).toBe(1109);
  });

  it('has no orphan variants and every variant has a source', () => {
    const modelIds = new Set(verifiedModels.map((m) => m.id));
    for (const v of verifiedVariants) {
      expect(modelIds.has(v.modelId)).toBe(true);
      expect(v.exShowroomPrice).toBeGreaterThan(0);
      expect(v.sourceUrl).toBeTruthy();
    }
  });

  it('uses only allowed vocab values', () => {
    for (const m of verifiedModels) expect(BODY).toContain(m.bodyType);
    for (const v of verifiedVariants) {
      expect(FUEL).toContain(v.fuelType);
      expect(TRANS).toContain(v.transmission);
    }
  });

  it('covers the 10-25L band for every model', () => {
    for (const m of verifiedModels) {
      const vs = verifiedVariants.filter((v) => v.modelId === m.id);
      expect(vs.length).toBeGreaterThan(0);
      expect(vs.some((v) => v.exShowroomPrice >= 1_000_000 && v.exShowroomPrice < 2_500_000)).toBe(true);
    }
  });

  it('stamps the verification date on every record', () => {
    for (const m of verifiedModels) expect(m.lastVerifiedAt).toBe(VERIFIED_AT);
    for (const v of verifiedVariants) expect(v.lastVerifiedAt).toBe(VERIFIED_AT);
  });

  it('references known makers only', () => {
    const makerIds = new Set(verifiedMakers.map((m) => m.id));
    for (const m of verifiedModels) expect(makerIds.has(m.makerId)).toBe(true);
  });
});
