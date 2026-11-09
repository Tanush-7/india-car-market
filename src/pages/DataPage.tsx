import { useMemo } from 'react';
import type { MarketDataset } from '../data/provider';
import { priceBands } from '../lib/bands';
import { fmtDate } from '../lib/format';
import { COMPLAINTS_UPDATED_AT } from '../data/complaints';
import { MAINTENANCE_UPDATED_AT } from '../data/maintenance';
import { ONROAD_UPDATED_AT } from '../data/onRoad';
import { Badge, Card, PageHeader } from '../components/ui';

export function DataPage(props: { ds: MarketDataset }) {
  const bands = priceBands();
  const counts = useMemo(
    () => ({
      makers: props.ds.makers.length,
      models: props.ds.models.length,
      active: props.ds.models.filter((m) => m.status === 'active').length,
      discontinued: props.ds.models.filter((m) => m.status === 'discontinued').length,
      variants: props.ds.variants.length,
      availableVariants: props.ds.variants.filter((v) => v.availabilityStatus === 'available').length,
      priceRecords: props.ds.priceHistory.length,
      launches: props.ds.launches.length,
    }),
    [props.ds],
  );

  // Researched vs illustrative-sample split, computed from the dataset so
  // the banner, the Explorer badges and this page can never disagree.
  const split = useMemo(() => {
    const isSample = (sourceUrl: string) => sourceUrl === 'sample';
    const researchedModels = props.ds.models.filter((m) => !isSample(m.sourceUrl));
    const sampleModels = props.ds.models.filter((m) => isSample(m.sourceUrl));
    const researchedVariants = props.ds.variants.filter((v) => !isSample(v.sourceUrl ?? ''));
    const sampleVariants = props.ds.variants.filter((v) => isSample(v.sourceUrl ?? ''));
    const exactPrices = props.ds.variants.filter((v) => !v.isEstimate).length;
    return {
      researchedModels: researchedModels.length,
      sampleModels: sampleModels.length,
      sampleActiveNames: sampleModels
        .filter((m) => m.status === 'active')
        .map((m) => m.name)
        .join(', '),
      researchedVariants: researchedVariants.length,
      researchedAvailableVariants: researchedVariants.filter((v) => v.availabilityStatus === 'available').length,
      sampleVariants: sampleVariants.length,
      sampleAvailableVariants: sampleVariants.filter((v) => v.availabilityStatus === 'available').length,
      exactPrices,
    };
  }, [props.ds]);

  return (
    <div>
      <PageHeader
        title="Data & Setup"
        sub="How the data is stored, how to update it, and how to connect the live Supabase backend."
      />

      <Card title="Verification progress" className="mb-4">
        <div className="flex flex-wrap items-center gap-2">
          {props.ds.meta.isSampleData ? (
            <Badge tone="amber">Sample data - not verified</Badge>
          ) : props.ds.meta.verifiedModelCount !== undefined ? (
            <Badge tone="green">
              {props.ds.meta.verifiedModelCount} of {props.ds.meta.totalModelCount} models verified
            </Badge>
          ) : (
            <Badge tone="green">Live Supabase data</Badge>
          )}
          <span className="text-sm text-slate-600">{props.ds.meta.note}</span>
        </div>
        {!props.ds.meta.isSampleData && (
          <div className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
            <span className="font-medium">Methodology caveat. </span>
            Only {split.exactPrices} of {split.researchedAvailableVariants} researched variant
            prices come from official manufacturer price lists; the rest are portal-sourced
            estimates, badged as such on every model. Many portal tables predate the 22 Sep
            2025 GST rate cut and several makers revised prices in late Sep / early Oct 2025,
            so figures may be marginally stale. A re-verification pass against official price
            lists is planned. See data-collection/VALIDATION.md in the repo for the full
            per-model flags.
          </div>
        )}
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          {[
            ['Makers', counts.makers],
            ['Models (total)', counts.models],
            ['Active models', counts.active],
            ['Discontinued', counts.discontinued],
            ['Variants (total)', counts.variants],
            ['Variants (available)', counts.availableVariants],
            ['Price records', counts.priceRecords],
            ['Launch events', counts.launches],
          ].map(([label, v]) => (
            <div key={label as string} className="rounded-lg bg-slate-50 px-3 py-2">
              <div className="text-lg font-bold text-slate-900">{v}</div>
              <div className="text-xs text-slate-500">{label}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
          <div className="font-medium text-slate-700">What is researched, and what is sample</div>
          <ul className="mt-1 list-disc space-y-0.5 pl-5">
            <li>
              {split.researchedModels} of {counts.models} models are researched records;{' '}
              {split.sampleModels} are illustrative sample ({split.sampleActiveNames || 'none'}{' '}
              still shown as active).
            </li>
            <li>
              {split.researchedAvailableVariants} of {counts.availableVariants} available variants
              are researched; {split.sampleAvailableVariants} belong to the sample models.
            </li>
            <li>
              {split.exactPrices} variant prices are exact official-list prices; the other
              researched prices are portal estimates. "Researched" means the model was
              confirmed on sale with sourced prices; "Estimate" / "Exact price" badges in the
              Explorer describe the price, not the model.
            </li>
          </ul>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Price data last updated: {fmtDate(props.ds.meta.lastUpdated)}. On-road figures last
          updated {fmtDate(ONROAD_UPDATED_AT)}, maintenance estimates {fmtDate(MAINTENANCE_UPDATED_AT)},
          recall figures {fmtDate(COMPLAINTS_UPDATED_AT)}. To replace the sample data with
          verified records, follow the Supabase setup below. No frontend changes are needed.
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Counting rules" sub="Applied consistently across every page">
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>Model counts use distinct model IDs, never name matching.</li>
            <li>A model is counted once in market totals even with many fuels or variants.</li>
            <li>Price bands are ₹5L steps, lower-inclusive and upper-exclusive (₹10-15L means ₹10L or more, less than ₹15L). The final band is ₹70L+.</li>
            <li>All segment math uses ex-showroom prices. On-road prices never feed the bands.</li>
            <li>Rebadged twins are separate nameplates only when they are distinct market offerings.</li>
            <li>Estimates are always badged; exact published prices are marked verified.</li>
          </ul>
        </Card>
        <Card title="Price bands" sub="Band index used in exports">
          <div className="grid grid-cols-3 gap-1 text-xs">
            {bands.map((b) => (
              <div key={b.index} className="rounded bg-slate-50 px-2 py-1 text-slate-600">
                <span className="font-medium text-slate-900">{b.index}</span> - {b.label}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Supabase setup" sub="Takes the site from sample data to live data" className="mt-4">
        <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-600">
          <li>Create a free project at supabase.com and open the SQL editor.</li>
          <li>
            Run <code className="rounded bg-slate-100 px-1">supabase/migrations/0001_init.sql</code> from
            this repository to create the <code className="rounded bg-slate-100 px-1">makers</code>,{' '}
            <code className="rounded bg-slate-100 px-1">models</code>,{' '}
            <code className="rounded bg-slate-100 px-1">variants</code>,{' '}
            <code className="rounded bg-slate-100 px-1">price_history</code> and{' '}
            <code className="rounded bg-slate-100 px-1">launch_history</code> tables with row-level
            security for public reads.
          </li>
          <li>
            Insert verified records. Every model and variant needs{' '}
            <code className="rounded bg-slate-100 px-1">source_url</code>,{' '}
            <code className="rounded bg-slate-100 px-1">last_verified_at</code> and{' '}
            <code className="rounded bg-slate-100 px-1">is_estimate</code>. Never invent prices;
            flag uncertain rows for manual review.
          </li>
          <li>
            Copy <code className="rounded bg-slate-100 px-1">.env.example</code> to{' '}
            <code className="rounded bg-slate-100 px-1">.env</code> and set{' '}
            <code className="rounded bg-slate-100 px-1">VITE_SUPABASE_URL</code> and{' '}
            <code className="rounded bg-slate-100 px-1">VITE_SUPABASE_ANON_KEY</code> (anon key
            only - never commit the service-role key).
          </li>
          <li>Rebuild and redeploy. The site reads Supabase automatically when the variables are set.</li>
        </ol>
      </Card>

      <Card title="Keeping prices fresh" sub="Without rewriting the frontend" className="mt-4">
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>Add a row to <code className="rounded bg-slate-100 px-1">price_history</code> when a variant price changes; the explorer shows the trail per model.</li>
          <li>Add a row to <code className="rounded bg-slate-100 px-1">launch_history</code> for new nameplates, generations, facelifts and EV derivatives.</li>
          <li>Mark a model <code className="rounded bg-slate-100 px-1">discontinued</code> instead of deleting it; history stays intact.</li>
          <li>Do not scrape sites against their terms. Prefer official price lists, press releases and permitted feeds, or manual imports.</li>
        </ul>
      </Card>

      <Card title="Weekly refresh" sub="Every Monday: data files only, no component changes" className="mt-4">
        <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-600">
          <li>
            Prices: check official price lists and the portal sources in{' '}
            <code className="rounded bg-slate-100 px-1">data-collection/VALIDATION.md</code> for
            changes; update <code className="rounded bg-slate-100 px-1">src/data/verifiedData.ts</code>{' '}
            (and <code className="rounded bg-slate-100 px-1">verifiedHistory.ts</code> for price
            changes) and set <code className="rounded bg-slate-100 px-1">VERIFIED_AT</code> to the
            refresh date. The banner, footer and this page read that date automatically.
          </li>
          <li>
            On-road: re-check the Karnataka slabs in{' '}
            <code className="rounded bg-slate-100 px-1">src/data/onRoad.ts</code> (Spinny /
            mycarhelpline) and update <code className="rounded bg-slate-100 px-1">ONROAD_UPDATED_AT</code>.
          </li>
          <li>
            Maintenance: re-check the segment averages in{' '}
            <code className="rounded bg-slate-100 px-1">src/data/maintenance.ts</code> (motomotar
            2026 guide) and update <code className="rounded bg-slate-100 px-1">MAINTENANCE_UPDATED_AT</code>.
          </li>
          <li>
            Recalls: re-check the SIAM portal summary in{' '}
            <code className="rounded bg-slate-100 px-1">src/data/complaints.ts</code> (Moneycontrol /
            Factly) and update <code className="rounded bg-slate-100 px-1">COMPLAINTS_UPDATED_AT</code>.
          </li>
          <li>
            Run <code className="rounded bg-slate-100 px-1">npm test</code> and{' '}
            <code className="rounded bg-slate-100 px-1">npm run build</code>, then push to{' '}
            <code className="rounded bg-slate-100 px-1">main</code> - GitHub Actions deploys to
            GitHub Pages automatically. Full checklist: README "Weekly refresh".
          </li>
        </ol>
      </Card>
    </div>
  );
}
