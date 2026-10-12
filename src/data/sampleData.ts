// ---------------------------------------------------------------------------
// SAMPLE DATASET - NOT VERIFIED MARKET DATA
//
// Every price below is an ILLUSTRATIVE estimate included so the dashboard,
// filters, charts and counting logic can be exercised before real data is
// collected. Do not treat any figure here as a real market price.
//
// Real data collection rules (see README.md):
// - verify each model is currently listed for sale in India
// - record the exact ex-showroom price from a reliable source
// - record source_url and last_verified_at for every record
// - set isEstimate=false only for exact published prices
// ---------------------------------------------------------------------------

import type {
  CarModel,
  FuelType,
  LaunchEvent,
  Maker,
  PriceRecord,
  Transmission,
  Variant,
} from './types';

export const SAMPLE_SOURCE = 'sample';
export const SAMPLE_VERIFIED_AT = '2026-10-12';
export const SAMPLE_NOTE =
  'Sample dataset: illustrative estimates for previewing the site. Not verified market data.';

export const makers: Maker[] = [
  { id: 'maruti', name: 'Maruti Suzuki', countryOfOrigin: 'India / Japan' },
  { id: 'hyundai', name: 'Hyundai', countryOfOrigin: 'South Korea' },
  { id: 'tata', name: 'Tata Motors', countryOfOrigin: 'India' },
  { id: 'mahindra', name: 'Mahindra', countryOfOrigin: 'India' },
  { id: 'kia', name: 'Kia', countryOfOrigin: 'South Korea' },
  { id: 'toyota', name: 'Toyota', countryOfOrigin: 'Japan' },
  { id: 'honda', name: 'Honda', countryOfOrigin: 'Japan' },
  { id: 'mg', name: 'MG Motor', countryOfOrigin: 'United Kingdom / China' },
  { id: 'ford', name: 'Ford', countryOfOrigin: 'United States' },
  { id: 'datsun', name: 'Datsun', countryOfOrigin: 'Japan' },
];

type VariantSpec = [name: string, fuel: FuelType, transmission: Transmission, priceLakh: number];

interface ModelSpec {
  id: string;
  makerId: string;
  name: string;
  bodyType: CarModel['bodyType'];
  firstLaunchDate?: string;
  latestGenerationDate?: string;
  latestFaceliftDate?: string;
  status: CarModel['status'];
  variants: VariantSpec[];
}

const LAKH = 100000;

