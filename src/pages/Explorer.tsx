import { useMemo, useState } from 'react';
import type { MarketDataset } from '../data/provider';
import type { ModelRow } from '../lib/enrich';
import { enrichModels } from '../lib/enrich';
import { bandForPrice, priceBands } from '../lib/bands';
import { downloadCsv } from '../lib/csv';
import { fmtDate, inr, inrLakh } from '../lib/format';
import {
  Badge,
  Card,
  EmptyState,
  FilterSelect,
  PageHeader,
  SearchInput,
} from '../components/ui';

const PAGE_SIZE = 15;

type SortKey = 'start' | 'top' | 'maker' | 'name';

function ModelModal(props: { row: ModelRow; ds: MarketDataset; onClose: () => void }) {
  const { row } = props;
  const history = props.ds.priceHistory.filter((h) =>
    row.variants.some((v) => v.id === h.variantId),
  );
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
                <th className="py-2 pr-2">Fuel</th>
                <th className="py-2 pr-2">Transmission</th>
                <th className="py-2 text-right">Ex-showroom</th>
                <th className="py-2 text-right">Data</th>
              </tr>
            </thead>
            <tbody>
              {row.variants.map((v) => (
                <tr key={v.id} className="border-b border-slate-100">
                  <td className="py-2 pr-2 font-medium text-slate-900">{v.name}</td>
                  <td className="py-2 pr-2 text-slate-600">{v.fuelType}</td>
                  <td className="py-2 pr-2 text-slate-600">{v.transmission}</td>
                  <td className="py-2 text-right text-slate-900">{inr(v.exShowroomPrice)}</td>
                  <td className="py-2 text-right">
                    {v.isEstimate ? (
                      <Badge tone="amber">Estimate</Badge>
                    ) : (
                      <Badge tone="green">Verified</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 grid gap-3 text-xs text-slate-600 sm:grid-cols-2">
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="font-medium text-slate-700">Source and verification</div>
            <div className="mt-1">
              Source: {row.model.sourceUrl === 'sample' ? 'Sample dataset' : row.model.sourceUrl}
            </div>
            <div>Last verified: {fmtDate(row.model.lastVerifiedAt)}</div>
            <div>
              Price basis: {row.model.isEstimate ? 'estimates, not published prices' : 'published ex-showroom prices'}
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
      top: (a, b) => (a.topPrice ?? 0) - (b.topPrice ?? 0),
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
      filtered.map((r) => ({
        maker: r.makerName,
        model: r.model.name,
        body_type: r.model.bodyType,
        start_ex_showroom_inr: r.startPrice,
        top_ex_showroom_inr: r.topPrice,
        variants: r.variants.length,
        fuels: r.fuels.join(' / '),
        transmissions: r.transmissions.join(' / '),
        launch_year: r.launchYear ?? '',
        status: r.model.status,
        source: r.model.sourceUrl,
        last_verified: r.model.lastVerifiedAt,
        is_estimate: r.model.isEstimate ? 'yes' : 'no',
      })),
    );

  return (
    <div>
      <PageHeader
        title="Model Explorer"
        sub="Search and filter every currently listed model. Prices are ex-showroom."
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
              { value: 'start', label: 'Starting price' },
              { value: 'top', label: 'Top price' },
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
            {filtered.length} model{filtered.length === 1 ? '' : 's'} - price band filter uses starting price
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                  <th className="py-2 pr-2">Maker</th>
                  <th className="py-2 pr-2">Model</th>
                  <th className="py-2 pr-2">Body</th>
                  <th className="py-2 pr-2 text-right">Starts at</th>
                  <th className="py-2 pr-2 text-right">Tops at</th>
                  <th className="py-2 pr-2 text-right">Variants</th>
                  <th className="py-2 pr-2">Fuel</th>
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
                    <td className="py-2 pr-2 text-slate-600">{r.model.bodyType}</td>
                    <td className="py-2 pr-2 text-right font-medium text-slate-900">
                      {r.startPrice ? inrLakh(r.startPrice) : '—'}
                    </td>
                    <td className="py-2 pr-2 text-right text-slate-600">
                      {r.topPrice ? inrLakh(r.topPrice) : '—'}
                    </td>
                    <td className="py-2 pr-2 text-right text-slate-600">{r.variants.length}</td>
                    <td className="py-2 pr-2 text-slate-600">{r.fuels.join(', ')}</td>
                    <td className="py-2 pr-2">
                      {r.model.isEstimate ? <Badge tone="amber">Estimate</Badge> : <Badge tone="green">Verified</Badge>}
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
