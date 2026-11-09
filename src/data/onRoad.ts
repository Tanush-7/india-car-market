// On-road price for a new private car in seven Indian metros, computed
// from the variant's ex-showroom price. Ex-showroom stays the source of
// truth; every other line is derived here so a weekly refresh only edits
// this file, never the components.
//
// Rules below are lifetime road-tax slabs for a new private car registered
// by an individual, as published in 2026. Slabs are checked against the
// sources listed per city (all checked 2026-11-09). Where published sources
// disagree, the figure used is noted in the city comment.
//
// Fixed charges everywhere (Central Motor Vehicles Rules; multiple 2026
// guides): registration Rs 600, HSRP number plates ~Rs 400, FASTag ~Rs 600.
// First-year insurance is an ESTIMATE at 3.5% of ex-showroom
// (comprehensive own-damage + 3-year third-party bundle; see
// https://calculatorkosh.com/calculators/lifestyle/on-road-price-calculator
// and bestcarsworld's 3-4.5% range). Real quotes vary by insurer, IDV,
// add-ons and no-claim bonus - always get a dealer quote.
// TCS (Income Tax Act s.206C(1F)): 1% when ex-showroom exceeds Rs 10 lakh.
// Excluded on purpose: hypothecation Rs 1,500 (only if the car is
// financed) and dealer handling charges (discretionary, varies by dealer).
// Company/second-car registrations pay higher rates in several states;
// these figures are for a first car in an individual's name.

import type { FuelType } from './types';

export const ONROAD_UPDATED_AT = '2026-11-09';

export const ONROAD_SOURCES = [
  'https://www.spinny.com/blog/road-tax-in-karnataka-applicability-calculation-payment-more/',
  'https://www.mycarhelpline.com/index.php?option=com_easyblog&view=entry&id=155&Itemid=91&limitstart=220',
  'https://motomotar.com/car-buying-guide/rto-road-tax-by-state/',
];

export const REGISTRATION_FEE = 600;
export const HSRP_FEE = 400;
export const FASTAG_FEE = 600;
export const INSURANCE_RATE = 0.035;
export const TCS_THRESHOLD = 1000000;
export const TCS_RATE = 0.01;

export interface CitySlab {
  /** Slab applies up to this ex-showroom price (Infinity = top slab). */
  maxPrice: number;
  rate: number;
}

export interface CityRule {
  id: string;
  name: string;
  state: string;
  petrol: CitySlab[];
  diesel: CitySlab[];
  cng: CitySlab[];
  electric: CitySlab[];
  /** Minimum lifetime road tax in rupees, 0 when none (West Bengal). */
  minTax?: number;
  /** Extra levies beyond road tax, as (ex-showroom, road tax) -> lines. */
  extras?: (exShowroom: number, roadTax: number) => { label: string; amount: number }[];
  /** What the buyer should know that the numbers do not show. */
  note: string;
  sources: string[];
}

function slabs(pairs: [number, number][]): CitySlab[] {
  return pairs.map(([maxPrice, rate]) => ({ maxPrice, rate }));
}

/**
 * Bengaluru (Karnataka). Lifetime slabs effective 1 Apr 2026 under the
 * Karnataka Motor Vehicles Taxation Act: ICE up to 5L 13%, 5-10L 14%,
 * 10-20L 17%, above 20L 18%; EV up to 10L 5%, 10-25L 8%, above 25L 10%.
 * Cess: 11% of the road tax, plus a fixed Rs 1,000 road-safety tax.
 * Sources: Spinny, mycarhelpline, bestcarsworld, Bajaj Finserv.
 * The 11% cess expressed as a share of ex-showroom (1.43%-1.98%) is the
 * same figure: 11% of a 13%-18% tax. EV slabs are per Spinny /
 * mycarhelpline / bestcarsworld from 1 Apr 2026; EVs were fully exempt
 * before that date, so treat the EV slab as the least-settled figure here.
 */
const BENGALURU: CityRule = {
  id: 'bengaluru',
  name: 'Bengaluru',
  state: 'Karnataka',
  petrol: slabs([[500000, 0.13], [1000000, 0.14], [2000000, 0.17], [Infinity, 0.18]]),
  diesel: slabs([[500000, 0.13], [1000000, 0.14], [2000000, 0.17], [Infinity, 0.18]]),
  cng: slabs([[500000, 0.13], [1000000, 0.14], [2000000, 0.17], [Infinity, 0.18]]),
  electric: slabs([[1000000, 0.05], [2500000, 0.08], [Infinity, 0.1]]),
  extras: (_ex, tax) => [
    { label: 'Cess (11% of road tax)', amount: Math.round(tax * 0.11) },
    { label: 'Road safety tax', amount: 1000 },
  ],
  note: 'Karnataka charges an 11% cess on the road tax plus a Rs 1,000 road-safety tax.',
  sources: [
    'https://www.spinny.com/blog/road-tax-in-karnataka-applicability-calculation-payment-more/',
    'https://www.mycarhelpline.com/index.php?option=com_forms&view=pages&layout=rtokarnataka&Itemid=466',
    'https://www.bestcarsworld.com/car-price-in-bangalore',
  ],
};