const modelSpecs: ModelSpec[] = [
  {
    id: 'swift', makerId: 'maruti', name: 'Swift', bodyType: 'Hatchback',
    firstLaunchDate: '2005-05-25', latestGenerationDate: '2024-05-09', status: 'active',
    variants: [
      ['LXi', 'Petrol', 'Manual', 6.49],
      ['VXi', 'Petrol', 'Manual', 7.42],
      ['VXi AMT', 'Petrol', 'AMT', 7.92],
      ['ZXi', 'Petrol', 'Manual', 8.3],
      ['ZXi Plus', 'Petrol', 'AMT', 9.5],
    ],
  },
  {
    id: 'baleno', makerId: 'maruti', name: 'Baleno', bodyType: 'Hatchback',
    firstLaunchDate: '2015-10-26', latestFaceliftDate: '2022-02-23', status: 'active',
    variants: [
      ['Sigma', 'Petrol', 'Manual', 6.7],
      ['Delta', 'Petrol', 'Manual', 7.51],
      ['Delta AMT', 'Petrol', 'AMT', 8.01],
      ['Zeta', 'Petrol', 'Manual', 8.43],
      ['Alpha', 'Petrol', 'AMT', 9.92],
    ],
  },
  {
    id: 'brezza', makerId: 'maruti', name: 'Brezza', bodyType: 'SUV',
    firstLaunchDate: '2016-03-08', latestFaceliftDate: '2022-06-30', status: 'active',
    variants: [
      ['LXi', 'Petrol', 'Manual', 8.34],
      ['VXi', 'Petrol', 'Manual', 9.64],
      ['VXi AT', 'Petrol', 'Automatic', 11.04],
      ['ZXi', 'Petrol', 'Manual', 11.14],
      ['ZXi Plus AT', 'Petrol', 'Automatic', 14.14],
    ],
  },
  {
    id: 'fronx', makerId: 'maruti', name: 'Fronx', bodyType: 'Crossover',
    firstLaunchDate: '2023-04-24', status: 'active',
    variants: [
      ['Sigma 1.2', 'Petrol', 'Manual', 7.51],
      ['Delta 1.2', 'Petrol', 'Manual', 8.43],
      ['Delta Plus 1.0T', 'Petrol', 'Manual', 9.72],
      ['Zeta 1.0T AT', 'Petrol', 'Automatic', 12.99],
    ],
  },
  {
    id: 'i20', makerId: 'hyundai', name: 'i20', bodyType: 'Hatchback',
    firstLaunchDate: '2008-12-29', latestFaceliftDate: '2023-09-08', status: 'active',
    variants: [
      ['Era', 'Petrol', 'Manual', 7.04],
      ['Magna', 'Petrol', 'Manual', 7.95],
      ['Sportz', 'Petrol', 'Manual', 8.73],
      ['Asta', 'Petrol', 'CVT', 10.25],
      ['Asta (O)', 'Petrol', 'CVT', 11.21],
    ],
  },
  {
    id: 'creta', makerId: 'hyundai', name: 'Creta', bodyType: 'SUV',
    firstLaunchDate: '2015-07-21', latestGenerationDate: '2024-01-16', status: 'active',
    variants: [
      ['E 1.5P', 'Petrol', 'Manual', 11.0],
      ['EX 1.5P', 'Petrol', 'Manual', 12.18],
      ['S 1.5D', 'Diesel', 'Manual', 14.62],
      ['SX 1.5T DCT', 'Petrol', 'DCT', 18.74],
      ['SX (O) 1.5D AT', 'Diesel', 'Automatic', 20.42],
    ],
  },
  {
    id: 'creta-electric', makerId: 'hyundai', name: 'Creta Electric', bodyType: 'SUV',
    firstLaunchDate: '2025-01-17', status: 'active',
    variants: [
      ['Executive', 'Electric', 'Automatic', 17.99],
      ['Smart', 'Electric', 'Automatic', 19.5],
      ['Excellence LR', 'Electric', 'Automatic', 24.38],
    ],
  },
  {
    id: 'venue', makerId: 'hyundai', name: 'Venue', bodyType: 'SUV',
    firstLaunchDate: '2019-05-21', latestFaceliftDate: '2022-06-16', status: 'active',
    variants: [
      ['E 1.2P', 'Petrol', 'Manual', 7.94],
      ['S 1.2P', 'Petrol', 'Manual', 9.15],
      ['S 1.5D', 'Diesel', 'Manual', 10.94],
      ['SX 1.0T DCT', 'Petrol', 'DCT', 12.44],
      ['SX (O) 1.5D', 'Diesel', 'Manual', 13.62],
    ],
  },
  {
    id: 'nexon', makerId: 'tata', name: 'Nexon', bodyType: 'SUV',
    firstLaunchDate: '2017-09-21', latestFaceliftDate: '2023-09-14', status: 'active',
    variants: [
      ['Smart 1.2P', 'Petrol', 'Manual', 8.15],
      ['Pure 1.2P', 'Petrol', 'Manual', 9.42],
      ['Creative 1.5D', 'Diesel', 'Manual', 12.1],
      ['Fearless 1.2P DCT', 'Petrol', 'DCT', 14.6],
      ['Empowered 1.5D AMT', 'Diesel', 'AMT', 15.8],
    ],
  },
  {
    id: 'nexon-ev', makerId: 'tata', name: 'Nexon EV', bodyType: 'SUV',
    firstLaunchDate: '2020-01-28', latestFaceliftDate: '2023-09-14', status: 'active',
    variants: [
      ['Creative 40.5', 'Electric', 'Automatic', 14.74],
      ['Fearless 40.5', 'Electric', 'Automatic', 16.19],
      ['Empowered 45', 'Electric', 'Automatic', 19.99],
    ],
  },
  {
    id: 'punch', makerId: 'tata', name: 'Punch', bodyType: 'SUV',
    firstLaunchDate: '2021-10-18', status: 'active',
    variants: [
      ['Pure 1.2P', 'Petrol', 'Manual', 6.13],
      ['Adventure 1.2P', 'Petrol', 'Manual', 7.1],
      ['Adventure CNG', 'CNG', 'Manual', 8.05],
      ['Accomplished 1.2P AMT', 'Petrol', 'AMT', 9.2],
    ],
  },
  {
    id: 'punch-ev', makerId: 'tata', name: 'Punch EV', bodyType: 'SUV',
    firstLaunchDate: '2024-01-17', status: 'active',
    variants: [
      ['Smart', 'Electric', 'Automatic', 10.99],
      ['Adventure LR', 'Electric', 'Automatic', 13.29],
      ['Empowered LR', 'Electric', 'Automatic', 15.49],
    ],
  },
  {
    id: 'harrier', makerId: 'tata', name: 'Harrier', bodyType: 'SUV',
    firstLaunchDate: '2019-01-23', latestFaceliftDate: '2023-10-17', status: 'active',
    variants: [
      ['Smart 2.0D', 'Diesel', 'Manual', 15.49],
      ['Pure 2.0D', 'Diesel', 'Manual', 17.69],
      ['Adventure 2.0D AT', 'Diesel', 'Automatic', 21.99],
      ['Fearless 2.0D AT', 'Diesel', 'Automatic', 26.44],
    ],
  },
  {
    id: 'safari', makerId: 'tata', name: 'Safari', bodyType: 'SUV',
    firstLaunchDate: '2021-02-22', latestFaceliftDate: '2023-10-17', status: 'active',
    variants: [
      ['Smart 2.0D', 'Diesel', 'Manual', 16.19],
      ['Pure 2.0D', 'Diesel', 'Manual', 18.29],
      ['Adventure 2.0D AT', 'Diesel', 'Automatic', 23.19],
      ['Accomplished 2.0D AT', 'Diesel', 'Automatic', 27.64],
    ],
  },
  {
    id: 'curvv', makerId: 'tata', name: 'Curvv', bodyType: 'Coupe',
    firstLaunchDate: '2024-08-07', status: 'active',
    variants: [
      ['Smart 1.2P', 'Petrol', 'Manual', 9.99],
      ['Pure 1.5D', 'Diesel', 'Manual', 12.49],
      ['Creative EV 45', 'Electric', 'Automatic', 17.49],
      ['Accomplished EV 55', 'Electric', 'Automatic', 21.99],
    ],
  },
  {
    id: 'thar', makerId: 'mahindra', name: 'Thar', bodyType: 'Off-road',
    firstLaunchDate: '2010-10-04', latestGenerationDate: '2020-10-02', status: 'active',
    variants: [
      ['AX 2.0P', 'Petrol', 'Manual', 11.35],
      ['LX 2.2D', 'Diesel', 'Manual', 13.59],
      ['LX 2.0P AT', 'Petrol', 'Automatic', 15.49],
      ['LX 2.2D AT', 'Diesel', 'Automatic', 17.6],
    ],
  },
  {
    id: 'thar-roxx', makerId: 'mahindra', name: 'Thar Roxx', bodyType: 'Off-road',
    firstLaunchDate: '2024-08-15', status: 'active',
    variants: [
      ['MX1 2.0P', 'Petrol', 'Manual', 12.99],
      ['MX3 2.2D', 'Diesel', 'Manual', 15.49],
      ['AX7L 2.0P AT', 'Petrol', 'Automatic', 19.99],
      ['AX7L 2.2D AT', 'Diesel', 'Automatic', 22.49],
    ],
  },
  {
    id: 'scorpio-n', makerId: 'mahindra', name: 'Scorpio-N', bodyType: 'SUV',
    firstLaunchDate: '2022-06-27', status: 'active',
    variants: [
      ['Z2 2.0P', 'Petrol', 'Manual', 13.85],
      ['Z4 2.2D', 'Diesel', 'Manual', 16.94],
      ['Z6 2.2D AT', 'Diesel', 'Automatic', 19.49],
      ['Z8L 2.2D AT', 'Diesel', 'Automatic', 24.54],
    ],
  },
  {
    id: 'xuv700', makerId: 'mahindra', name: 'XUV700', bodyType: 'SUV',
    firstLaunchDate: '2021-08-14', status: 'discontinued',
    variants: [
      ['MX 2.0P', 'Petrol', 'Manual', 13.99],
      ['AX3 2.2D', 'Diesel', 'Manual', 17.49],
      ['AX5 2.0P AT', 'Petrol', 'Automatic', 20.69],
      ['AX7L 2.2D AT', 'Diesel', 'Automatic', 25.99],
    ],
  },
  {
    id: 'xuv-3xo', makerId: 'mahindra', name: 'XUV 3XO', bodyType: 'SUV',
    firstLaunchDate: '2024-04-29', status: 'active',
    variants: [
      ['MX1 1.2P', 'Petrol', 'Manual', 7.49],
      ['MX2 1.2P', 'Petrol', 'Manual', 8.99],
      ['AX5 1.5D', 'Diesel', 'Manual', 12.49],
      ['AX7L 1.2T AT', 'Petrol', 'Automatic', 15.8],
    ],
  },
  {
    id: 'seltos', makerId: 'kia', name: 'Seltos', bodyType: 'SUV',
    firstLaunchDate: '2019-08-21', latestFaceliftDate: '2023-07-21', status: 'active',
    variants: [
      ['HTE 1.5P', 'Petrol', 'Manual', 10.9],
      ['HTK 1.5P', 'Petrol', 'Manual', 12.49],
      ['HTX 1.5D', 'Diesel', 'Manual', 15.99],
      ['GTX 1.5T DCT', 'Petrol', 'DCT', 19.49],
      ['X-Line 1.5D AT', 'Diesel', 'Automatic', 20.45],
    ],
  },
  {
    id: 'sonet', makerId: 'kia', name: 'Sonet', bodyType: 'SUV',
    firstLaunchDate: '2020-09-18', latestFaceliftDate: '2024-01-15', status: 'active',
    variants: [
      ['HTE 1.2P', 'Petrol', 'Manual', 7.99],
      ['HTK 1.2P', 'Petrol', 'Manual', 9.49],
      ['HTX 1.5D', 'Diesel', 'Manual', 12.39],
      ['GTX 1.0T DCT', 'Petrol', 'DCT', 14.39],
      ['X-Line 1.5D AT', 'Diesel', 'Automatic', 15.79],
    ],
  },
  {
    id: 'innova-crysta', makerId: 'toyota', name: 'Innova Crysta', bodyType: 'MPV',
    firstLaunchDate: '2005-02-24', latestFaceliftDate: '2023-01-01', status: 'active',
    variants: [
      ['GX 2.4D', 'Diesel', 'Manual', 19.99],
      ['VX 2.4D', 'Diesel', 'Manual', 23.49],
      ['ZX 2.4D AT', 'Diesel', 'Automatic', 26.64],
    ],
  },
  {
    id: 'hyryder', makerId: 'toyota', name: 'Hyryder', bodyType: 'SUV',
    firstLaunchDate: '2022-09-09', status: 'active',
    variants: [
      ['E 1.5P', 'Petrol', 'Manual', 11.34],
      ['S 1.5P Hybrid', 'Hybrid', 'CVT', 14.99],
      ['G 1.5P Hybrid', 'Hybrid', 'CVT', 17.49],
      ['V 1.5P Hybrid AWD', 'Hybrid', 'CVT', 20.19],
    ],
  },
  {
    id: 'city', makerId: 'honda', name: 'City', bodyType: 'Sedan',
    firstLaunchDate: '1998-01-15', latestGenerationDate: '2020-07-16', status: 'active',
    variants: [
      ['SV 1.5P', 'Petrol', 'Manual', 11.71],
      ['V 1.5P', 'Petrol', 'Manual', 12.94],
      ['VX 1.5P CVT', 'Petrol', 'CVT', 14.94],
      ['ZX 1.5 Hybrid', 'Hybrid', 'CVT', 20.39],
    ],
  },
  {
    id: 'elevate', makerId: 'honda', name: 'Elevate', bodyType: 'SUV',
    firstLaunchDate: '2023-09-04', status: 'active',
    variants: [
      ['SV 1.5P', 'Petrol', 'Manual', 11.58],
      ['V 1.5P', 'Petrol', 'Manual', 12.86],
      ['VX 1.5P CVT', 'Petrol', 'CVT', 14.53],
      ['ZX 1.5P CVT', 'Petrol', 'CVT', 16.48],
    ],
  },
  {
    id: 'windsor', makerId: 'mg', name: 'Windsor', bodyType: 'Crossover',
    firstLaunchDate: '2024-09-11', status: 'active',
    variants: [
      ['Excite', 'Electric', 'Automatic', 13.5],
      ['Exclusive', 'Electric', 'Automatic', 15.49],
      ['Essence', 'Electric', 'Automatic', 18.31],
    ],
  },
  // ---- Discontinued nameplates (kept separate from active inventory) ----
  {
    id: 'ecosport', makerId: 'ford', name: 'EcoSport', bodyType: 'SUV',
    firstLaunchDate: '2013-06-26', status: 'discontinued',
    variants: [
      ['Ambiente 1.5P', 'Petrol', 'Manual', 7.99],
      ['Titanium 1.5D', 'Diesel', 'Manual', 11.49],
    ],
  },
  {
    id: 'redi-go', makerId: 'datsun', name: 'redi-GO', bodyType: 'Hatchback',
    firstLaunchDate: '2016-06-07', status: 'discontinued',
    variants: [
      ['D 0.8P', 'Petrol', 'Manual', 3.8],
      ['T 1.0P AMT', 'Petrol', 'AMT', 5.2],
    ],
  },
  {
    id: 'jazz', makerId: 'honda', name: 'Jazz', bodyType: 'Hatchback',
    firstLaunchDate: '2009-06-10', status: 'discontinued',
    variants: [
      ['V 1.2P', 'Petrol', 'Manual', 7.75],
      ['ZX 1.2P CVT', 'Petrol', 'CVT', 9.99],
    ],
  },
];

