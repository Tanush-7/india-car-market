// Server-side render smoke test: renders every page against the sample dataset
// to catch runtime crashes (bad data access, chart errors) without a browser.
import { describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';

vi.stubGlobal('window', {
  location: { hash: '' },
  addEventListener: () => {},
  removeEventListener: () => {},
  scrollTo: () => {},
});
vi.stubGlobal('document', { createElement: () => ({ click: () => {} }) });

const provider = await import('./data/provider');
const { Dashboard } = await import('./pages/Dashboard');
const { Explorer } = await import('./pages/Explorer');
const { Segments } = await import('./pages/Segments');
const { Makers } = await import('./pages/Makers');
const { BodyFuel } = await import('./pages/BodyFuel');
const { Launches } = await import('./pages/Launches');
const { DataPage } = await import('./pages/DataPage');

describe('page renders', () => {
  it('renders all seven pages against the merged dataset', async () => {
    const ds = await provider.loadDataset();
    expect(ds.meta.isSampleData).toBe(false);
    expect(ds.meta.verifiedModelCount).toBe(75);

    const pages: [string, string][] = [
      ['dashboard', renderToString(<Dashboard ds={ds} />)],
      ['explorer', renderToString(<Explorer ds={ds} />)],
      ['segments', renderToString(<Segments ds={ds} />)],
      ['makers', renderToString(<Makers ds={ds} />)],
      ['bodyfuel', renderToString(<BodyFuel ds={ds} />)],
      ['launches', renderToString(<Launches ds={ds} />)],
      ['data', renderToString(<DataPage ds={ds} />)],
    ];
    for (const [name, html] of pages) {
      expect(html.length, `${name} rendered empty`).toBeGreaterThan(500);
    }

    const dash = pages[0][1];
    expect(dash).toContain('Active models');
    const activeCount = String(ds.models.filter((m) => m.status === 'active').length);
    expect(dash).toContain(activeCount);
    expect(pages[1][1]).toContain('Model Explorer');
    expect(pages[5][1]).toContain('Launch History');
  });
});
