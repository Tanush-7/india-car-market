import { useMemo } from 'react';
import type { MarketDataset } from '../data/provider';
import { recentPriceChanges } from '../lib/priceChanges';
import { fmtDate, inr } from '../lib/format';
import { Badge, Card, PageHeader } from '../components/ui';

export function PriceChanges(props: { ds: MarketDataset }) {
  const changes = useMemo(() => recentPriceChanges(props.ds, 60), [props.ds]);

  return (
    <div>
      <PageHeader
        title="Price Changes"
        sub="Recorded ex-showroom price changes, newest first. Each change is one variant compared with its own previous recorded price."
      />
      <Card className="mb-4">
        <p className="text-sm text-slate-600">
          This list is the alert feed this static site can offer: check it weekly for the
          models you follow. True push or email alerts need a backend that watches prices
          and sends messages - this site has none, so nothing here is a live alert
          subscription. The records run Jan 2024 - Oct 2026 and include the 22 Sep 2025
          GST-cut revisions, when most prices fell.
        </p>
      </Card>
      <Card>
        {changes.length === 0 ? (
          <p className="text-sm text-slate-500">No recorded price changes.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                  <th className="py-2 pr-2">Date</th>
                  <th className="py-2 pr-2">Model</th>
                  <th className="hidden py-2 pr-2 sm:table-cell">Variant</th>
                  <th className="py-2 pr-2 text-right">Was</th>
                  <th className="py-2 pr-2 text-right">Now</th>
                  <th className="py-2 text-right">Change</th>
                </tr>
              </thead>
              <tbody>
                {changes.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100">
                    <td className="py-2 pr-2 text-slate-600">{fmtDate(c.date)}</td>
                    <td className="py-2 pr-2 font-medium text-slate-900">
                      {c.makerName} {c.modelName}
                    </td>
                    <td className="hidden py-2 pr-2 text-slate-600 sm:table-cell">{c.variantName}</td>
                    <td className="py-2 pr-2 text-right text-slate-600">{inr(c.oldPrice)}</td>
                    <td className="py-2 pr-2 text-right font-medium text-slate-900">{inr(c.newPrice)}</td>
                    <td className="py-2 text-right">
                      <Badge tone={c.delta < 0 ? 'green' : 'amber'}>
                        {c.delta > 0 ? '+' : ''}
                        {inr(c.delta)} ({c.pct > 0 ? '+' : ''}
                        {c.pct.toFixed(1)}%)
                      </Badge>
                      {c.isEstimate && (
                        <div className="mt-0.5 text-xs text-slate-400">estimate</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-3 text-xs text-slate-500">
          Showing the 60 most recent changes. Per-model history, with the same deltas, is
          in each model's detail view in the Model Explorer.
        </p>
      </Card>
    </div>
  );
}
