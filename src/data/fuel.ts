// Monthly fuel / running cost per car, from km driven per month and the
// fuel price. Fuel prices are the November 2026 metro prices below, and
// every price input is editable on the page - fuel prices change often,
// so treat these as a snapshot, not a live feed.
//
// Fuel prices (checked 2026-11-09, per litre / per kg / per unit):
//   Petrol and diesel: Goodreturns via hdfcsky / asianetnews / thehansindia
//   (8 Nov 2026): Delhi 102.12 / 95.20, Mumbai 111.21 / 97.83,
//   Bengaluru 111.68 / 99.56, Chennai 107.76 / 99.55, Kolkata 113.51 / 99.82,
//   Hyderabad 115.69 / 103.82 (thehansindia, 8 Nov 2026; hdfcsky 6 Nov
//   lists 116.15 / 104.23 - prices drift a few paise by the day).
//   Pune: no separate verified listing found; Mumbai prices are used as
//   the default and flagged approximate - edit to the local rate.
//   CNG: Delhi 86.98, Mumbai 90.00, Bengaluru 99.00 (moneycontrol /
//   Goodreturns, Nov 2026). CNG for Chennai, Hyderabad, Pune and Kolkata
//   is NOT verified here, so those cities default to 90.00/kg and are
//   flagged approximate - edit to the local rate.
//   Electricity (EV home charging): Rs 7.00/unit default. Basis: BESCOM
//   domestic LT-1 is Rs 5.80/unit flat (KERC order FY 2026-27) plus the
//   35p P&G surcharge, 9% electricity tax and FPPCA, taking the effective
//   rate to about Rs 6.80/unit (billunits.in, bijlicalculator.in). Public
//   fast charging costs much more (Rs 15-25/unit); home charging is the
//   default assumption - edit to your tariff.
//
// Mileage defaults are SEGMENT AVERAGES, not per-model ARAI figures:
// typical claimed-mileage ranges for the segment and fuel. They are
// editable on the page - enter your car's real mileage for an accurate
// figure. EVs use km per kWh (real-world 5-7 for most Indian EVs).

import type { BodyType, FuelType } from './types';

export const FUEL_PRICES_UPDATED_AT = '2026-11-09';

export interface CityFuelPrices {
  petrol: number;
  diesel: number;
  cng: number;
  /** False when the CNG price is an approximate default, not a verified city rate. */
  cngVerified: boolean;
  /** Home-charging electricity price per unit (kWh). */
  electricity: number;
  note?: string;
}

export const FUEL_PRICES: Record<string, CityFuelPrices> = {
  bengaluru: { petrol: 111.68, diesel: 99.56, cng: 99.0, cngVerified: true, electricity: 7.0 },
  delhi: { petrol: 102.12, diesel: 95.2, cng: 86.98, cngVerified: true, electricity: 7.0 },
  mumbai: { petrol: 111.21, diesel: 97.83, cng: 90.0, cngVerified: true, electricity: 7.0 },
  pune: {
    petrol: 111.21,
    diesel: 97.83,
    cng: 90.0,
    cngVerified: false,
    electricity: 7.0,
    note: 'Pune fuel prices track Mumbai; no separate verified Pune listing found - edit to the local rate.',
  },
  chennai: {
    petrol: 107.76,
    diesel: 99.55,
    cng: 90.0,
    cngVerified: false,
    electricity: 7.0,
    note: 'Chennai CNG price not verified - 90.00/kg is an approximate default.',
  },
  hyderabad: {
    petrol: 115.69,
    diesel: 103.82,
    cng: 90.0,
    cngVerified: false,
    electricity: 7.0,
    note: 'Hyderabad CNG price not verified - 90.00/kg is an approximate default.',
  },
  kolkata: {
    petrol: 113.51,
    diesel: 99.82,
    cng: 90.0,
    cngVerified: false,
    electricity: 7.0,
    note: 'Kolkata CNG price not verified - 90.00/kg is an approximate default.',
  },
};

export function fuelPricesFor(cityId: string): CityFuelPrices {
  return FUEL_PRICES[cityId] ?? FUEL_PRICES.bengaluru;
}

