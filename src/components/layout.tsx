import type { ReactNode } from 'react';
import { fmtDate } from '../lib/format';

export type PageId =
  | 'dashboard'
  | 'explorer'
  | 'segments'
  | 'makers'
  | 'bodyfuel'
  | 'launches'
  | 'complaints'
  | 'safety'
  | 'price-changes'
  | 'data';

export const NAV: { id: PageId; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'explorer', label: 'Model Explorer' },
  { id: 'segments', label: 'Price Segments' },
  { id: 'makers', label: 'Makers' },
  { id: 'bodyfuel', label: 'Body & Fuel' },
  { id: 'launches', label: 'Launches' },
  { id: 'complaints', label: 'Complaints & Recalls' },
  { id: 'safety', label: 'Safety' },
  { id: 'price-changes', label: 'Price Changes' },
  { id: 'data', label: 'Data & Setup' },
];

export interface DataStatus {
  isSampleData: boolean;
  verifiedModelCount: number;
  totalModelCount: number;
  /** Active models shown on the site. */
  activeModelCount: number;
  /** Active models that are illustrative sample records, not researched ones. */
  sampleActiveCount: number;
  lastUpdated: string;
  derivedUpdatedAt: string;
}

export function Shell(props: {
  page: PageId;
  onNav: (p: PageId) => void;
  dataStatus: DataStatus;
  children: ReactNode;
}) {
  const { dataStatus } = props;
  return (
    <div className="min-h-screen">
      {dataStatus.isSampleData ? (
        <div className="bg-amber-100 px-4 py-2 text-center text-xs font-medium text-amber-900">
          Concept preview: the site is running on illustrative sample data. Numbers shown are
          not verified market data.
        </div>
      ) : (
        <div className="bg-amber-100 px-4 py-2 text-center text-xs font-medium text-amber-900">
          Market data last updated {fmtDate(dataStatus.lastUpdated)}: {dataStatus.verifiedModelCount} of{' '}
          {dataStatus.totalModelCount} models researched. {dataStatus.activeModelCount} active models
          shown
          {dataStatus.sampleActiveCount > 0 &&
            ` (includes ${dataStatus.sampleActiveCount} illustrative sample model${dataStatus.sampleActiveCount === 1 ? '' : 's'})`}
          . Most prices are portal estimates, not official list prices - see Data & Setup.
        </div>
      )}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <div>
            <div className="text-lg font-bold tracking-tight text-slate-900">
              CarScope India
            </div>
            <div className="text-xs text-slate-500">
              India Auto Market - explore by price, brand, body type and fuel
            </div>
          </div>
          <nav className="flex flex-wrap gap-1" aria-label="Main">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => props.onNav(n.id)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  props.page === n.id
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {n.label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{props.children}</main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 text-xs text-slate-500">
          CarScope India - open car-price comparison for the Indian market. All segment math
          uses ex-showroom prices. Price data last updated {fmtDate(dataStatus.lastUpdated)};
          on-road, maintenance, safety, fuel and recall figures last updated {fmtDate(dataStatus.derivedUpdatedAt)}.
          Update the data without touching the frontend: swap the dataset via Supabase (see Data & Setup).
        </div>
      </footer>
    </div>
  );
}
