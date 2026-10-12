import type { CarModel, FuelType, Transmission, Variant } from '../data/types';
import type { MarketDataset } from '../data/provider';
import { startPrice, topPrice } from './bands';

export interface ModelRow {
  model: CarModel;
  makerName: string;
  variants: Variant[];
  startPrice: number | null;
  topPrice: number | null;
  fuels: FuelType[];
  transmissions: Transmission[];
  /** Latest known launch/generation/facelift year. */
  launchYear: string | null;
}

/** Join models with makers and their available variants. Active models only. */
export function enrichModels(ds: MarketDataset): ModelRow[] {
  const makerName = new Map(ds.makers.map((m) => [m.id, m.name]));
  return ds.models
    .filter((m) => m.status === 'active')
    .map((model) => {
      const variants = ds.variants.filter(
        (v) => v.modelId === model.id && v.availabilityStatus === 'available',
      );
      const fuels = [...new Set(variants.map((v) => v.fuelType))].sort();
      const transmissions = [...new Set(variants.map((v) => v.transmission))].sort();
      const dates = [
        model.latestFaceliftDate,
        model.latestGenerationDate,
        model.firstLaunchDate,
      ].filter(Boolean) as string[];
      return {
        model,
        makerName: makerName.get(model.makerId) ?? model.makerId,
        variants,
        startPrice: startPrice(variants),
        topPrice: topPrice(variants),
        fuels,
        transmissions,
        launchYear: dates.length ? dates[0].slice(0, 4) : null,
      };
    })
    .filter((r) => r.startPrice !== null);
}

export function discontinuedRows(ds: MarketDataset): ModelRow[] {
  const makerName = new Map(ds.makers.map((m) => [m.id, m.name]));
  return ds.models
    .filter((m) => m.status === 'discontinued')
    .map((model) => {
      const variants = ds.variants.filter((v) => v.modelId === model.id);
      return {
        model,
        makerName: makerName.get(model.makerId) ?? model.makerId,
        variants,
        startPrice: startPrice(variants),
        topPrice: topPrice(variants),
        fuels: [...new Set(variants.map((v) => v.fuelType))].sort(),
        transmissions: [...new Set(variants.map((v) => v.transmission))].sort(),
        launchYear: model.firstLaunchDate ? model.firstLaunchDate.slice(0, 4) : null,
      };
    });
}