export interface FuelPrice {
  price: number;
  unit: string;
  verified: boolean;
}

/** Price per unit of fuel for the given fuel type in the given city. */
export function fuelPriceFor(fuel: FuelType, cityId: string): FuelPrice {
  const p = fuelPricesFor(cityId);
  if (fuel === 'Electric') return { price: p.electricity, unit: 'unit (kWh)', verified: false };
  if (fuel === 'Diesel') return { price: p.diesel, unit: 'litre', verified: true };
  if (fuel === 'CNG') return { price: p.cng, unit: 'kg', verified: p.cngVerified };
  // Petrol, Hybrid and Plug-in Hybrid run on petrol for this estimate.
  return { price: p.petrol, unit: 'litre', verified: true };
}

/**
 * Segment-average mileage for the model: km per litre (petrol/diesel/CNG
 * uses km per kg, EV uses km per kWh). These are broad averages for the
 * segment and fuel - edit on the page for your car.
 */
export function defaultMileage(
  bodyType: BodyType,
  startPrice: number | null,
  fuel: FuelType,
): { value: number; unit: string; label: string } {
  const price = startPrice ?? 0;
  if (fuel === 'Electric') {
    return { value: 6, unit: 'km/kWh', label: 'Segment average (EV, real-world 5-7 km/kWh)' };
  }
  if (fuel === 'CNG') {
    if (bodyType === 'Hatchback') return { value: 26, unit: 'km/kg', label: 'Segment average (CNG hatchback)' };
    if (bodyType === 'Sedan') return { value: 24, unit: 'km/kg', label: 'Segment average (CNG sedan)' };
    return { value: 22, unit: 'km/kg', label: 'Segment average (CNG SUV/MPV)' };
  }
  if (fuel === 'Hybrid') {
    return { value: 26, unit: 'kmpl', label: 'Segment average (strong hybrid)' };
  }
  if (fuel === 'Plug-in Hybrid') {
    return { value: 20, unit: 'kmpl', label: 'Segment average (plug-in hybrid, petrol mode)' };
  }
  if (fuel === 'Diesel') {
    if (bodyType === 'Hatchback') return { value: 24, unit: 'kmpl', label: 'Segment average (diesel hatchback)' };
    if (bodyType === 'Sedan') return { value: 23, unit: 'kmpl', label: 'Segment average (diesel sedan)' };
    if (bodyType === 'Off-road') return { value: 16, unit: 'kmpl', label: 'Segment average (diesel off-roader)' };
    return { value: 20, unit: 'kmpl', label: 'Segment average (diesel SUV/MPV)' };
  }
  // Petrol.
  if (bodyType === 'Hatchback') {
    return price < 700000
      ? { value: 21, unit: 'kmpl', label: 'Segment average (entry petrol hatchback)' }
      : { value: 19, unit: 'kmpl', label: 'Segment average (premium petrol hatchback)' };
  }
  if (bodyType === 'Sedan') return { value: 19, unit: 'kmpl', label: 'Segment average (petrol sedan)' };
  if (bodyType === 'Off-road') return { value: 13, unit: 'kmpl', label: 'Segment average (petrol off-roader)' };
  if (bodyType === 'MPV') return { value: 16, unit: 'kmpl', label: 'Segment average (petrol MPV)' };
  if (bodyType === 'Coupe') return { value: 15, unit: 'kmpl', label: 'Segment average (petrol coupe-SUV)' };
  if (price > 2000000) return { value: 13, unit: 'kmpl', label: 'Segment average (large petrol SUV)' };
  if (price >= 1200000) return { value: 16, unit: 'kmpl', label: 'Segment average (mid-size petrol SUV)' };
  return { value: 18, unit: 'kmpl', label: 'Segment average (sub-4m petrol SUV)' };
}

/** Monthly fuel cost = (km per month / mileage) x price per unit. */
export function monthlyFuelCost(kmPerMonth: number, mileage: number, pricePerUnit: number): number {
  if (mileage <= 0 || kmPerMonth <= 0) return 0;
  return Math.round((kmPerMonth / mileage) * pricePerUnit);
}
