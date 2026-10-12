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
import { inr, inrLakh } from '../lib/format';
import { enrichModels } from '../lib/enrich';
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
    const makers = new Set(rows.map((r) => r.makerName)).size;
    const variantCount = rows.reduce((n, r) => n + r.variants.length, 0);
    return { avg, cheapest, priciest, makers, variantCount };
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
          sub="Ex-showroom, across active models"
        />
        <StatCard
          label="Cheapest model"
          value={stats.cheapest.startPrice ? inrLakh(stats.cheapest.startPrice) : '—'}
          sub={`${stats.cheapest.makerName} ${stats.cheapest.model.name}`}
        />
        <StatCard
          label="Most expensive"
          value={stats.priciest.topPrice ? inr(stats.priciest.topPrice) : '—'}
          sub={`${stats.priciest.makerName} ${stats.priciest.model.name} (top variant)`}
        />
        <StatCard
          label="Cheapest band"
          value={bandFor(stats.cheapest.startPrice)}
          sub="Starting-price mode"
        />
        <StatCard
          label="Priciest band"
          value={bandFor(stats.priciest.topPrice)}
          sub="Top variant, starting-price mode"
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
      </div>
    </div>
  );
}
