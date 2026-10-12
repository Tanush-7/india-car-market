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
import { modelBands, priceBands } from '../lib/bands';
import { enrichModels } from '../lib/enrich';
import { Badge, Card, FilterSelect, PageHeader } from '../components/ui';

const STACK_COLORS = ['#0f766e', '#1d4ed8', '#b45309', '#be123c', '#6d28d9', '#0e7490', '#4d7c0f', '#9a3412'];

type Tab = 'body' | 'fuel';

export function BodyFuel(props: { ds: MarketDataset }) {
  const rows = useMemo(() => enrichModels(props.ds), [props.ds]);
  const bands = priceBands();
  const [tab, setTab] = useState<Tab>('body');
  const [maker, setMaker] = useState('all');
  const [fuelFilter, setFuelFilter] = useState('all');

  const makers = useMemo(() => [...new Set(rows.map((r) => r.makerName))].sort(), [rows]);
  const fuels = useMemo(() => [...new Set(rows.flatMap((r) => r.fuels))].sort(), [rows]);
  const bodies = useMemo(() => [...new Set(rows.map((r) => r.model.bodyType))].sort(), [rows]);

  const scoped = useMemo(
    () =>
      rows.filter((r) => {
        if (maker !== 'all' && r.makerName !== maker) return false;
        if (tab === 'body' && fuelFilter !== 'all' && !r.fuels.includes(fuelFilter as (typeof r.fuels)[number]))
          return false;
        return true;
      }),
    [rows, maker, fuelFilter, tab],
  );

  // Starting-price mode: each model counted once per band, stacked by category.
  // Fuel view: a model offering petrol and diesel appears in both stacks.
  const stacked = useMemo(() => {
    const cats = tab === 'body' ? bodies : fuels;
    return bands.map((b, i) => {
      const entry: Record<string, string | number> = { name: b.shortLabel };
      for (const c of cats) entry[c] = 0;
      for (const r of scoped) {
        if (modelBands(r.model, r.variants, 'start')[0] !== i) continue;
        if (tab === 'body') {
          entry[r.model.bodyType] = (entry[r.model.bodyType] as number) + 1;
        } else {
          for (const f of r.fuels) entry[f] = (entry[f] as number) + 1;
        }
      }
      return entry;
    });
  }, [bands, scoped, tab, bodies, fuels]);

  const activeCats = tab === 'body' ? bodies : fuels;

  return (
    <div>
      <PageHeader
        title="Body Type & Fuel vs Price Segments"
        sub="Stacked by starting-price band. Each model is counted once per band in the body view; in the fuel view a model appears under every fuel it offers."
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            ['body', 'Body type vs band'],
            ['fuel', 'Fuel vs band'],
          ] as [Tab, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              tab === id ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border border-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <Card className="mb-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <FilterSelect
            label="Maker"
            value={maker}
            onChange={setMaker}
            options={[{ value: 'all', label: 'All makers' }, ...makers.map((m) => ({ value: m, label: m }))]}
          />
          {tab === 'body' && (
            <FilterSelect
              label="Fuel filter"
              value={fuelFilter}
              onChange={setFuelFilter}
              options={[{ value: 'all', label: 'All fuels' }, ...fuels.map((f) => ({ value: f, label: f }))]}
            />
          )}
        </div>
      </Card>

      <Card
        title={tab === 'body' ? 'Body type vs price band' : 'Fuel type vs price band'}
        sub={
          tab === 'body'
            ? 'Distinct models per band, stacked by body type'
            : 'Model-fuel pairs per band (multi-fuel models counted under each fuel)'
        }
      >
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={stacked} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={1} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip />
            {activeCats.map((c, i) => (
              <Bar key={c} dataKey={c} stackId="s" fill={STACK_COLORS[i % STACK_COLORS.length]} name={c} />
            ))}
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-2 flex flex-wrap gap-2">
          {activeCats.map((c, i) => (
            <Badge key={c}>
              <span
                className="mr-1 inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: STACK_COLORS[i % STACK_COLORS.length] }}
              />
              {c}
            </Badge>
          ))}
        </div>
      </Card>
    </div>
  );
}