function expandModels(): CarModel[] {
  return modelSpecs.map((m) => ({
    id: m.id,
    makerId: m.makerId,
    name: m.name,
    bodyType: m.bodyType,
    firstLaunchDate: m.firstLaunchDate,
    latestGenerationDate: m.latestGenerationDate,
    latestFaceliftDate: m.latestFaceliftDate,
    status: m.status,
    sourceUrl: SAMPLE_SOURCE,
    lastVerifiedAt: SAMPLE_VERIFIED_AT,
    isEstimate: true,
  }));
}

function expandVariants(): Variant[] {
  const out: Variant[] = [];
  for (const m of modelSpecs) {
    m.variants.forEach(([name, fuel, transmission, priceLakh], i) => {
      out.push({
        id: `${m.id}-v${i + 1}`,
        modelId: m.id,
        name,
        fuelType: fuel,
        transmission,
        exShowroomPrice: Math.round(priceLakh * LAKH),
        availabilityStatus: m.status === 'active' ? 'available' : 'discontinued',
        sourceUrl: SAMPLE_SOURCE,
        lastVerifiedAt: SAMPLE_VERIFIED_AT,
        isEstimate: true,
      });
    });
  }
  return out;
}

export const models: CarModel[] = expandModels();
export const variants: Variant[] = expandVariants();