/**
 * Delhi. Petrol/CNG/hybrid: up to 6L 4%, 6-10L 7%, above 10L 10%.
 * Diesel: below 4L 4%, 4-6L 5%, 6-10L 8.75%, above 10L 12.5%. EV: nil.
 * Plus the MCD one-time parking fee: Rs 2,000 below 4L, Rs 4,000 at 4L
 * and above (mycarhelpline worked example: Rs 8L petrol -> tax Rs 56,000
 * + Rs 4,000 parking + Rs 1,513 registration/HSRP/hypothecation).
 * Diesel cars of 2,000cc and above also pay a 1% environment compensation
 * charge - not included here (no engine-capacity data per variant).
 * Sources: mycarhelpline (rates checked Sep 2026), motomotar, Bajaj General.
 */
const DELHI: CityRule = {
  id: 'delhi',
  name: 'Delhi',
  state: 'Delhi',
  petrol: slabs([[600000, 0.04], [1000000, 0.07], [Infinity, 0.1]]),
  diesel: slabs([[400000, 0.04], [600000, 0.05], [1000000, 0.0875], [Infinity, 0.125]]),
  cng: slabs([[600000, 0.04], [1000000, 0.07], [Infinity, 0.1]]),
  electric: slabs([[Infinity, 0]]),
  extras: (ex) => [
    { label: 'MCD one-time parking fee', amount: ex < 400000 ? 2000 : 4000 },
  ],
  note: 'Diesel pays more than petrol at every slab. EV exempt. Diesel cars of 2,000cc+ also pay a 1% environment charge, not included.',
  sources: [
    'https://www.mycarhelpline.com/index.php?option=com_forms&view=pages&layout=rto&Itemid=460',
    'https://motomotar.com/car-buying-guide/rto-road-tax-by-state/',
  ],
};

/**
 * Mumbai and Pune (Maharashtra). Petrol/hybrid: up to 10L 11%, 10-20L 12%,
 * above 20L 13%. Diesel: 13% / 14% / 15%. CNG/LPG: 7% / 8% / 9%
 * (Bajaj Finserv and itzeazy; mycarhelpline lists 8% below 20L and 13%
 * above for CNG, kagzikaam lists 8/9/10% - the 7/8/9 schedule from the
 * state tax table is used here). EV: exempt. Plus a 2% infrastructure
 * levy on the road tax (mycarhelpline, sabtools).
 * Sources: mycarhelpline (rates checked Sep 2026), Bajaj Finserv,
 * itzeazy, kagzikaam.
 */
const MAHARASHTRA: (id: string, name: string) => CityRule = (id, name) => ({
  id,
  name,
  state: 'Maharashtra',
  petrol: slabs([[1000000, 0.11], [2000000, 0.12], [Infinity, 0.13]]),
  diesel: slabs([[1000000, 0.13], [2000000, 0.14], [Infinity, 0.15]]),
  cng: slabs([[1000000, 0.07], [2000000, 0.08], [Infinity, 0.09]]),
  electric: slabs([[Infinity, 0]]),
  extras: (_ex, tax) => [
    { label: 'Infrastructure levy (2% of road tax)', amount: Math.round(tax * 0.02) },
  ],
  note: 'Same slabs in Mumbai and Pune. CNG pays much less than petrol or diesel. EV exempt. Published sources disagree slightly on the CNG slabs; the state tax table (7/8/9%) is used.',
  sources: [
    'https://www.mycarhelpline.com/index.php?option=com_forms&view=pages&layout=rtomumbaipune&Itemid=467',
    'https://www.bajajfinserv.in/insurance/maharashtra-road-tax',
    'https://itzeazy.in/blog/2026/01/30/road-tax-maharashtra/',
  ],
});

