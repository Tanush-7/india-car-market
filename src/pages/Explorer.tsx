import { useMemo, useState } from 'react';
import type { MarketDataset } from '../data/provider';
import type { ModelRow } from '../lib/enrich';
import { enrichModels } from '../lib/enrich';
import { bandForPrice, priceBands } from '../lib/bands';
import { downloadCsv } from '../lib/csv';
import { fmtDate, inr, inrLakh } from '../lib/format';
import { CITIES, cityById, onRoadBreakdown, onRoadTotal, ONROAD_UPDATED_AT } from '../data/onRoad';
import { maintenanceForModel } from '../data/maintenance';
import { agencyLabel, safetyForModel, stars } from '../data/safety';
import { defaultMileage, FUEL_PRICES_UPDATED_AT, fuelPriceFor, monthlyFuelCost } from '../data/fuel';
import { emiCalc } from '../data/emi';
import { modelPriceChanges } from '../lib/priceChanges';
import {
  Badge,
  Card,
  EmptyState,
  FilterSelect,
  PageHeader,
  SearchInput,
} from '../components/ui';

const PAGE_SIZE = 15;
const MAX_COMPARE = 3;

type SortKey = 'start' | 'startDesc' | 'top' | 'topDesc' | 'maker' | 'name';

function ModelModal(props: {
  row: ModelRow;
  ds: MarketDataset;
  cityId: string;
  onCityChange: (cityId: string) => void;
  onClose: () => void;
}) {
  const { row } = props;
  const city = cityById(props.cityId);
  const changes = modelPriceChanges(props.ds, row.model.id);
  const cheapest = row.variants.reduce((a, b) => (a.exShowroomPrice < b.exShowroomPrice ? a : b));
  const onRoad = onRoadBreakdown(cheapest.exShowroomPrice, cheapest.fuelType, props.cityId);
  const maint = maintenanceForModel(row.model.bodyType, row.startPrice, row.fuels);
  const safety = safetyForModel(row.model.id);

  // EMI calculator: defaults 20% down, 9% per year, 5 years.
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(9);
  const [years, setYears] = useState(5);
  const emi = emiCalc(
    onRoad.total,
    Math.round((onRoad.total * downPct) / 100),
    rate,
    years,
  );

  // Monthly fuel / running cost: defaults from the cheapest variant's fuel
  // and the selected city, mileage is the segment average (editable).
  const mileageDefault = defaultMileage(row.model.bodyType, row.startPrice, cheapest.fuelType);
  const fuelPriceDefault = fuelPriceFor(cheapest.fuelType, props.cityId);
  const [kmPerMonth, setKmPerMonth] = useState(1000);
  const [mileage, setMileage] = useState(mileageDefault.value);
  const [fuelPrice, setFuelPrice] = useState(fuelPriceDefault.price);
  const fuelCost = monthlyFuelCost(kmPerMonth, mileage, fuelPrice);

  const numInput =
    'w-20 rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900';

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4"
      onClick={props.onClose}
    >
      <div
        className="mt-10 w-full max-w-3xl rounded-xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {row.makerName} {row.model.name}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {row.model.bodyType} - {row.variants.length} variants -{' '}
              {row.startPrice ? inr(row.startPrice) : '—'} to{' '}
              {row.topPrice ? inr(row.topPrice) : '—'} ex-showroom
            </p>
          </div>
          <button
            onClick={props.onClose}
            className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            Close
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <label className="flex items-center gap-2 font-medium text-slate-700">
            On-road city
            <select
              value={props.cityId}
              onChange={(e) => props.onCityChange(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900"
            >
              {CITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.state})
                </option>
              ))}
            </select>
          </label>
          {changes.length > 0 && (
            <span className="text-xs text-slate-500">
              Latest price change: {fmtDate(changes[0].date)} ({changes[0].delta > 0 ? '+' : ''}
              {inr(changes[0].delta)}, {changes[0].pct > 0 ? '+' : ''}
              {changes[0].pct.toFixed(1)}%)
            </span>
          )}
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                <th className="py-2 pr-2">Variant</th>
                <th className="hidden py-2 pr-2 sm:table-cell">Fuel</th>
                <th className="hidden py-2 pr-2 sm:table-cell">Transmission</th>
                <th className="py-2 text-right">Ex-showroom</th>
                <th className="py-2 text-right">On-road, {city.name} (est.)</th>
                <th className="py-2 text-right">Data</th>
              </tr>
            </thead>
            <tbody>
              {row.variants.map((v) => (
                <tr key={v.id} className="border-b border-slate-100">
                  <td className="py-2 pr-2 font-medium text-slate-900">{v.name}</td>
                  <td className="hidden py-2 pr-2 text-slate-600 sm:table-cell">{v.fuelType}</td>
                  <td className="hidden py-2 pr-2 text-slate-600 sm:table-cell">{v.transmission}</td>
                  <td className="py-2 text-right text-slate-900">{inr(v.exShowroomPrice)}</td>
                  <td className="py-2 text-right text-slate-900">
                    {inr(onRoadTotal(v.exShowroomPrice, v.fuelType, props.cityId))}
                  </td>
                  <td className="py-2 text-right">
                    {v.isEstimate ? (
                      <Badge tone="amber">Estimate</Badge>
                    ) : (
                      <Badge tone="green">Exact price</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
          <div className="font-medium text-slate-700">
            {city.name} on-road breakdown - {cheapest.name} (cheapest variant), updated{' '}
            {fmtDate(ONROAD_UPDATED_AT)}
          </div>
          <ul className="mt-1 space-y-0.5">
            {onRoad.lines.map((l) => (
              <li key={l.label} className="flex justify-between gap-2">
                <span>
                  {l.label}
                  {l.kind === 'estimate' ? ' *' : ''}
                </span>
                <span className="font-medium text-slate-900">{inr(l.amount)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2">
            * Insurance is an estimate (~3.5% of ex-showroom); get a dealer quote. {city.note}{' '}
            Hypothecation (Rs 1,500, only if financed) and dealer handling charges are not
            included. Every variant's on-road total is in the table above.
          </p>
        </div>

        <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
          <div className="font-medium text-slate-700">
            On-road total across cities - {cheapest.name} (cheapest variant, estimate)
          </div>
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
            {CITIES.map((c) => (
              <div key={c.id} className="flex justify-between gap-2">
                <span>{c.name}</span>
                <span className="font-medium text-slate-900">
                  {inr(onRoadTotal(cheapest.exShowroomPrice, cheapest.fuelType, c.id))}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2">
            Same variant, same ex-showroom price - the difference is the state road tax.
            Kolkata uses the 10% lifetime tax; the capacity-based one-time tax can be lower
            for small cars.
          </p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
            <div className="font-medium text-slate-700">
              EMI calculator - on-road {city.name} {inr(onRoad.total)}
            </div>
            <div className="mt-2 space-y-1.5">
              <label className="flex items-center justify-between gap-2">
                Down payment (%)
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={downPct}
                  onChange={(e) => setDownPct(Number(e.target.value))}
                  className={numInput}
                />
              </label>
              <label className="flex items-center justify-between gap-2">
                Interest rate (% per year)
                <input
                  type="number"
                  min={0}
                  max={30}
                  step={0.1}
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className={numInput}
                />
              </label>
              <label className="flex items-center justify-between gap-2">
                Tenure (years)
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  className={numInput}
                />
              </label>
            </div>
            <div className="mt-2 space-y-0.5 border-t border-slate-200 pt-2">
              <div className="flex justify-between gap-2">
                <span>Loan amount</span>
                <span className="font-medium text-slate-900">{inr(emi.loanAmount)}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span>Monthly EMI</span>
                <span className="font-medium text-slate-900">{inr(emi.monthlyEmi)}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span>Total interest</span>
                <span className="font-medium text-slate-900">{inr(emi.totalInterest)}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span>Total payable</span>
                <span className="font-medium text-slate-900">{inr(emi.totalPayable)}</span>
              </div>
            </div>
            <p className="mt-2">
              Reducing-balance EMI on the on-road price. Rate is your loan offer - edit it;
              processing fees are not included.
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
            <div className="font-medium text-slate-700">
              Monthly fuel / running cost - {cheapest.fuelType}
            </div>
            <div className="mt-2 space-y-1.5">
              <label className="flex items-center justify-between gap-2">
                Km driven per month
                <input
                  type="number"
                  min={0}
                  max={10000}
                  step={100}
                  value={kmPerMonth}
                  onChange={(e) => setKmPerMonth(Number(e.target.value))}
                  className={numInput}
                />
              </label>
              <label className="flex items-center justify-between gap-2">
                Mileage ({mileageDefault.unit})
                <input
                  type="number"
                  min={1}
                  max={100}
                  step={0.5}
                  value={mileage}
                  onChange={(e) => setMileage(Number(e.target.value))}
                  className={numInput}
                />
              </label>
              <label className="flex items-center justify-between gap-2">
                {cheapest.fuelType === 'Electric' ? 'Electricity (₹ per unit)' : `Fuel price (₹ per ${fuelPriceDefault.unit})`}
                <input
                  type="number"
                  min={0}
                  max={500}
                  step={0.5}
                  value={fuelPrice}
                  onChange={(e) => setFuelPrice(Number(e.target.value))}
                  className={numInput}
                />
              </label>
            </div>
            <div className="mt-2 border-t border-slate-200 pt-2">
              <div className="flex justify-between gap-2">
                <span>Monthly fuel cost</span>
                <span className="font-medium text-slate-900">{inr(fuelCost)}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span>Per km</span>
                <span className="font-medium text-slate-900">
                  ₹{(fuelPrice / Math.max(1, mileage)).toFixed(2)}
                </span>
              </div>
            </div>
            <p className="mt-2">
              Mileage default is a {mileageDefault.label.toLowerCase()} - edit it for your
              car. Fuel price default is {city.name} Nov 2026
              {fuelPriceDefault.verified ? '' : ' (approximate)'}; prices change often,
              updated {fmtDate(FUEL_PRICES_UPDATED_AT)}.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
          <div className="font-medium text-slate-700">Safety rating</div>
          {safety ? (
            <div className="mt-1">
              <span className="font-medium text-slate-900">
                {stars(safety.adultStars)} {safety.adultStars}/5 adult
              </span>
              {' - '}
              <span className="font-medium text-slate-900">
                {stars(safety.childStars)} {safety.childStars}/5 child
              </span>
              {' - '}
              {agencyLabel(safety.agency)}
              {safety.aop !== undefined && safety.cop !== undefined && (
                <span>
                  {' '}
                  ({safety.aop} / {safety.cop} points)
                </span>
              )}
              <span> - tested {safety.tested}.</span>
              {safety.note && <div className="mt-0.5">{safety.note}</div>}
            </div>
          ) : (
            <div className="mt-1">
              <Badge tone="slate">Not tested</Badge>{' '}
              No NCAP crash test has been published for this model. See the Safety page for
              the full list.
            </div>
          )}
        </div>

        <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
          <div className="font-medium text-slate-700">Typical annual maintenance (estimate)</div>
          <div className="mt-1">
            {inr(maint.low)} - {inr(maint.high)} per year ({maint.label} segment average).
            Includes scheduled service plus a wear-and-tear reserve; excludes fuel, insurance
            and depreciation. See the Dashboard chart for the maker comparison.
          </div>
        </div>

        <div className="mt-4 grid gap-3 text-xs text-slate-600 sm:grid-cols-2">
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="font-medium text-slate-700">Source and verification</div>
            <div className="mt-1">
              Source: {row.model.sourceUrl === 'sample' ? 'Sample dataset' : row.model.sourceUrl}
            </div>
            <div>Last verified: {fmtDate(row.model.lastVerifiedAt)}</div>
            <div>
              Price basis: {row.model.isEstimate ? 'portal estimates, not official list prices' : 'official manufacturer list prices'}
            </div>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="font-medium text-slate-700">Model facts</div>
            <div className="mt-1">Body type: {row.model.bodyType}</div>
            <div>Latest update year: {row.launchYear ?? '—'}</div>
            <div>Status: {row.model.status}</div>
          </div>
        </div>

        {row.model.notes && (
          <div className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
            <div className="font-medium text-amber-800">Data quality notes</div>
            <div className="mt-1">{row.model.notes}</div>
          </div>
        )}

        {changes.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-slate-900">Recorded price changes</h3>
            <ul className="mt-1 space-y-1 text-xs text-slate-600">
              {changes.slice(0, 12).map((c) => (
                <li key={c.id}>
                  {fmtDate(c.date)}: {c.variantName} {inr(c.oldPrice)} to {inr(c.newPrice)} (
                  {c.delta > 0 ? '+' : ''}
                  {inr(c.delta)}, {c.pct > 0 ? '+' : ''}
                  {c.pct.toFixed(1)}%)
                  {c.isEstimate ? ' (estimate)' : ''}
                </li>
              ))}
            </ul>
            {changes.length > 12 && (
              <p className="mt-1 text-xs text-slate-500">
                Showing the 12 most recent of {changes.length} recorded changes.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CompareModal(props: {
  rows: ModelRow[];
  ds: MarketDataset;
  cityId: string;
  onClose: () => void;
}) {
  const city = cityById(props.cityId);
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4"
      onClick={props.onClose}
    >
      <div
        className="mt-10 w-full max-w-4xl rounded-xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Compare cars</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              On-road prices are for {city.name} (cheapest variant, estimate). Safety is the
              published NCAP rating or "Not tested".
            </p>
          </div>
          <button
            onClick={props.onClose}
            className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            Close
          </button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                <th className="py-2 pr-2"> </th>
                {props.rows.map((r) => (
                  <th key={r.model.id} className="py-2 pr-2 font-semibold normal-case text-slate-900">
                    {r.makerName} {r.model.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ['Body type', (r: ModelRow) => r.model.bodyType],
                  ['Starts at (ex-showroom)', (r: ModelRow) => (r.startPrice ? inr(r.startPrice) : '—')],
                  ['Tops at (ex-showroom)', (r: ModelRow) => (r.topPrice ? inr(r.topPrice) : '—')],
                  [
                    `On-road, ${city.name} (est.)`,
                    (r: ModelRow) => {
                      const c = r.variants.reduce((a, b) =>
                        a.exShowroomPrice < b.exShowroomPrice ? a : b,
                      );
                      return inr(onRoadTotal(c.exShowroomPrice, c.fuelType, props.cityId));
                    },
                  ],
                  [
                    'Annual maintenance (est.)',
                    (r: ModelRow) => {
                      const m = maintenanceForModel(r.model.bodyType, r.startPrice, r.fuels);
                      return `${inr(m.low)} - ${inr(m.high)} (${m.label})`;
                    },
                  ],
                  ['Fuel', (r: ModelRow) => r.fuels.join(', ')],
                  ['Transmission', (r: ModelRow) => r.transmissions.join(', ')],
                  ['Variants', (r: ModelRow) => String(r.variants.length)],
                  [
                    'Safety (adult / child)',
                    (r: ModelRow) => {
                      const s = safetyForModel(r.model.id);
                      return s
                        ? `${stars(s.adultStars)} ${s.adultStars}/5 / ${stars(s.childStars)} ${s.childStars}/5 (${agencyLabel(s.agency)})`
                        : 'Not tested';
                    },
                  ],
                  [
                    'Latest price change',
                    (r: ModelRow) => {
                      const ch = modelPriceChanges(props.ds, r.model.id)[0];
                      return ch
                        ? `${fmtDate(ch.date)} (${ch.delta > 0 ? '+' : ''}${inr(ch.delta)})`
                        : 'No recorded changes';
                    },
                  ],
                ] as [string, (r: ModelRow) => string][]
              ).map(([label, fn]) => (
                <tr key={label} className="border-b border-slate-100 align-top">
                  <td className="py-2 pr-2 font-medium text-slate-500">{label}</td>
                  {props.rows.map((r) => (
                    <td key={r.model.id} className="py-2 pr-2 text-slate-900">
                      {fn(r)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function Explorer(props: { ds: MarketDataset }) {
  const rows = useMemo(() => enrichModels(props.ds), [props.ds]);
  const bands = priceBands();
  const [query, setQuery] = useState('');
  const [maker, setMaker] = useState('all');
  const [band, setBand] = useState('all');
  const [body, setBody] = useState('all');
  const [fuel, setFuel] = useState('all');
  const [transmission, setTransmission] = useState('all');
  const [sort, setSort] = useState<SortKey>('start');
  const [cityId, setCityId] = useState('bengaluru');
  const [page, setPage] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  const makers = useMemo(
    () => [...new Set(rows.map((r) => r.makerName))].sort(),
    [rows],
  );
  const bodies = useMemo(() => [...new Set(rows.map((r) => r.model.bodyType))].sort(), [rows]);
  const fuels = useMemo(() => [...new Set(rows.flatMap((r) => r.fuels))].sort(), [rows]);
  const transmissions = useMemo(
    () => [...new Set(rows.flatMap((r) => r.transmissions))].sort(),
    [rows],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = rows.filter((r) => {
      if (q && !`${r.makerName} ${r.model.name}`.toLowerCase().includes(q)) return false;
      if (maker !== 'all' && r.makerName !== maker) return false;
      if (body !== 'all' && r.model.bodyType !== body) return false;
      if (fuel !== 'all' && !r.fuels.includes(fuel as (typeof r.fuels)[number])) return false;
      if (transmission !== 'all' && !r.transmissions.includes(transmission as (typeof r.transmissions)[number]))
        return false;
      if (band !== 'all' && r.startPrice !== null && bandForPrice(r.startPrice) !== Number(band))
        return false;
      return true;
    });
    const cmp: Record<SortKey, (a: ModelRow, b: ModelRow) => number> = {
      start: (a, b) => (a.startPrice ?? 0) - (b.startPrice ?? 0),
      startDesc: (a, b) => (b.startPrice ?? 0) - (a.startPrice ?? 0),
      top: (a, b) => (a.topPrice ?? 0) - (b.topPrice ?? 0),
      topDesc: (a, b) => (b.topPrice ?? 0) - (a.topPrice ?? 0),
      maker: (a, b) => `${a.makerName} ${a.model.name}`.localeCompare(`${b.makerName} ${b.model.name}`),
      name: (a, b) => a.model.name.localeCompare(b.model.name),
    };
    out = [...out].sort(cmp[sort]);
    return out;
  }, [rows, query, maker, band, body, fuel, transmission, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const openRow = openId ? rows.find((r) => r.model.id === openId) ?? null : null;
  const compareRows = rows.filter((r) => compareIds.includes(r.model.id));

  const toggleCompare = (id: string) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= MAX_COMPARE ? prev : [...prev, id],
    );
  };

  const resetPage = (fn: (v: string) => void) => (v: string) => {
    setPage(0);
    fn(v);
  };

  const exportCsv = () =>
    downloadCsv(
      'carscope-models.csv',
      filtered.map((r) => {
        const cheapest = r.variants.reduce((a, b) =>
          a.exShowroomPrice < b.exShowroomPrice ? a : b,
        );
        const dearest = r.variants.reduce((a, b) =>
          a.exShowroomPrice > b.exShowroomPrice ? a : b,
        );
        const maint = maintenanceForModel(r.model.bodyType, r.startPrice, r.fuels);
        const safety = safetyForModel(r.model.id);
        return {
          maker: r.makerName,
          model: r.model.name,
          body_type: r.model.bodyType,
          start_ex_showroom_inr: r.startPrice,
          top_ex_showroom_inr: r.topPrice,
          [`start_onroad_${cityId}_inr`]: onRoadTotal(cheapest.exShowroomPrice, cheapest.fuelType, cityId),
          [`top_onroad_${cityId}_inr`]: onRoadTotal(dearest.exShowroomPrice, dearest.fuelType, cityId),
          annual_maintenance_low_inr: maint.low,
          annual_maintenance_high_inr: maint.high,
          maintenance_segment: maint.label,
          safety_adult_stars: safety?.adultStars ?? '',
          safety_child_stars: safety?.childStars ?? '',
          safety_agency: safety ? agencyLabel(safety.agency) : 'Not tested',
          variants: r.variants.length,
          fuels: r.fuels.join(' / '),
          transmissions: r.transmissions.join(' / '),
          launch_year: r.launchYear ?? '',
          status: r.model.status,
          source: r.model.sourceUrl,
          last_verified: r.model.lastVerifiedAt,
          is_estimate: r.model.isEstimate ? 'yes' : 'no',
        };
      }),
    );

  return (
    <div>
      <PageHeader
        title="Model Explorer"
        sub="Search and filter every currently listed model. Prices are ex-showroom; tap a model for its on-road price in 7 cities, EMI, monthly fuel cost and safety rating."
        right={
          <button
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-40"
          >
            Export CSV ({filtered.length})
          </button>
        }
      />

      <Card className="mb-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          <SearchInput value={query} onChange={resetPage(setQuery)} />
          <FilterSelect label="Maker" value={maker} onChange={resetPage(setMaker)}
            options={[{ value: 'all', label: 'All makers' }, ...makers.map((m) => ({ value: m, label: m }))]} />
          <FilterSelect label="Price band" value={band} onChange={resetPage(setBand)}
            options={[{ value: 'all', label: 'All bands' }, ...bands.map((b) => ({ value: String(b.index), label: b.label }))]} />
          <FilterSelect label="Body type" value={body} onChange={resetPage(setBody)}
            options={[{ value: 'all', label: 'All bodies' }, ...bodies.map((m) => ({ value: m, label: m }))]} />
          <FilterSelect label="Fuel" value={fuel} onChange={resetPage(setFuel)}
            options={[{ value: 'all', label: 'All fuels' }, ...fuels.map((m) => ({ value: m, label: m }))]} />
          <FilterSelect label="Transmission" value={transmission} onChange={resetPage(setTransmission)}
            options={[{ value: 'all', label: 'All' }, ...transmissions.map((m) => ({ value: m, label: m }))]} />
          <FilterSelect label="Sort by" value={sort} onChange={(v) => setSort(v as SortKey)}
            options={[
              { value: 'start', label: 'Starting price: low to high' },
              { value: 'startDesc', label: 'Starting price: high to low' },
              { value: 'top', label: 'Top price: low to high' },
              { value: 'topDesc', label: 'Top price: high to low' },
              { value: 'maker', label: 'Maker' },
              { value: 'name', label: 'Model name' },
            ]} />
          <FilterSelect label="On-road city" value={cityId} onChange={setCityId}
            options={CITIES.map((c) => ({ value: c.id, label: `${c.name} (${c.state})` }))} />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Tick up to {MAX_COMPARE} models to compare them side by side. On-road prices in the
          export and the compare table use the selected city.
        </p>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState title="No models match these filters." hint="Try widening the price band or clearing the search." />
      ) : (
        <Card>
          <div className="mb-2 text-xs text-slate-500">
            {filtered.length} model{filtered.length === 1 ? '' : 's'} - price band filter uses starting price.
            Researched = model confirmed on sale with sourced prices. Estimate = price from an
            auto portal, not the maker's list. Exact price = official manufacturer list price.
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                  <th className="py-2 pr-2">Compare</th>
                  <th className="py-2 pr-2">Maker</th>
                  <th className="py-2 pr-2">Model</th>
                  <th className="hidden py-2 pr-2 lg:table-cell">Body</th>
                  <th className="py-2 pr-2 text-right">Starts at</th>
                  <th className="hidden py-2 pr-2 text-right md:table-cell">Tops at</th>
                  <th className="hidden py-2 pr-2 text-right md:table-cell">Variants</th>
                  <th className="hidden py-2 pr-2 lg:table-cell">Fuel</th>
                  <th className="py-2 pr-2">Data</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((r) => (
                  <tr
                    key={r.model.id}
                    className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
                    onClick={() => setOpenId(r.model.id)}
                  >
                    <td className="py-2 pr-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        aria-label={`Compare ${r.makerName} ${r.model.name}`}
                        checked={compareIds.includes(r.model.id)}
                        disabled={!compareIds.includes(r.model.id) && compareIds.length >= MAX_COMPARE}
                        onChange={() => toggleCompare(r.model.id)}
                        className="h-4 w-4 accent-slate-900"
                      />
                    </td>
                    <td className="py-2 pr-2 text-slate-600">{r.makerName}</td>
                    <td className="py-2 pr-2 font-medium text-slate-900">{r.model.name}</td>
                    <td className="hidden py-2 pr-2 text-slate-600 lg:table-cell">{r.model.bodyType}</td>
                    <td className="py-2 pr-2 text-right font-medium text-slate-900">
                      {r.startPrice ? inrLakh(r.startPrice) : '—'}
                    </td>
                    <td className="hidden py-2 pr-2 text-right text-slate-600 md:table-cell">
                      {r.topPrice ? inrLakh(r.topPrice) : '—'}
                    </td>
                    <td className="hidden py-2 pr-2 text-right text-slate-600 md:table-cell">{r.variants.length}</td>
                    <td className="hidden py-2 pr-2 text-slate-600 lg:table-cell">{r.fuels.join(', ')}</td>
                    <td className="py-2 pr-2">
                      {r.model.isEstimate ? <Badge tone="amber">Estimate</Badge> : <Badge tone="green">Exact price</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg bg-slate-100 px-3 py-1 font-medium text-slate-700 disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-xs text-slate-500">
              Page {page + 1} of {pageCount}
            </span>
            <button
              disabled={page >= pageCount - 1}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg bg-slate-100 px-3 py-1 font-medium text-slate-700 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </Card>
      )}

      {compareIds.length > 0 && (
        <div className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl">
          <span>
            {compareIds.length} model{compareIds.length === 1 ? '' : 's'} selected
            {compareIds.length < 2 ? ' - pick at least 2 to compare' : ''}
          </span>
          <button
            onClick={() => setShowCompare(true)}
            disabled={compareIds.length < 2}
            className="rounded-lg bg-white px-3 py-1 font-medium text-slate-900 disabled:opacity-40"
          >
            Compare
          </button>
          <button
            onClick={() => setCompareIds([])}
            className="rounded-lg px-3 py-1 font-medium text-slate-300 hover:text-white"
          >
            Clear
          </button>
        </div>
      )}

      {openRow && (
        <ModelModal
          row={openRow}
          ds={props.ds}
          cityId={cityId}
          onCityChange={setCityId}
          onClose={() => setOpenId(null)}
        />
      )}
      {showCompare && compareRows.length >= 2 && (
        <CompareModal
          rows={compareRows}
          ds={props.ds}
          cityId={cityId}
          onClose={() => setShowCompare(false)}
        />
      )}
    </div>
  );
}