// A few illustrative price changes so the price-history view has content.
export const priceHistory: PriceRecord[] = [
  {
    id: 'ph-1', variantId: 'nexon-ev-v1', exShowroomPrice: Math.round(15.49 * LAKH),
    effectiveDate: '2023-09-14', sourceUrl: SAMPLE_SOURCE, isEstimate: true,
  },
  {
    id: 'ph-2', variantId: 'nexon-ev-v1', exShowroomPrice: Math.round(14.74 * LAKH),
    effectiveDate: '2024-02-01', sourceUrl: SAMPLE_SOURCE, isEstimate: true,
  },
  {
    id: 'ph-3', variantId: 'creta-v1', exShowroomPrice: Math.round(10.87 * LAKH),
    effectiveDate: '2023-07-01', sourceUrl: SAMPLE_SOURCE, isEstimate: true,
  },
  {
    id: 'ph-4', variantId: 'creta-v1', exShowroomPrice: Math.round(11.0 * LAKH),
    effectiveDate: '2024-01-16', sourceUrl: SAMPLE_SOURCE, isEstimate: true,
  },
  {
    id: 'ph-5', variantId: 'swift-v1', exShowroomPrice: Math.round(5.99 * LAKH),
    effectiveDate: '2023-05-01', sourceUrl: SAMPLE_SOURCE, isEstimate: true,
  },
  {
    id: 'ph-6', variantId: 'swift-v1', exShowroomPrice: Math.round(6.49 * LAKH),
    effectiveDate: '2024-05-09', sourceUrl: SAMPLE_SOURCE, isEstimate: true,
  },
];

