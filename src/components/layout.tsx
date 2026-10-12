import type { ReactNode } from 'react';

export type PageId =
  | 'dashboard'
  | 'explorer'
  | 'segments'
  | 'makers'
  | 'bodyfuel'
  | 'launches'
  | 'data';

export const NAV: { id: PageId; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'explorer', label: 'Model Explorer' },
  { id: 'segments', label: 'Price Segments' },
  { id: 'makers', label: 'Makers' },
  { id: 'bodyfuel', label: 'Body & Fuel' },
  { id: 'launches', label: 'Launches' },
  { id: 'data', label: 'Data & Setup' },
];

export interface DataStatus {
  isSampleData: boolean;
  verifiedModelCount: number;
  totalModelCount: number;
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
          Market data: {dataStatus.verifiedModelCount} of {dataStatus.totalModelCount} models
          verified Oct 12, 2026 (rest are illustrative sample). Most verified prices are
          portal estimates, not manufacturer list prices - see Data & Setup.
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
          uses ex-showroom prices. Update the data without touching the frontend: swap the
          dataset via Supabase (see Data & Setup).
        </div>
      </footer>
    </div>
  );
}
