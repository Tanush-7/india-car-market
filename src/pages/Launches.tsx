import { useMemo, useState } from 'react';
import type { MarketDataset } from '../data/provider';
import { bandForPrice, priceBands } from '../lib/bands';
import { discontinuedRows, enrichModels } from '../lib/enrich';
import { fmtDate, inrLakh } from '../lib/format';
import { Badge, Card, EmptyState, FilterSelect, PageHeader } from '../components/ui';

export function Launches(props: { ds: MarketDataset }) {
  const bands = priceBands();
  const [year, setYear] = useState('all');
  const [maker, setMaker] = useState('all');
  const [body, setBody] = useState('all');
  const [band, setBand] = useState('all');

  const modelById = useMemo(() => new Map(props.ds.models.map((m) => [m.id, m])), [props.ds]);
  const makerName = useMemo(
    () => new Map(props.ds.makers.map((m) => [m.id, m.name])),
    [props.ds],
  );

  const years = useMemo(
    () => [...new Set(props.ds.launches.map((l) => l.launchDate.slice(0, 4)))].sort().reverse(),
    [props.ds],
  );
  const makers = useMemo(
    () =>
      [...new Set(props.ds.launches.map((l) => makerName.get(modelById.get(l.modelId)?.makerId ?? '') ?? ''))]
        .filter(Boolean)
        .sort(),
    [props.ds, modelById, makerName],
  );
  const bodies = useMemo(
    () =>
      [...new Set(props.ds.launches.map((l) => modelById.get(l.modelId)?.bodyType ?? ''))]
        .filter(Boolean)
        .sort(),
    [props.ds, modelById],
  );

  const filtered = useMemo(() => {
    return props.ds.launches
      .filter((l) => {
        const model = modelById.get(l.modelId);
        if (!model) return false;
        if (year !== 'all' && !l.launchDate.startsWith(year)) return false;
        if (maker !== 'all' && makerName.get(model.makerId) !== maker) return false;
        if (body !== 'all' && model.bodyType !== body) return false;
        if (band !== 'all' && l.launchPrice !== undefined && bandForPrice(l.launchPrice) !== Number(band))
          return false;
        return true;
      })
      .sort((a, b) => b.launchDate.localeCompare(a.launchDate));
  }, [props.ds, modelById, makerName, year, maker, body, band]);

  const byYear = useMemo(() => {
    const groups = new Map<string, typeof filtered>();
    for (const l of filtered) {
      const y = l.launchDate.slice(0, 4);
      if (!groups.has(y)) groups.set(y, []);
      groups.get(y)!.push(l);
    }
    return [...groups.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const discontinued = useMemo(() => discontinuedRows(props.ds), [props.ds]);
  const activeRows = useMemo(() => enrichModels(props.ds), [props.ds]);
  const launchesByYear = useMemo(() => {
    const m = new Map<string, number>();
    for (const l of props.ds.launches) {
      const y = l.launchDate.slice(0, 4);
      m.set(y, (m.get(y) ?? 0) + 1);
    }
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [props.ds]);

  return (
    <div>
      <PageHeader
        title="Launch History"
        sub="New nameplates, new generations, major facelifts and EV derivatives from October 2023 to October 2026. Ordinary variant additions are not launches and are tracked under price history instead."
      />

      <Card title="Launches by year" sub="Across all manufacturers" className="mb-4">
        <div className="flex flex-wrap gap-3">
          {launchesByYear.map(([y, c]) => (
            <div key={y} className="rounded-lg bg-slate-50 px-4 py-2 text-center">
              <div className="text-xl font-bold text-slate-900">{c}</div>
              <div className="text-xs text-slate-500">{y}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mb-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <FilterSelect label="Year" value={year} onChange={setYear}
            options={[{ value: 'all', label: 'All years' }, ...years.map((y) => ({ value: y, label: y }))]} />
          <FilterSelect label="Maker" value={maker} onChange={setMaker}
            options={[{ value: 'all', label: 'All makers' }, ...makers.map((m) => ({ value: m, label: m }))]} />
          <FilterSelect label="Body type" value={body} onChange={setBody}
            options={[{ value: 'all', label: 'All bodies' }, ...bodies.map((b) => ({ value: b, label: b }))]} />
          <FilterSelect label="Launch-price band" value={band} onChange={setBand}
            options={[{ value: 'all', label: 'All bands' }, ...bands.map((b) => ({ value: String(b.index), label: b.label }))]} />
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState title="No launches match these filters." />
      ) : (
        <div className="space-y-4">
          {byYear.map(([y, items]) => (
            <Card key={y} title={y} sub={`${items.length} launch${items.length === 1 ? '' : 'es'}`}>
              <ul className="divide-y divide-slate-100">
                {items.map((l) => {
                  const model = modelById.get(l.modelId)!;
                  return (
                    <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                      <div>
                        <span className="font-medium text-slate-900">
                          {makerName.get(model.makerId)} {model.name}
                        </span>
                        <span className="ml-2 text-sm text-slate-500">{fmtDate(l.launchDate)}</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <Badge tone="blue">{l.launchType}</Badge>
                          <Badge>{model.bodyType}</Badge>
                          {l.isEstimate && <Badge tone="amber">Estimate</Badge>}
                        </div>
                      </div>
                      <div className="text-sm text-slate-600">
                        {l.launchPrice ? `Launch price ${inrLakh(l.launchPrice)} ex-showroom` : 'Launch price n/a'}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>
          ))}
        </div>
      )}

      <Card title="Discontinued models" sub="Kept separate from the on-sale inventory" className="mt-4">
        {discontinued.length === 0 ? (
          <EmptyState title="No discontinued models recorded." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                  <th className="py-2 pr-2">Maker</th>
                  <th className="py-2 pr-2">Model</th>
                  <th className="py-2 pr-2">Body</th>
                  <th className="py-2 pr-2 text-right">Was priced from</th>
                  <th className="py-2 pr-2">Competing now</th>
                </tr>
              </thead>
              <tbody>
                {discontinued.map((r) => {
                  const rivalBand =
                    r.startPrice !== null ? bands[bandForPrice(r.startPrice)].label : null;
                  const rivals = activeRows.filter(
                    (a) =>
                      a.model.bodyType === r.model.bodyType &&
                      r.startPrice !== null &&
                      a.startPrice !== null &&
                      bands[bandForPrice(a.startPrice)].label === rivalBand,
                  ).length;
                  return (
                    <tr key={r.model.id} className="border-b border-slate-100">
                      <td className="py-2 pr-2 text-slate-600">{r.makerName}</td>
                      <td className="py-2 pr-2 font-medium text-slate-900">{r.model.name}</td>
                      <td className="py-2 pr-2 text-slate-600">{r.model.bodyType}</td>
                      <td className="py-2 pr-2 text-right text-slate-600">
                        {r.startPrice ? inrLakh(r.startPrice) : '—'}
                      </td>
                      <td className="py-2 pr-2 text-slate-600">
                        {rivalBand ? `${rivals} active ${r.model.bodyType.toLowerCase()}s in ${rivalBand}` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