// Launch events inside the Oct 2023 - Oct 2026 window (sample entries).
export const launches: LaunchEvent[] = [
  { id: 'l-1', modelId: 'harrier', launchDate: '2023-10-17', launchType: 'Major facelift', launchPrice: Math.round(15.49 * LAKH), sourceUrl: SAMPLE_SOURCE, isEstimate: true },
  { id: 'l-2', modelId: 'safari', launchDate: '2023-10-17', launchType: 'Major facelift', launchPrice: Math.round(16.19 * LAKH), sourceUrl: SAMPLE_SOURCE, isEstimate: true },
  { id: 'l-3', modelId: 'sonet', launchDate: '2024-01-15', launchType: 'Major facelift', launchPrice: Math.round(7.99 * LAKH), sourceUrl: SAMPLE_SOURCE, isEstimate: true },
  { id: 'l-4', modelId: 'creta', launchDate: '2024-01-16', launchType: 'New generation', launchPrice: Math.round(11.0 * LAKH), sourceUrl: SAMPLE_SOURCE, isEstimate: true },
  { id: 'l-5', modelId: 'punch-ev', launchDate: '2024-01-17', launchType: 'EV derivative', launchPrice: Math.round(10.99 * LAKH), sourceUrl: SAMPLE_SOURCE, isEstimate: true },
  { id: 'l-6', modelId: 'xuv-3xo', launchDate: '2024-04-29', launchType: 'New nameplate', launchPrice: Math.round(7.49 * LAKH), sourceUrl: SAMPLE_SOURCE, isEstimate: true },
  { id: 'l-7', modelId: 'swift', launchDate: '2024-05-09', launchType: 'New generation', launchPrice: Math.round(6.49 * LAKH), sourceUrl: SAMPLE_SOURCE, isEstimate: true },
  { id: 'l-8', modelId: 'curvv', launchDate: '2024-08-07', launchType: 'EV derivative', launchPrice: Math.round(17.49 * LAKH), sourceUrl: SAMPLE_SOURCE, isEstimate: true },
  { id: 'l-9', modelId: 'thar-roxx', launchDate: '2024-08-15', launchType: 'New nameplate', launchPrice: Math.round(12.99 * LAKH), sourceUrl: SAMPLE_SOURCE, isEstimate: true },
  { id: 'l-10', modelId: 'curvv', launchDate: '2024-09-02', launchType: 'New nameplate', launchPrice: Math.round(9.99 * LAKH), sourceUrl: SAMPLE_SOURCE, isEstimate: true },
  { id: 'l-11', modelId: 'windsor', launchDate: '2024-09-11', launchType: 'New nameplate', launchPrice: Math.round(13.5 * LAKH), sourceUrl: SAMPLE_SOURCE, isEstimate: true },
  { id: 'l-12', modelId: 'creta-electric', launchDate: '2025-01-17', launchType: 'EV derivative', launchPrice: Math.round(17.99 * LAKH), sourceUrl: SAMPLE_SOURCE, isEstimate: true },
];
