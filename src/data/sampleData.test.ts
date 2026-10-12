import { describe, expect, it } from 'vitest';
import { enrichModels } from '../lib/enrich';
import { loadDataset } from './provider';

// The sample dataset must stay internally consistent: every variant must point
// at a real model, every active model must have at least one available variant,
// and prices must be positive.
describe('sample dataset integrity', () => {
  it('loads through the provider as sample data', async () => {
    const ds = await loadDataset();
    expect(ds.meta.isSampleData).toBe(true);
    expect(ds.models.length).toBeGreaterThan(0);
  });

  it('has no orphan variants and positive prices', async () => {
    const ds = await loadDataset();
    const modelIds = new Set(ds.models.map((m) => m.id));
    for (const v of ds.variants) {
      expect(modelIds.has(v.modelId)).toBe(true);
      expect(v.exShowroomPrice).toBeGreaterThan(0);
    }
  });

  it('gives every active model a start price', async () => {
    const ds = await loadDataset();
    const rows = enrichModels(ds);
    expect(rows.length).toBe(ds.models.filter((m) => m.status === 'active').length);
    for (const r of rows) {
      expect(r.startPrice).not.toBeNull();
      expect(r.topPrice).not.toBeNull();
      expect(r.topPrice!).toBeGreaterThanOrEqual(r.startPrice!);
    }
  });

  it('marks every sample record as an estimate', async () => {
    const ds = await loadDataset();
    for (const m of ds.models) expect(m.isEstimate).toBe(true);
    for (const v of ds.variants) expect(v.isEstimate).toBe(true);
  });

  it('keeps launch events inside the Oct 2023 - Oct 2026 window', async () => {
    const ds = await loadDataset();
    for (const l of ds.launches) {
      expect(l.launchDate >= '2023-10-01').toBe(true);
      expect(l.launchDate <= '2026-10-31').toBe(true);
    }
  });
});