/**
 * Chennai (Tamil Nadu). One schedule for all fuels: up to 5L 12%, 5-10L
 * 13%, 10-20L 18%, above 20L 20% (life tax under the TN Motor Vehicles
 * Taxation Act, rates in force since 9 Nov 2023). Plus a Rs 1,500 road
 * safety tax (mycarhelpline worked example: Rs 5L car -> tax Rs 65,000 +
 * Rs 1,500). EV: 100% exempt until 31 Dec 2027.
 * Note: two sources (bestcarsworld, livechennai) still quote the old
 * 10%/15% two-slab schedule; the 12/13/18/20 schedule is confirmed by
 * Spinny, Bajaj Finserv, loansjagat and ecozaar and is used here.
 * Sources: Spinny, Bajaj Finserv, mycarhelpline, ecozaar.
 */
const CHENNAI: CityRule = {
  id: 'chennai',
  name: 'Chennai',
  state: 'Tamil Nadu',
  petrol: slabs([[500000, 0.12], [1000000, 0.13], [2000000, 0.18], [Infinity, 0.2]]),
  diesel: slabs([[500000, 0.12], [1000000, 0.13], [2000000, 0.18], [Infinity, 0.2]]),
  cng: slabs([[500000, 0.12], [1000000, 0.13], [2000000, 0.18], [Infinity, 0.2]]),
  electric: slabs([[Infinity, 0]]),
  extras: () => [{ label: 'Road safety tax', amount: 1500 }],
  note: 'Among the costliest states for registration; the jump above Rs 10 lakh is steep. EV exempt until 31 Dec 2027.',
  sources: [
    'https://www.mycarhelpline.com/index.php?option=com_forms&view=pages&layout=tamilnadu&Itemid=504',
    'https://www.spinny.com/blog/road-tax-in-tamil-nadu-calculation-rates-and-payment-methods/',
    'https://www.bajajfinserv.in/road-tax-in-tamilnadu',
  ],
};

/**
 * Hyderabad (Telangana). Up to 5L 13%, 5-10L 14%, 10-20L 17%, above 20L
 * 18% (same for petrol and diesel). Plus a one-time Rs 5,000 road safety
 * cess on new cars from 1 Mar 2026. EV: 100% exempt (waiver runs to
 * 31 Dec 2026). A second car in the same name, or a company car, pays
 * higher rates (15% to 20%) - not used here.
 * Sources: mycarhelpline (rates checked Sep 2026), Spinny, bestcarsworld.
 */
const HYDERABAD: CityRule = {
  id: 'hyderabad',
  name: 'Hyderabad',
  state: 'Telangana',
  petrol: slabs([[500000, 0.13], [1000000, 0.14], [2000000, 0.17], [Infinity, 0.18]]),
  diesel: slabs([[500000, 0.13], [1000000, 0.14], [2000000, 0.17], [Infinity, 0.18]]),
  cng: slabs([[500000, 0.13], [1000000, 0.14], [2000000, 0.17], [Infinity, 0.18]]),
  electric: slabs([[Infinity, 0]]),
  extras: () => [{ label: 'Road safety cess (from 1 Mar 2026)', amount: 5000 }],
  note: 'A Rs 5,000 one-time road safety cess applies to every new car from 1 Mar 2026. EV exempt until 31 Dec 2026.',
  sources: [
    'https://www.mycarhelpline.com/index.php?option=com_forms&view=pages&layout=telangana&Itemid=505',
    'https://www.spinny.com/blog/road-tax-in-telangana-applicability-calculation-payment/',
    'https://www.bestcarsworld.com/car-price-in-hyderabad',
  ],
};

/**
 * Kolkata (West Bengal). One-time lifetime tax (15 years): 10% of
 * ex-showroom, minimum Rs 40,000. EV: exempt.
 * West Bengal ALSO offers a capacity-based one-time tax (5 years) that can
 * be lower for small cars: up to 900cc Rs 10,550 + Rs 4,000 AC,
 * 900-1,490cc Rs 13,900 + Rs 7,500 AC, 1,490-2,000cc Rs 21,800 +
 * Rs 10,000 AC, and higher above that (Bajaj Finserv, bestcarsworld).
 * This site has no engine-capacity data per variant, so the 10% lifetime
 * figure is used and the capacity option is flagged here and on the page.
 * One source (investverdict) lists EV at 2%; mycarhelpline and
 * fastag-login list EV as exempt - exempt is used.
 * Sources: mycarhelpline (rates checked Sep 2026), Bajaj Finserv,
 * fastag-login.
 */
