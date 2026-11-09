// Bengaluru on-road price for a new private car, computed from the
// variant's ex-showroom price. Ex-showroom stays the source of truth;
// every other line is derived here so a weekly refresh only edits this
// file, never the components.
//
// Karnataka lifetime road-tax slabs (petrol / diesel / CNG / hybrid),
// effective 1 Apr 2026 under the Karnataka Motor Vehicles Taxation Act:
//   up to Rs 5 lakh: 13% | above 5L up to 10L: 14%
//   above 10L up to 20L: 17% | above 20L: 18%
// Electric cars: up to Rs 10 lakh: 5% | above 10L up to 25L: 8% | above 25L: 10%
// Cess: 11% of the road tax, plus a fixed Rs 1,000 road-safety tax.
// Sources (checked 2026-11-09):
//   https://www.spinny.com/blog/road-tax-in-karnataka-applicability-calculation-payment-more/
//   https://www.mycarhelpline.com/index.php?option=com_forms&view=pages&layout=rtokarnataka&Itemid=466
//   https://www.bestcarsworld.com/car-price-in-bangalore
//   https://www.bajajfinserv.in/insurance/karnataka-road-tax
// The 11% cess expressed as a share of ex-showroom (1.43%-1.98%) is the
// same figure: 11% of a 13%-18% tax. EV slabs are per Spinny /
// mycarhelpline / bestcarsworld from 1 Apr 2026; EVs were fully exempt
// before that date, so treat the EV slab as the least-settled figure here.
//
// Fixed charges (Central Motor Vehicles Rules; multiple 2026 guides):
//   registration Rs 600, HSRP number plates ~Rs 400, FASTag ~Rs 600.
// First-year insurance is an ESTIMATE at 3.5% of ex-showroom
// (comprehensive own-damage + 3-year third-party bundle; see
// https://calculatorkosh.com/calculators/lifestyle/on-road-price-calculator
// and bestcarsworld's 3-4.5% range). Real quotes vary by insurer, IDV,
// add-ons and no-claim bonus - always get a dealer quote.
// TCS (Income Tax Act s.206C(1F)): 1% when ex-showroom exceeds Rs 10 lakh.
// Excluded on purpose: hypothecation Rs 1,500 (only if the car is
// financed) and dealer handling charges (discretionary, varies by dealer).

import type { FuelType } from './types';

export const ONROAD_UPDATED_AT = '2026-11-09';

export const ONROAD_SOURCES = [
  'https://www.spinny.com/blog/road-tax-in-karnataka-applicability-calculation-payment-more/',
  'https://www.mycarhelpline.com/index.php?option=com_forms&view=pages&layout=rtokarnataka&Itemid=466',
  'https://www.bestcarsworld.com/car-price-in-bangalore',
  'https://calculatorkosh.com/calculators/lifestyle/on-road-price-calculator',
];

export const ROAD_SAFETY_TAX = 1000;
export const REGISTRATION_FEE = 600;
export const HSRP_FEE = 400;
export const FASTAG_FEE = 600;
export const INSURANCE_RATE = 0.035;
export const TCS_THRESHOLD = 1000000;
export const TCS_RATE = 0.01;

export interface OnRoadLine {
  label: string;
  amount: number;
  /** 'estimate' lines are assumptions, not statutory figures. */
  kind: 'price' | 'tax' | 'fee' | 'estimate';
}

export interface OnRoadBreakdown {
  exShowroom: number;
  roadTax: number;
  cess: number;
  roadSafetyTax: number;
  registration: number;
  hsrp: number;
  fastag: number;
  insurance: number;
  tcs: number;
  total: number;
  lines: OnRoadLine[];
}

/** Lifetime road-tax rate for a new private car in Karnataka. */
export function roadTaxRate(exShowroom: number, fuel: FuelType): number {
  if (fuel === 'Electric') {
    if (exShowroom <= 1000000) return 0.05;
    if (exShowroom <= 2500000) return 0.08;
    return 0.1;
  }
  if (exShowroom <= 500000) return 0.13;
  if (exShowroom <= 1000000) return 0.14;
  if (exShowroom <= 2000000) return 0.17;
  return 0.18;
}

export function onRoadBreakdown(exShowroom: number, fuel: FuelType): OnRoadBreakdown {
  const rate = roadTaxRate(exShowroom, fuel);
  const roadTax = Math.round(exShowroom * rate);
  const cess = Math.round(roadTax * 0.11);
  const insurance = Math.round(exShowroom * INSURANCE_RATE);
  const tcs = exShowroom > TCS_THRESHOLD ? Math.round(exShowroom * TCS_RATE) : 0;
  const total =
    exShowroom +
    roadTax +
    cess +
    ROAD_SAFETY_TAX +
    REGISTRATION_FEE +
    HSRP_FEE +
    FASTAG_FEE +
    insurance +
    tcs;
  const lines: OnRoadLine[] = [
    { label: 'Ex-showroom price', amount: exShowroom, kind: 'price' },
    { label: `Road tax (${Math.round(rate * 100)}% of ex-showroom)`, amount: roadTax, kind: 'tax' },
    { label: 'Cess (11% of road tax)', amount: cess, kind: 'tax' },
    { label: 'Road safety tax', amount: ROAD_SAFETY_TAX, kind: 'tax' },
    { label: 'Registration fee', amount: REGISTRATION_FEE, kind: 'fee' },
    { label: 'HSRP number plates', amount: HSRP_FEE, kind: 'fee' },
    { label: 'FASTag', amount: FASTAG_FEE, kind: 'fee' },
    { label: 'First-year insurance (estimate, ~3.5%)', amount: insurance, kind: 'estimate' },
  ];
  if (tcs > 0) {
    lines.push({ label: 'TCS (1%, ex-showroom above Rs 10 lakh)', amount: tcs, kind: 'tax' });
  }
  lines.push({ label: 'On-road total (Bengaluru)', amount: total, kind: 'price' });
  return {
    exShowroom,
    roadTax,
    cess,
    roadSafetyTax: ROAD_SAFETY_TAX,
    registration: REGISTRATION_FEE,
    hsrp: HSRP_FEE,
    fastag: FASTAG_FEE,
    insurance,
    tcs,
    total,
    lines,
  };
}

/** On-road total only, for tables and exports. */
export function onRoadTotal(exShowroom: number, fuel: FuelType): number {
  return onRoadBreakdown(exShowroom, fuel).total;
}
