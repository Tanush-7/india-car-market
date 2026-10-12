import { useMemo, useState, type CSSProperties } from 'react';
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
import { average, bandForPrice, modelBands, priceBands } from '../lib/bands';
import { inrLakh } from '../lib/format';
import { enrichModels } from '../lib/enrich';
import { Card, PageHeader } from '../components/ui';

type CellMode = 'models' | 'variants';

export function Makers(props: { ds: MarketDataset }) {
  const rows = useMemo(() => enrichModels(props.ds), [props.ds]);
  const bands = priceBands();
  const [cellMode, setCellMode] = useState<CellMode>('models');

  const makers = useMemo(
    () => [...new Set(rows.map((r) => r.makerName))].sort(),
    [rows],
  );

  // Overlap semantics: a model appears in every band holding one of its variants.
  const matrix = useMemo(() => {
    const grid = new Map<string, number[]>();
    for (const maker of makers) grid.set(maker, new Array(bands.length).fill(0));
    for (const r of rows) {
      const cells = grid.get(r.makerName)!;
      if (cellMode === 'models') {
        for (const b of modelBands(r.model, r.variants, 'overlap')) cells[b] += 1;
      } else {
        for (const v of r.variants) cells[bandForPrice(v.exShowroomPrice)] += 1;
      }
    }
    return grid;
  }, [rows, makers, bands, cellMode]);

  const maxCell = useMemo(
    () => Math.max(1, ...[...matrix.values()].flat()),
    [matrix],
  );

  const ranked = useMemo(
    () =>
      makers
        .map((m) => ({
          name: m,
          models: rows.filter((r) => r.makerName === m).length,
          variants: rows.filter((r) => r.makerName === m).reduce((n, r) => n + r.variants.length, 0),
        }))
        .sort((a, b) => b.models - a.models),
    [makers, rows],
  );

  const avgStart = useMemo(
    () =>
      makers
        .map((m) => {
          const starts = rows
            .filter((r) => r.makerName === m)
            .map((r) => r.startPrice as number);
          return { name: m, avg: average(starts) ?? 0 };
        })
        .sort((a, b) => a.avg - b.avg),
    [makers, rows],
  );

  const cellStyle = (v: number): CSSProperties =>
    v === 0 ? {} : { backgroundColor: `rgba(15, 118, 110, ${0.15 + (v / maxCell) * 0.85})` };

  return (
    <div>
      <PageHeader
        title="Makers vs Price Segments"
        sub="Which manufacturers compete in each ₹5L band. A model is shown in every band that contains at least one of its variants."
      />
      <div className="mb-4 flex gap-2">
        {(
          [
            ['models', 'Distinct models'],
            ['variants', 'Variants'],
          ] as [CellMode, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setCellMode(id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              cellMode === id ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border border-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <Card title="Maker x price-band heatmap" sub={`Cell value: ${cellMode === 'models' ? 'distinct models' : 'variants'}`} className="mb-4">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-xs">
            <thead>
              <tr>
                <th className="sticky left-0 bg-white p-2 text-left">Maker</th>
                {bands.map((b) => (
                  <th key={b.index} className="p-2 text-center font-medium text-slate-500">
                    {b.shortLabel}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {makers.map((m) => (
                <tr key={m} className="border-t border-slate-100">
                  <td className="sticky left-0 bg-white p-2 font-medium text-slate-900">{m}</td>
                  {matrix.get(m)!.map((v, i) => (
                    <td
                      key={i}
                      style={cellStyle(v)}
                      className={`p-2 text-center ${v > 0 ? 'text-white font-semibold' : 'text-slate-300'}`}
                    >
                      {v === 0 ? '·' : v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Makers ranked by model count" sub="Distinct active models">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ranked} layout="vertical" margin={{ top: 5, right: 5, left: 40, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
              <Tooltip />
              <Bar dataKey="models" fill="#1d4ed8" name="Models" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Average starting price by maker" sub="Ex-showroom, across the maker's active models">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={avgStart} layout="vertical" margin={{ top: 5, right: 5, left: 40, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                tick={{ fontSize: 11 }}
                tickFormatter={(v: number) => inrLakh(v, 0)}
              />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
              <Tooltip formatter={(v) => (typeof v === 'number' ? inrLakh(v) : v)} />
              <Bar dataKey="avg" fill="#b45309" name="Avg starting price" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