const KOLKATA: CityRule = {
  id: 'kolkata',
  name: 'Kolkata',
  state: 'West Bengal',
  petrol: slabs([[Infinity, 0.1]]),
  diesel: slabs([[Infinity, 0.1]]),
  cng: slabs([[Infinity, 0.1]]),
  electric: slabs([[Infinity, 0]]),
  minTax: 40000,
  note: '10% lifetime tax (15 years), minimum Rs 40,000. A capacity-based one-time tax can be lower for small cars - ask the RTO; this site has no engine-capacity data to compute it.',
  sources: [
    'https://www.mycarhelpline.com/index.php?option=com_forms&view=pages&layout=rtokolkata&Itemid=474',
    'https://www.bajajfinserv.in/road-tax-in-west-bengal',
  ],
};

export const CITIES: CityRule[] = [
  BENGALURU,
  DELHI,
  MAHARASHTRA('mumbai', 'Mumbai'),
  MAHARASHTRA('pune', 'Pune'),
  CHENNAI,
  HYDERABAD,
  KOLKATA,
];

export function cityById(id: string): CityRule {
  return CITIES.find((c) => c.id === id) ?? CITIES[0];
}

/** Lifetime road-tax rate for a new private car in the given city. */
export function roadTaxRate(exShowroom: number, fuel: FuelType, cityId = 'bengaluru'): number {
  const city = cityById(cityId);
  const table =
    fuel === 'Electric'
      ? city.electric
      : fuel === 'Diesel'
        ? city.diesel
        : fuel === 'CNG'
          ? city.cng
          : city.petrol; // Petrol, Hybrid and Plug-in Hybrid use the petrol slabs
  return table.find((s) => exShowroom <= s.maxPrice)?.rate ?? table[table.length - 1].rate;
}

export interface OnRoadLine {
  label: string;
  amount: number;
  /** 'estimate' lines are assumptions, not statutory figures. */
  kind: 'price' | 'tax' | 'fee' | 'estimate';
}

export interface OnRoadBreakdown {
  cityId: string;
  cityName: string;
  exShowroom: number;
  roadTax: number;
  roadTaxRate: number;
  /** Cess / safety tax / parking fee / infrastructure levy, per city. */
  extras: { label: string; amount: number }[];
  registration: number;
  hsrp: number;
  fastag: number;
  insurance: number;
  tcs: number;
  total: number;
  lines: OnRoadLine[];
}

export function onRoadBreakdown(
  exShowroom: number,
  fuel: FuelType,
  cityId = 'bengaluru',
): OnRoadBreakdown {
  const city = cityById(cityId);
  const rate = roadTaxRate(exShowroom, fuel, cityId);
  let roadTax = Math.round(exShowroom * rate);
  if (city.minTax && roadTax < city.minTax && rate > 0) roadTax = city.minTax;
  const extras = (city.extras?.(exShowroom, roadTax) ?? []).filter((e) => e.amount > 0);
  const extrasTotal = extras.reduce((n, e) => n + e.amount, 0);
  const insurance = Math.round(exShowroom * INSURANCE_RATE);
  const tcs = exShowroom > TCS_THRESHOLD ? Math.round(exShowroom * TCS_RATE) : 0;
  const total =
    exShowroom +
    roadTax +
    extrasTotal +
    REGISTRATION_FEE +
    HSRP_FEE +
    FASTAG_FEE +
    insurance +
    tcs;
  const lines: OnRoadLine[] = [
    { label: 'Ex-showroom price', amount: exShowroom, kind: 'price' },
    { label: `Road tax (${Math.round(rate * 100)}% of ex-showroom)`, amount: roadTax, kind: 'tax' },
    ...extras.map((e) => ({ label: e.label, amount: e.amount, kind: 'tax' as const })),
    { label: 'Registration fee', amount: REGISTRATION_FEE, kind: 'fee' },
    { label: 'HSRP number plates', amount: HSRP_FEE, kind: 'fee' },
    { label: 'FASTag', amount: FASTAG_FEE, kind: 'fee' },
    { label: 'First-year insurance (estimate, ~3.5%)', amount: insurance, kind: 'estimate' },
  ];
  if (tcs > 0) {
    lines.push({ label: 'TCS (1%, ex-showroom above Rs 10 lakh)', amount: tcs, kind: 'tax' });
  }
  lines.push({ label: `On-road total (${city.name})`, amount: total, kind: 'price' });
  return {
    cityId: city.id,
    cityName: city.name,
    exShowroom,
    roadTax,
    roadTaxRate: rate,
    extras,
    registration: REGISTRATION_FEE,
    hsrp: HSRP_FEE,
    fastag: FASTAG_FEE,
    insurance,
    tcs,
    total,
    lines,
  };
}

/** On-road total only, for tables and exports. Defaults to Bengaluru. */
export function onRoadTotal(exShowroom: number, fuel: FuelType, cityId = 'bengaluru'): number {
  return onRoadBreakdown(exShowroom, fuel, cityId).total;
}
