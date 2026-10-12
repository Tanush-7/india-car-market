import { describe, expect, it } from 'vitest';
import { verifiedModelNotes, verifiedLaunches, verifiedPriceHistory } from './verifiedHistory';
import { verifiedModels, verifiedVariants } from './verifiedData';

const LAUNCH_TYPES = ['New nameplate', 'New generation', 'Major facelift', 'EV derivative'];

describe('verified history integrity', () => {
  it('has 50 launches and 411 price changes with unique ids', () => {
    expect(verifiedLaunches).toHaveLength(50);
    expect(verifiedPriceHistory).toHaveLength(411);
    expect(new Set(verifiedLaunches.map((l) => l.id)).size).toBe(50);
    expect(new Set(verifiedPriceHistory.map((p) => p.id)).size).toBe(411);
  });

  it('keeps every record inside the Oct 2023 - Oct 2026 window', () => {
    for (const l of verifiedLaunches) {
      expect(l.launchDate >= '2023-10-01').toBe(true);
      expect(l.launchDate <= '2026-10-31').toBe(true);
      expect(LAUNCH_TYPES).toContain(l.launchType);
      expect(l.sourceUrl).toBeTruthy();
    }
    for (const p of verifiedPriceHistory) {
      expect(p.effectiveDate >= '2023-10-01').toBe(true);
      expect(p.effectiveDate <= '2026-10-31').toBe(true);
      expect(p.sourceUrl).toBeTruthy();
      expect(p.exShowroomPrice).toBeGreaterThan(0);
    }
  });

  it('references valid models and variants only', () => {
    const modelIds = new Set(verifiedModels.map((m) => m.id));
    const variantIds = new Set(verifiedVariants.map((v) => v.id));
    for (const l of verifiedLaunches) expect(modelIds.has(l.modelId)).toBe(true);
    for (const p of verifiedPriceHistory) expect(variantIds.has(p.variantId)).toBe(true);
    for (const mid of Object.keys(verifiedModelNotes)) expect(modelIds.has(mid)).toBe(true);
  });

  it('uses the correct 2025 GST date, not 2026', () => {
    const gst = verifiedPriceHistory.filter((p) => /gst/i.test(p.notes ?? ''));
    expect(gst.length).toBeGreaterThan(0);
    for (const p of gst) expect(p.effectiveDate).not.toBe('2026-09-22');
  });
});
