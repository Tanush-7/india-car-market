import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { MarketDataset } from '../data/provider';
import { average, bandForPrice, modelBands, priceBands } from '../lib/bands';
import { inr, inrLakh, fmtDate } from '../lib/format';
import { enrichModels } from '../lib/enrich';
import {
  MAINTENANCE_SOURCE_URL,
  MAINTENANCE_UPDATED_AT,
  maintenanceForModel,
  maintenanceMidpoint,
} from '../data/maintenance';
import { Card, PageHeader, StatCard } from '../components/ui';

const PIE_COLORS = ['#0f766e', '#1d4ed8', '#b45309', '#be123c', '#6d28d9', '#0e7490', '#4d7c0f', '#9a3412'];

export function Dashboard(props: { ds: MarketDataset }) {
  const rows = useMemo(() => enrichModels(props.ds), [props.ds]);
  const bands = priceBands();

  const stats = useMemo(() => {
    const starts = rows.map((r) => r.startPrice as number);
    const avg = average(starts);
    const cheapest = rows.reduce((a, b) => (a.startPrice! < b.startPrice! ? a : b));
    const priciest = rows.reduce((a, b) => (a.topPrice! > b.topPrice! ? a : b));
    // Priciest band is computed from starting prices, like the cheapest band:
    // using the top-variant price here contradicted the "starting-price mode" label.
    const priciestStart = rows.reduce((a, b) => (a.startPrice! > b.startPrice! ? a : b));
    const makers = new Set(rows.map((r) => r.makerName)).size;
    const variantCount = rows.reduce((n, r) => n + r.variants.length, 0);
    return { avg, cheapest, priciest, priciestStart, makers, variantCount };
  }, [rows]);

  const perBand = useMemo(
    () =>
      bands.map((b, i) => ({
        name: b.shortLabel,
        models: rows.filter((r) => modelBands(r.model, r.variants, 'start')[0] === i).length,
      })),
    [rows, bands],
  );

  const byMaker = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of rows) m.set(r.makerName, (m.get(r.makerName) ?? 0) + 1);
    return [...m.entries()]
      .map(([name, models]) => ({ name, models }))
      .sort((a, b) => b.models - a.models);
  }, [rows]);

  const fuelDist = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of rows) for (const f of r.fuels) m.set(f, (m.get(f) ?? 0) + 1);
    return [...m.entries()].map(([name, value]) => ({ name, value }));
  }, [rows]);

  const bodyDist = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of rows) m.set(r.model.bodyType, (m.get(r.model.bodyType) ?? 0) + 1);
    return [...m.entries()].map(([name, value]) => ({ name, value }));
  }, [rows]);

  // Typical annual maintenance by maker: mean of each active model's
  // segment-midpoint estimate. Estimates only - see the note under the chart.
  const maintenanceByMaker = useMemo(() => {
    const m = new Map<string, number[]>();
    for (const r of rows) {
      const seg = maintenanceForModel(r.model.bodyType, r.startPrice, r.fuels);
      const list = m.get(r.makerName) ?? [];
      list.push(maintenanceMidpoint(seg));
      m.set(r.makerName, list);
    }
    return [...m.entries()]
      .map(([name, xs]) => ({
        name,
        avg: Math.round(xs.reduce((a, b) => a + b, 0) / xs.length),
        models: xs.length,
      }))
      .sort((a, b) => a.avg - b.avg);
  }, [rows]);

  const bandFor = (price: number | null) =>
    price === null ? '—' : bands[bandForPrice(price)].label;

  return (
    <div>
      <PageHeader
        title="Market Dashboard"
        sub="Every figure on this page is computed from the underlying model and variant records. Nothing here is hardcoded."
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Active models" value={String(rows.length)} sub="Distinct nameplates on sale" />
        <StatCard label="Manufacturers" value={String(stats.makers)} sub="With at least one active model" />
        <StatCard label="Listed variants" value={String(stats.variantCount)} sub="Available variants" />
        <StatCard
          label="Avg starting price"
          value={stats.avg ? inrLakh(stats.avg) : '—'}
          sub="Ex-showroom, across the included active models"
        />
        <StatCard
          label="Cheapest model"
          value={stats.cheapest.startPrice ? inrLakh(stats.cheapest.startPrice) : '—'}
          sub={`${stats.cheapest.makerName} ${stats.cheapest.model.name} - lowest starting price among included models`}
        />
        <StatCard
          label="Most expensive"
          value={stats.priciest.topPrice ? inr(stats.priciest.topPrice) : '—'}
          sub={`${stats.priciest.makerName} ${stats.priciest.model.name} (top variant) - highest variant price among included models`}
        />
        <StatCard
          label="Cheapest band"
          value={bandFor(stats.cheapest.startPrice)}
          sub="Starting-price mode"
        />
        <StatCard
          label="Priciest band"
          value={bandFor(stats.priciestStart.startPrice)}
          sub={`Starting-price mode (${stats.priciestStart.makerName} ${stats.priciestStart.model.name} starts highest)`}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Models by starting-price segment" sub="₹5L bands, starting-price mode">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={perBand} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={1} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="models" fill="#0f766e" name="Models" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Models by manufacturer" sub="Distinct active models">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byMaker} layout="vertical" margin={{ top: 5, right: 5, left: 40, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
              <Tooltip />
              <Bar dataKey="models" fill="#1d4ed8" name="Models" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card
          title="Fuel-type distribution"
          sub="Models offering each fuel (a model with petrol and diesel counts in both)"
        >
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={fuelDist} dataKey="value" nameKey="name" outerRadius={100} label>
                {fuelDist.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Body-type distribution" sub="Distinct active models">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={bodyDist} dataKey="value" nameKey="name" outerRadius={100} label>
                {bodyDist.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[(i + 3) % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card
          title="Typical annual maintenance by maker (estimate)"
          sub="Mean of each maker's models' segment-midpoint estimates, per year"
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={maintenanceByMaker} layout="vertical" margin={{ top: 5, right: 5, left: 40, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                tick={{ fontSize: 11 }}
                tickFormatter={(v: number) => `₹${Math.round(v / 1000)}k`}
              />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
              <Tooltip
                formatter={(v, _name, item) => [
                  typeof v === 'number' ? inr(v) : v,
                  `Avg / year (${(item?.payload as { models: number } | undefined)?.models ?? ''} models)`,
                ]}
              />
              <Bar dataKey="avg" fill="#0e7490" name="Avg annual maintenance" />
            </BarChart>
          </ResponsiveContainer>
          <p className="mt-2 text-xs text-slate-500">
            Approximate estimates, not quotes. Segment averages (scheduled service plus a
            yearly wear-and-tear reserve; fuel, insurance and depreciation excluded) from{' '}
            <a className="underline" href={MAINTENANCE_SOURCE_URL} target="_blank" rel="noreferrer">
              motomotar.com 2026 guide
            </a>
            , updated {fmtDate(MAINTENANCE_UPDATED_AT)}. A maker's figure is the mean of its
            models' segment midpoints, so a maker with more large SUVs reads higher. Per-model
            ranges are in the Model Explorer.
          </p>
        </Card>
      </div>
    </div>
  );
}
