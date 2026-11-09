import { useMemo, useState } from 'react';
import type { MarketDataset } from '../data/provider';
import type { ModelRow } from '../lib/enrich';
import { enrichModels } from '../lib/enrich';
import { bandForPrice, priceBands } from '../lib/bands';
import { downloadCsv } from '../lib/csv';
import { fmtDate, inr, inrLakh } from '../lib/format';
import { onRoadBreakdown, onRoadTotal, ONROAD_UPDATED_AT } from '../data/onRoad';
import { maintenanceForModel } from '../data/maintenance';
import {
  Badge,
  Card,
  EmptyState,
  FilterSelect,
  PageHeader,
  SearchInput,
} from '../components/ui';

const PAGE_SIZE = 15;

type SortKey = 'start' | 'startDesc' | 'top' | 'topDesc' | 'maker' | 'name';

function ModelModal(props: { row: ModelRow; ds: MarketDataset; onClose: () => void }) {
  const { row } = props;
  const history = props.ds.priceHistory.filter((h) =>
    row.variants.some((v) => v.id === h.variantId),
  );
  const cheapest = row.variants.reduce((a, b) => (a.exShowroomPrice < b.exShowroomPrice ? a : b));
  const onRoad = onRoadBreakdown(cheapest.exShowroomPrice, cheapest.fuelType);
  const maint = maintenanceForModel(row.model.bodyType, row.startPrice, row.fuels);
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

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                <th className="py-2 pr-2">Variant</th>
                <th className="hidden py-2 pr-2 sm:table-cell">Fuel</th>
                <th className="hidden py-2 pr-2 sm:table-cell">Transmission</th>
                <th className="py-2 text-right">Ex-showroom</th>
                <th className="py-2 text-right">On-road, Bengaluru (est.)</th>
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
                  <td className="py-2 text-right text-slate-900">{inr(onRoadTotal(v.exShowroomPrice, v.fuelType))}</td>
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
            Bengaluru on-road breakdown - {cheapest.name} (cheapest variant), updated{' '}
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
            * Insurance is an estimate (~3.5% of ex-showroom); get a dealer quote. Karnataka
            road-tax slabs, 11% cess on the tax and Rs 1,000 road-safety tax per the state
            rules in force from 1 Apr 2026. Hypothecation (Rs 1,500, only if financed) and
            dealer handling charges are not included. Every variant's on-road total is in
            the table above.
          </p>
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

        {history.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-slate-900">Recorded price changes</h3>
            <ul className="mt-1 space-y-1 text-xs text-slate-600">
              {history
                .slice()
                .sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate))
                .map((h) => (
                  <li key={h.id}>
                    {fmtDate(h.effectiveDate)}: {inr(h.exShowroomPrice)} ex-showroom
                    {h.isEstimate ? ' (estimate)' : ''}
                    {h.notes ? ` - ${h.notes}` : ''}
                  </li>
                ))}
            </ul>
          </div>
        )}
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
  const [page, setPage] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);

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
        return {
          maker: r.makerName,
          model: r.model.name,
          body_type: r.model.bodyType,
          start_ex_showroom_inr: r.startPrice,
          top_ex_showroom_inr: r.topPrice,
          start_onroad_bengaluru_inr: onRoadTotal(cheapest.exShowroomPrice, cheapest.fuelType),
          top_onroad_bengaluru_inr: onRoadTotal(dearest.exShowroomPrice, dearest.fuelType),
          annual_maintenance_low_inr: maint.low,
          annual_maintenance_high_inr: maint.high,
          maintenance_segment: maint.label,
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
        sub="Search and filter every currently listed model. Prices are ex-showroom; tap a model for its Bengaluru on-road price and maintenance estimate."
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
        </div>
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

      {openRow && <ModelModal row={openRow} ds={props.ds} onClose={() => setOpenId(null)} />}
    </div>
  );
}
