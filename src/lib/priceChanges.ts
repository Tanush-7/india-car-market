// Per-model price history with change deltas, derived from the existing
// verified price-history records (src/data/verifiedHistory.ts). A change
// is one variant's price record compared with that same variant's previous
// record, so the delta is always against the variant's own earlier price.
// The records run Jan 2024 - Oct 2026 and include the 22 Sep 2025 GST-cut
// revisions (prices fell when the GST rate changed).

import type { MarketDataset } from '../data/provider';

export interface PriceChange {
  id: string;
  modelId: string;
  modelName: string;
  makerName: string;
  variantId: string;
  variantName: string;
  date: string; // ISO date of the new price
  oldPrice: number;
  newPrice: number;
  delta: number; // newPrice - oldPrice (negative = price cut)
  pct: number; // delta as a percentage of oldPrice
  isEstimate: boolean;
}

/** All recorded price changes for one model, newest first. */
export function modelPriceChanges(ds: MarketDataset, modelId: string): PriceChange[] {
  const variantById = new Map(ds.variants.map((v) => [v.id, v]));
  const model = ds.models.find((m) => m.id === modelId);
  const maker = ds.makers.find((m) => m.id === model?.makerId);
  const byVariant = new Map<string, typeof ds.priceHistory>();
  for (const h of ds.priceHistory) {
    const v = variantById.get(h.variantId);
    if (!v || v.modelId !== modelId) continue;
    const list = byVariant.get(h.variantId) ?? [];
    list.push(h);
    byVariant.set(h.variantId, list);
  }
  const out: PriceChange[] = [];
  for (const [variantId, records] of byVariant) {
    const sorted = [...records].sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate));
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const cur = sorted[i];
      if (cur.exShowroomPrice === prev.exShowroomPrice) continue;
      const v = variantById.get(variantId);
      out.push({
        id: `${variantId}-${cur.effectiveDate}`,
        modelId,
        modelName: model?.name ?? modelId,
        makerName: maker?.name ?? '',
        variantId,
        variantName: v?.name ?? variantId,
        date: cur.effectiveDate,
        oldPrice: prev.exShowroomPrice,
        newPrice: cur.exShowroomPrice,
        delta: cur.exShowroomPrice - prev.exShowroomPrice,
        pct: ((cur.exShowroomPrice - prev.exShowroomPrice) / prev.exShowroomPrice) * 100,
        isEstimate: cur.isEstimate,
      });
    }
  }
  return out.sort((a, b) => b.date.localeCompare(a.date));
}

/** The most recent price changes across all models, newest first. */
export function recentPriceChanges(ds: MarketDataset, limit = 20): PriceChange[] {
  const variantById = new Map(ds.variants.map((v) => [v.id, v]));
  const modelById = new Map(ds.models.map((m) => [m.id, m]));
  const makerById = new Map(ds.makers.map((m) => [m.id, m.name]));
  const byVariant = new Map<string, typeof ds.priceHistory>();
  for (const h of ds.priceHistory) {
    const list = byVariant.get(h.variantId) ?? [];
    list.push(h);
    byVariant.set(h.variantId, list);
  }
  const out: PriceChange[] = [];
  for (const [variantId, records] of byVariant) {
    const sorted = [...records].sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate));
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const cur = sorted[i];
      if (cur.exShowroomPrice === prev.exShowroomPrice) continue;
      const v = variantById.get(variantId);
      const model = v ? modelById.get(v.modelId) : undefined;
      out.push({
        id: `${variantId}-${cur.effectiveDate}`,
        modelId: v?.modelId ?? '',
        modelName: model?.name ?? '',
        makerName: model ? makerById.get(model.makerId) ?? '' : '',
        variantId,
        variantName: v?.name ?? variantId,
        date: cur.effectiveDate,
        oldPrice: prev.exShowroomPrice,
        newPrice: cur.exShowroomPrice,
        delta: cur.exShowroomPrice - prev.exShowroomPrice,
        pct: ((cur.exShowroomPrice - prev.exShowroomPrice) / prev.exShowroomPrice) * 100,
        isEstimate: cur.isEstimate,
      });
    }
  }
  return out.sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
}
