import { describe, expect, it } from 'vitest';
import { loadDataset } from '../data/provider';
import { modelPriceChanges, recentPriceChanges } from './priceChanges';

describe('price changes', () => {
  it('derives deltas against each variant own previous record', async () => {
    const ds = await loadDataset();
    const changes = modelPriceChanges(ds, 'elevate');
    expect(changes.length).toBeGreaterThan(0);
    for (const c of changes) {
      expect(c.newPrice - c.oldPrice).toBe(c.delta);
      expect(c.modelId).toBe('elevate');
    }
    // Newest first.
    for (let i = 1; i < changes.length; i++) {
      expect(changes[i - 1].date >= changes[i].date).toBe(true);
    }
  });
  it('returns the most recent changes across models, newest first', async () => {
    const ds = await loadDataset();
    const recent = recentPriceChanges(ds, 10);
    expect(recent.length).toBe(10);
    for (let i = 1; i < recent.length; i++) {
      expect(recent[i - 1].date >= recent[i].date).toBe(true);
    }
    expect(recent[0].modelName.length).toBeGreaterThan(0);
  });
});
