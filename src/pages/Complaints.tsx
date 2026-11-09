import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, PageHeader, StatCard } from '../components/ui';
import { fmtDate, inr } from '../lib/format';
import {
  COMPLAINTS_SOURCES,
  COMPLAINTS_UPDATED_AT,
  MARUTI_RECALLS_SINCE_2012,
  RECALLS_2025,
  RECALLS_2025_TOTAL,
  RECALLS_SINCE_2012_TOTAL,
  RECALL_DEFECT_CATEGORIES,
} from '../data/complaints';

export function Complaints() {
  return (
    <div>
      <PageHeader
        title="Complaints & Recalls"
        sub="What owners complain about, and what makers recall. Read the caveat first: India publishes no official per-model complaint counts."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Vehicles recalled in 2025" value={inr(RECALLS_2025_TOTAL)} sub="All types, SIAM data - lowest in 8 years" />
        <StatCard label="Vehicles recalled since 2012" value={`₹${(RECALLS_SINCE_2012_TOTAL / 100000).toFixed(2)} lakh`} sub="24 manufacturers, voluntary recall code" />
        <StatCard label="Maruti Suzuki recalled since 2012" value={`₹${(MARUTI_RECALLS_SINCE_2012 / 100000).toFixed(1)} lakh`} sub="Largest car-maker total on record" />
        <StatCard label="Per-model complaint counts" value="Not published" sub="No official source breaks complaints out by model" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card
          title="Vehicles recalled in 2025, by maker"
          sub="SIAM data via Moneycontrol, 30 Dec 2025. Only makers with published 2025 figures are shown."
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={RECALLS_2025} layout="vertical" margin={{ top: 5, right: 5, left: 40, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
              <YAxis type="category" dataKey="maker" tick={{ fontSize: 11 }} width={110} />
              <Tooltip formatter={(v) => (typeof v === 'number' ? inr(v) : v)} />
              <Bar dataKey="vehicles" fill="#be123c" name="Vehicles recalled in 2025" />
            </BarChart>
          </ResponsiveContainer>
          <ul className="mt-2 space-y-1 text-xs text-slate-600">
            {RECALLS_2025.map((r) => (
              <li key={r.maker}>
                <span className="font-medium text-slate-900">{r.maker}:</span> {inr(r.vehicles)} - {r.note}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-slate-500">
            Total recalled in 2025: {inr(RECALLS_2025_TOTAL)}. The five makers above account for
            most of it; other makers' 2025 figures were not published in this source.
          </p>
        </Card>

        <Card
          title="What defects get recalled"
          sub="Share of all recalled vehicles since 2012, by defect category (Factly analysis of the SIAM portal, Feb 2026)"
        >
          <ul className="space-y-2 text-sm">
            {RECALL_DEFECT_CATEGORIES.map((c) => (
              <li key={c.category} className="flex items-center justify-between border-b border-slate-100 py-2">
                <span className="text-slate-600">{c.category}</span>
                <span className="font-medium text-slate-900">{c.sharePct}%</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-500">
            Airbag and engine faults together account for about half of all recalls. Software
            and ECU faults are rising, especially among premium makers, and battery/charging
            faults are beginning to appear as EV volumes grow. Total since 2012:{' '}
            {inr(RECALLS_SINCE_2012_TOTAL)} vehicles.
          </p>
        </Card>
      </div>

      <Card title="What is missing, and why" sub="Read this before quoting any number on this page" className="mt-4">
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>
            <span className="font-medium text-slate-900">No per-model complaint counts exist publicly.</span>{' '}
            The National Consumer Helpline reports total volumes (about 1.7 lakh complaints a
            month in 2025) but no company-wise or model-wise breakdown.
          </li>
          <li>
            <span className="font-medium text-slate-900">Aggregator counts are not used here.</span>{' '}
            Sites like ComplaintsBoard or consumercomplaints.in collect self-selected,
            unverified posts; their totals are not comparable across brands.
          </li>
          <li>
            <span className="font-medium text-slate-900">A recall is not a complaint count.</span>{' '}
            Recalls are safety-defect actions, triggered when similar defect complaints cross
            a threshold. Recall volumes track sales volume: a maker selling 40% of cars
            recalls more units without being less reliable. Do not rank makers by recall
            totals alone.
          </li>
          <li>
            <span className="font-medium text-slate-900">Per-model recall records do exist</span>{' '}
            on the SIAM Voluntary Recall portal (manufacturer, model, variant, defect, units),
            but no published summary breaks them out for all {''}77 models on this site.
            That per-model table is a future data job, not a number we can fill in today.
          </li>
        </ul>
      </Card>

      <Card title="Check your car, or file a complaint" className="mt-4">
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>
            Check whether your car is under a recall on the{' '}
            <a className="underline" href="https://siam.in/siam-voluntary-recall.aspx" target="_blank" rel="noreferrer">
              SIAM Voluntary Recall portal
            </a>{' '}
            or your maker's customer-notification page. Recall repair is free in India,
            regardless of warranty.
          </li>
          <li>
            File a consumer complaint with the National Consumer Helpline (toll-free 1915) or
            at{' '}
            <a className="underline" href="https://consumerhelpline.gov.in" target="_blank" rel="noreferrer">
              consumerhelpline.gov.in
            </a>
            .
          </li>
        </ul>
      </Card>

      <Card title="Sources" sub={`Figures last updated ${fmtDate(COMPLAINTS_UPDATED_AT)}`} className="mt-4">
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
          {COMPLAINTS_SOURCES.map((s) => (
            <li key={s.url}>
              <a className="underline" href={s.url} target="_blank" rel="noreferrer">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
