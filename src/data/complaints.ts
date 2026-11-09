// Customer complaints and recalls. Read this before using the figures.
//
// WHAT DOES NOT EXIST (checked 2026-11-09):
// India publishes NO official per-model or per-maker consumer-complaint
// counts. The National Consumer Helpline (INGRAM, consumerhelpline.gov.in)
// reports total volumes (about 1.7 lakh complaints a month in 2025) but
// no company-wise breakdown. Consumer-complaint aggregators
// (ComplaintsBoard, consumercomplaints.in, MouthShut) are self-selected,
// unverified and not comparable across brands, so this site does NOT use
// their counts. US NHTSA complaint data covers American-market cars only
// and is not shown here either.
//
// WHAT IS SHOWN INSTEAD (all figures tied to a stated source and date):
// vehicle recalls from the SIAM Voluntary Recall portal - the official
// public record of safety-defect recalls in India since 2012, per
// manufacturer, model and variant. A recall is a safety-defect action,
// NOT a complaint count: recalls are triggered when similar defect
// complaints cross a threshold, and recall volumes track sales volume,
// so a big seller recalls more units without being less reliable.
// Per-model recall counts exist on the SIAM portal, but no published
// summary breaks them out for all 77 models on this site; the figures
// below are the published manufacturer-level summaries.
//
// Sources:
//   2025 maker figures: Moneycontrol, 30 Dec 2025 (SIAM data)
//     https://www.moneycontrol.com/automobile/carmakers-recall-just-1-19-lakh-vehicles-in-2025-lowest-in-eight-years-article-13748299.html
//   Cumulative figures and defect categories: Factly, 2 Mar 2026
//     (analysis of the SIAM portal as of Feb 2026)
//     https://factly.in/over-38-lakh-vehicles-recalled-in-india-since-2012-airbags-and-engine-faults-lead/
//   Portal: https://siam.in/siam-voluntary-recall.aspx
//   File a complaint: National Consumer Helpline 1915,
//     https://consumerhelpline.gov.in

export const COMPLAINTS_UPDATED_AT = '2026-11-09';

export interface MakerRecall {
  maker: string;
  vehicles: number;
  note: string;
}

/** Vehicles recalled in 2025, by maker (SIAM data via Moneycontrol). */
export const RECALLS_2025: MakerRecall[] = [
  {
    maker: 'Skoda + Volkswagen',
    vehicles: 49000,
    note: 'Approx. 49,000 combined; Kushaq, Slavia, Kylaq, Taigun, Virtus.',
  },
  {
    maker: 'Maruti Suzuki',
    vehicles: 40000,
    note: 'Approx. 40,000; mainly Grand Vitara (fuel-gauge fault). About a third of all 2025 recalls.',
  },
  {
    maker: 'Toyota',
    vehicles: 20000,
    note: 'A little over 20,000.',
  },
  {
    maker: 'Mercedes-Benz',
    vehicles: 2820,
    note: 'E-Class, AMG E-Class, CLE.',
  },
  {
    maker: 'Kia',
    vehicles: 1380,
    note: 'EV6 (charging-control unit fix).',
  },
];

/** Total vehicles recalled in India in 2025 (all types). */
export const RECALLS_2025_TOTAL = 119173;
/** Total vehicles recalled since the voluntary code began, Jul 2012. */
export const RECALLS_SINCE_2012_TOTAL = 3867000;
/** Maruti Suzuki vehicles recalled since 2012 (Factly / SIAM, Feb 2026). */
export const MARUTI_RECALLS_SINCE_2012 = 530000;

export interface DefectCategory {
  category: string;
  sharePct: number;
}

export const RECALL_DEFECT_CATEGORIES: DefectCategory[] = [
  { category: 'Airbag & safety restraint', sharePct: 25.6 },
  { category: 'Engine / powertrain', sharePct: 24.6 },
  { category: 'Fuel system', sharePct: 9 },
];

export const COMPLAINTS_SOURCES = [
  {
    label: 'Moneycontrol, 30 Dec 2025: 2025 recalls by maker (SIAM data)',
    url: 'https://www.moneycontrol.com/automobile/carmakers-recall-just-1-19-lakh-vehicles-in-2025-lowest-in-eight-years-article-13748299.html',
  },
  {
    label: 'Factly, 2 Mar 2026: recalls since 2012, top makers and defect categories',
    url: 'https://factly.in/over-38-lakh-vehicles-recalled-in-india-since-2012-airbags-and-engine-faults-lead/',
  },
  {
    label: 'SIAM Voluntary Recall portal (official record)',
    url: 'https://siam.in/siam-voluntary-recall.aspx',
  },
  {
    label: 'National Consumer Helpline (file a complaint: 1915)',
    url: 'https://consumerhelpline.gov.in',
  },
];
