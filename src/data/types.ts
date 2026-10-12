// Core domain types. These mirror the Supabase tables in
// supabase/migrations/0001_init.sql so the local sample dataset and a
// future Supabase backend share the same shape.

export interface Maker {
  id: string;
  name: string;
  countryOfOrigin?: string;
}

export type BodyType =
  | 'SUV'
  | 'Crossover'
  | 'Sedan'
  | 'Hatchback'
  | 'MPV'
  | 'Coupe'
  | 'Off-road'
  | 'Other';

export type FuelType =
  | 'Petrol'
  | 'Diesel'
  | 'CNG'
  | 'Electric'
  | 'Hybrid'
  | 'Plug-in Hybrid'
  | 'Other';

export type Transmission =
  | 'Manual'
  | 'AMT'
  | 'iMT'
  | 'CVT'
  | 'DCT'
  | 'Automatic';

export type ModelStatus = 'active' | 'discontinued';

export interface CarModel {
  id: string;
  makerId: string;
  name: string;
  bodyType: BodyType;
  firstLaunchDate?: string; // ISO date
  latestGenerationDate?: string;
  latestFaceliftDate?: string;
  status: ModelStatus;
  /** Ex-showroom source for the model's prices. */
  sourceUrl: string;
  lastVerifiedAt: string; // ISO date
  /** True when the price is an estimate rather than a published figure. */
  isEstimate: boolean;
  /** Data-quality notes: flags, caveats, omitted sub-variants. */
  notes?: string;
}

export interface Variant {
  id: string;
  modelId: string;
  name: string;
  fuelType: FuelType;
  transmission: Transmission;
  drivetrain?: string;
  /** Ex-showroom price in rupees. All segment math uses this field. */
  exShowroomPrice: number;
  availabilityStatus: 'available' | 'discontinued';
  sourceUrl?: string;
  lastVerifiedAt?: string;
  isEstimate: boolean;
}

export interface PriceRecord {
  id: string;
  variantId: string;
  exShowroomPrice: number;
  city?: string;
  onRoadPrice?: number;
  effectiveDate: string; // ISO date
  sourceUrl: string;
}

export type LaunchType =
  | 'New nameplate'
  | 'New generation'
  | 'Major facelift'
  | 'EV derivative';

export interface LaunchEvent {
  id: string;
  modelId: string;
  launchDate: string; // ISO date
  launchType: LaunchType;
  /** Ex-showroom launch price in rupees, when known. */
  launchPrice?: number;
  sourceUrl: string;
  isEstimate: boolean;
}
