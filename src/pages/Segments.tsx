import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { MarketDataset } from '../data/provider';
import type { ModelRow } from '../lib/enrich';
import { enrichModels } from '../lib/enrich';
import {
  average,
  bandForPrice,
  median,
  modelBands,
  priceBands,
  type CountingMode,
} from '../lib/bands';
import { inrLakh } from '../lib/format';
import { Card, CountingModeToggle, EmptyState, FilterSelect, PageHeader } from '../components/ui';

interface BandStats {
  bandIndex: number;
  models: ModelRow[];
  variantCount: number;
  makers: number;
  topMakers: string;
  avgStart: number | null;
  medianStart: number | null;
  avgVariant: number | null;
  medianVariant: number | null;
}

export function Segments(props: { ds: MarketDataset }) {
  const rows = useMemo(() => enrichModels(props.ds), [props.ds]);
  const bands = priceBands();
  const [mode, setMode] = useState<CountingMode>('start');
  const [focusBand, setFocusBand] = useState('2'); // 10-15L default

  const stats: BandStats[] = useMemo(() => {
    const makerName = (r: ModelRow) => r.makerName;
    return bands.map((_, i) => {
      let models: ModelRow[];
      let variantPrices: number[];
      if (mode === 'start') {
        models = rows.filter((r) => modelBands(r.model, r.variants, 'start')[0] === i);
        variantPrices = models.flatMap((r) => r.variants.map((v) => v.exShowroomPrice));
      } else {
        models = rows.filter((r) => modelBands(r.model, r.variants, 'overlap').includes(i));
        variantPrices = rows.flatMap((r) =>
          r.variants.filter((v) => bandForPrice(v.exShowroomPrice) === i).map((v) => v.exShowroomPrice),
        );
      }
      const starts = models.map((r) => r.startPrice as number);
      const perMaker = new Map<string, number>();
      for (const r of models) perMaker.set(makerName(r), (perMaker.get(makerName(r)) ?? 0) + 1);
      const topMakers = [...perMaker.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([n, c]) => `${n} (${c})`)
        .join(', ');
      return {
        bandIndex: i,
        models,
        variantCount: variantPrices.length,
        makers: perMaker.size,
        topMakers: topMakers || '—',
        avgStart: average(starts),
        medianStart: median(starts),
        avgVariant: average(variantPrices),
        medianVariant: median(variantPrices),
      };
    });
  }, [rows, bands, mode]);

  const chartData = stats.map((s) => ({
    name: bands[s.bandIndex].shortLabel,
    Models: s.models.length,
    Variants: s.variantCount,
  }));

  const focus = stats[Number(focusBand)];
  const focusBody = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of focus.models) m.set(r.model.bodyType, (m.get(r.model.bodyType) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [focus]);
  const focusFuel = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of focus.models)
      for (const f of r.fuels) m.set(f, (m.get(f) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [focus]);

  const total = (xs: [string, number][]) => xs.reduce((n, [, c]) => n + c, 0);

  return (
    <div>
      <PageHeader
        title="Price Segment Analysis"
        sub="₹5 lakh bands from ₹0 to ₹70L+. All prices are ex-showroom; bands are lower-inclusive, upper-exclusive, except the final ₹70L+ band."
      />
      <div className="mb-4">
        <CountingModeToggle mode={mode} onChange={setMode} />
      </div>

      <Card title="Models and variants per band" className="mb-4">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={1} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="Models" fill="#0f766e" />
            <Bar dataKey="Variants" fill="#93c5fd" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Segment detail" className="mb-4">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                <th className="py-2 pr-2">Band</th>
                <th className="py-2 pr-2 text-right">Models</th>
                <th className="py-2 pr-2 text-right">Variants</th>
                <th className="py-2 pr-2 text-right">Makers</th>
                <th className="py-2 pr-2">Top makers</th>
                <th className="py-2 pr-2 text-right">Avg start</th>
                <th className="py-2 pr-2 text-right">Median start</th>
                <th className="py-2 pr-2 text-right">Avg variant</th>
                <th className="py-2 pr-2 text-right">Median variant</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s) => (
                <tr key={s.bandIndex} className="border-b border-slate-100">
                  <td className="py-2 pr-2 font-medium text-slate-900">{bands[s.bandIndex].label}</td>
                  <td className="py-2 pr-2 text-right">{s.models.length}</td>
                  <td className="py-2 pr-2 text-right">{s.variantCount}</td>
                  <td className="py-2 pr-2 text-right">{s.makers}</td>
                  <td className="py-2 pr-2 text-slate-600">{s.topMakers}</td>
                  <td className="py-2 pr-2 text-right">{s.avgStart ? inrLakh(s.avgStart) : '—'}</td>
                  <td className="py-2 pr-2 text-right">{s.medianStart ? inrLakh(s.medianStart) : '—'}</td>
                  <td className="py-2 pr-2 text-right">{s.avgVariant ? inrLakh(s.avgVariant) : '—'}</td>
                  <td className="py-2 pr-2 text-right">{s.medianVariant ? inrLakh(s.medianVariant) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {mode === 'start'
            ? 'Starting-price mode: a band lists the models whose lowest variant price falls in it, and all of their variants.'
            : 'Variant-overlap mode: a band lists every model with at least one variant priced in it, and only those variants.'}
        </p>
      </Card>

      <Card title="Inside a band">
        <div className="mb-3 max-w-xs">
          <FilterSelect
            label="Band"
            value={focusBand}
            onChange={setFocusBand}
            options={bands.map((b) => ({ value: String(b.index), label: b.label }))}
          />
        </div>
        {focus.models.length === 0 ? (
          <EmptyState title="No models in this band." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-900">
                Body types ({total(focusBody)} model{total(focusBody) === 1 ? '' : 's'})
              </h3>
              <ul className="space-y-1 text-sm">
                {focusBody.map(([name, c]) => (
                  <li key={name} className="flex justify-between border-b border-slate-100 py-1">
                    <span className="text-slate-600">{name}</span>
                    <span className="font-medium text-slate-900">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-900">Fuel types</h3>
              <p className="mb-2 text-xs text-slate-500">
                A model offering two fuels is counted under both.
              </p>
              <ul className="space-y-1 text-sm">
                {focusFuel.map(([name, c]) => (
                  <li key={name} className="flex justify-between border-b border-slate-100 py-1">
                    <span className="text-slate-600">{name}</span>
                    <span className="font-medium text-slate-900">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
