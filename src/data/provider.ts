// Data access layer.
//
// Today this serves the bundled sample dataset so the site works with zero
// backend. When VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set (see
// .env.example and supabase/migrations/0001_init.sql), it reads the same
// tables from Supabase instead, with no frontend code changes.

import type {
  CarModel,
  LaunchEvent,
  Maker,
  PriceRecord,
  Variant,
} from './types';
import {
  SAMPLE_NOTE,
  SAMPLE_VERIFIED_AT,
  launches as sampleLaunches,
  makers as sampleMakers,
  models as sampleModels,
  priceHistory as samplePriceHistory,
  variants as sampleVariants,
} from './sampleData';

export interface MarketDataset {
  makers: Maker[];
  models: CarModel[];
  variants: Variant[];
  priceHistory: PriceRecord[];
  launches: LaunchEvent[];
  meta: {
    isSampleData: boolean;
    note: string;
    lastUpdated: string;
  };
}

function sampleDataset(): MarketDataset {
  return {
    makers: sampleMakers,
    models: sampleModels,
    variants: sampleVariants,
    priceHistory: samplePriceHistory,
    launches: sampleLaunches,
    meta: {
      isSampleData: true,
      note: SAMPLE_NOTE,
      lastUpdated: SAMPLE_VERIFIED_AT,
    },
  };
}

async function supabaseSelect<T>(base: string, table: string, apiKey: string): Promise<T[]> {
  const res = await fetch(`${base}/rest/v1/${table}?select=*`, {
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
    },
  });
  if (!res.ok) throw new Error(`Supabase ${table}: ${res.status}`);
  return (await res.json()) as T[];
}

async function supabaseDataset(base: string, apiKey: string): Promise<MarketDataset> {
  const snakeToCamel = (s: string) => s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
  const mapRow = (row: Record<string, unknown>): Record<string, unknown> => {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(row)) out[snakeToCamel(k)] = v;
    // Table columns that intentionally differ from the app field names:
    if ('modelName' in out) { out.name = out.modelName; delete out.modelName; }
    if ('variantName' in out) { out.name = out.variantName; delete out.variantName; }
    if ('currentStatus' in out) { out.status = out.currentStatus; delete out.currentStatus; }
    return out;
  };
  const [makers, models, variants, priceHistory, launches] = await Promise.all([
    supabaseSelect<Record<string, unknown>>(base, 'makers', apiKey),
    supabaseSelect<Record<string, unknown>>(base, 'models', apiKey),
    supabaseSelect<Record<string, unknown>>(base, 'variants', apiKey),
    supabaseSelect<Record<string, unknown>>(base, 'price_history', apiKey),
    supabaseSelect<Record<string, unknown>>(base, 'launch_history', apiKey),
  ]);
  return {
    makers: makers.map(mapRow) as unknown as Maker[],
    models: models.map(mapRow) as unknown as CarModel[],
    variants: variants.map(mapRow) as unknown as Variant[],
    priceHistory: priceHistory.map(mapRow) as unknown as PriceRecord[],
    launches: launches.map(mapRow) as unknown as LaunchEvent[],
    meta: {
      isSampleData: false,
      note: 'Live data from Supabase.',
      lastUpdated: new Date().toISOString().slice(0, 10),
    },
  };
}

export async function loadDataset(): Promise<MarketDataset> {
  const base = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (base && apiKey) {
    try {
      return await supabaseDataset(base, apiKey);
    } catch (err) {
      console.warn('Supabase load failed, falling back to sample data.', err);
    }
  }
  return sampleDataset();
}
