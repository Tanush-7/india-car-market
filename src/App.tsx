import { useEffect, useState } from 'react';
import { Shell, type PageId } from './components/layout';
import { loadDataset, type MarketDataset } from './data/provider';
import { Dashboard } from './pages/Dashboard';
import { Explorer } from './pages/Explorer';
import { Segments } from './pages/Segments';
import { Makers } from './pages/Makers';
import { BodyFuel } from './pages/BodyFuel';
import { Launches } from './pages/Launches';
import { DataPage } from './pages/DataPage';

const PAGES: PageId[] = ['dashboard', 'explorer', 'segments', 'makers', 'bodyfuel', 'launches', 'data'];

function pageFromHash(): PageId {
  const h = window.location.hash.replace('#/', '').replace('#', '') as PageId;
  return PAGES.includes(h) ? h : 'dashboard';
}

export default function App() {
  const [page, setPage] = useState<PageId>(() => pageFromHash());
  const [ds, setDs] = useState<MarketDataset | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDataset().then(setDs).catch((e) => setError(String(e)));
  }, []);

  useEffect(() => {
    const onHash = () => setPage(pageFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const nav = (p: PageId) => {
    window.location.hash = `#/${p}`;
    setPage(p);
    window.scrollTo(0, 0);
  };

  return (
    <Shell
      page={page}
      onNav={nav}
      dataStatus={{
        isSampleData: ds?.meta.isSampleData ?? true,
        verifiedModelCount: ds?.meta.verifiedModelCount ?? 0,
        totalModelCount: ds?.meta.totalModelCount ?? 0,
      }}
    >
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Failed to load data: {error}
        </div>
      )}
      {!ds && !error && <div className="p-10 text-center text-sm text-slate-500">Loading market data...</div>}
      {ds && (
        <>
          {page === 'dashboard' && <Dashboard ds={ds} />}
          {page === 'explorer' && <Explorer ds={ds} />}
          {page === 'segments' && <Segments ds={ds} />}
          {page === 'makers' && <Makers ds={ds} />}
          {page === 'bodyfuel' && <BodyFuel ds={ds} />}
          {page === 'launches' && <Launches ds={ds} />}
          {page === 'data' && <DataPage ds={ds} />}
        </>
      )}
    </Shell>
  );
}
