import type { ReactNode } from 'react';
import { COUNTING_MODES, type CountingMode } from '../lib/bands';

export function PageHeader(props: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {props.title}
        </h1>
        {props.sub && <p className="mt-1 max-w-2xl text-sm text-slate-600">{props.sub}</p>}
      </div>
      {props.right}
    </div>
  );
}

export function StatCard(props: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {props.label}
      </div>
      <div className="mt-1 text-2xl font-bold text-slate-900">{props.value}</div>
      {props.sub && <div className="mt-1 text-xs text-slate-500">{props.sub}</div>}
    </div>
  );
}

export function Card(props: { title?: string; sub?: string; children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 ${props.className ?? ''}`}>
      {props.title && (
        <div className="mb-3">
          <h2 className="text-base font-semibold text-slate-900">{props.title}</h2>
          {props.sub && <p className="mt-0.5 text-xs text-slate-500">{props.sub}</p>}
        </div>
      )}
      {props.children}
    </div>
  );
}

export function Badge(props: { children: ReactNode; tone?: 'slate' | 'amber' | 'green' | 'blue' }) {
  const tone = props.tone ?? 'slate';
  const tones: Record<string, string> = {
    slate: 'bg-slate-100 text-slate-700',
    amber: 'bg-amber-100 text-amber-800',
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
  };
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {props.children}
    </span>
  );
}

export function EmptyState(props: { title: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <p className="font-medium text-slate-700">{props.title}</p>
      {props.hint && <p className="mt-1 text-sm text-slate-500">{props.hint}</p>}
    </div>
  );
}

export function CountingModeToggle(props: { mode: CountingMode; onChange: (m: CountingMode) => void }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Counting mode">
        {COUNTING_MODES.map((m) => (
          <button
            key={m.id}
            role="radio"
            aria-checked={props.mode === m.id}
            onClick={() => props.onChange(m.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              props.mode === m.id
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-slate-500">
        {COUNTING_MODES.find((m) => m.id === props.mode)?.hint}
      </p>
    </div>
  );
}

export function FilterSelect(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
      {props.label}
      <select
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900"
      >
        {props.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function SearchInput(props: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
      Search
      <input
        type="search"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder ?? 'Model or maker'}
        className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900"
      />
    </label>
  );
}
