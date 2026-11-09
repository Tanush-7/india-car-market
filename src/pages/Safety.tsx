import { useMemo, useState } from 'react';
import type { MarketDataset } from '../data/provider';
import { enrichModels } from '../lib/enrich';
import { fmtDate } from '../lib/format';
import { agencyLabel, SAFETY_SOURCES, SAFETY_UPDATED_AT, safetyForModel, stars } from '../data/safety';
import { Badge, Card, FilterSelect, PageHeader } from '../components/ui';

export function Safety(props: { ds: MarketDataset }) {
  const rows = useMemo(() => enrichModels(props.ds), [props.ds]);
  const [filter, setFilter] = useState('all');

  const withSafety = useMemo(
    () =>
      rows.map((r) => ({ row: r, safety: safetyForModel(r.model.id) })),
    [rows],
  );
  const ratedCount = withSafety.filter((x) => x.safety).length;
  const filtered = withSafety.filter((x) => {
    if (filter === 'rated') return !!x.safety;
    if (filter === 'untested') return !x.safety;
    if (filter === '5star') return x.safety?.adultStars === 5;
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Safety Ratings"
        sub="NCAP crash-test star ratings where the model has actually been tested. Models never tested say so - no rating is ever guessed."
      />
      <Card className="mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <FilterSelect
            label="Show"
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: `All models (${rows.length})` },
              { value: 'rated', label: `Crash-tested only (${ratedCount})` },
              { value: '5star', label: '5-star adult protection' },
              { value: 'untested', label: `Not tested (${rows.length - ratedCount})` },
            ]}
          />
          <p className="max-w-2xl text-xs text-slate-500">
            Bharat NCAP scores adult protection out of 32 and child out of 49. Global NCAP
            (new protocol, 2022 onwards) scores adult out of 34 and child out of 49.
            Old-protocol Global NCAP results (before 2022) used a different test set and
            are not directly comparable - they are marked as such. A rating applies to
            the variant tested; the note says when it covers the whole line-up or only
            specific trims. Ratings updated {fmtDate(SAFETY_UPDATED_AT)}.
          </p>
        </div>
      </Card>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                <th className="py-2 pr-2">Maker</th>
                <th className="py-2 pr-2">Model</th>
                <th className="py-2 pr-2">Adult</th>
                <th className="hidden py-2 pr-2 sm:table-cell">Child</th>
                <th className="hidden py-2 pr-2 md:table-cell">Scores</th>
                <th className="py-2 pr-2">Agency</th>
                <th className="hidden py-2 pr-2 lg:table-cell">Note</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(({ row, safety }) => (
                <tr key={row.model.id} className="border-b border-slate-100">
                  <td className="py-2 pr-2 text-slate-600">{row.makerName}</td>
                  <td className="py-2 pr-2 font-medium text-slate-900">{row.model.name}</td>
                  {safety ? (
                    <>
                      <td className="py-2 pr-2">
                        <span className="font-medium text-slate-900">{stars(safety.adultStars)}</span>{' '}
                        <span className="text-xs text-slate-500">{safety.adultStars}/5</span>
                      </td>
                      <td className="hidden py-2 pr-2 sm:table-cell">
                        <span className="font-medium text-slate-900">{stars(safety.childStars)}</span>{' '}
                        <span className="text-xs text-slate-500">{safety.childStars}/5</span>
                      </td>
                      <td className="hidden py-2 pr-2 text-slate-600 md:table-cell">
                        {safety.aop !== undefined && safety.cop !== undefined
                          ? `${safety.aop} / ${safety.cop}`
                          : '—'}
                      </td>
                      <td className="py-2 pr-2 text-slate-600">
                        {agencyLabel(safety.agency)}
                        <div className="text-xs text-slate-400">tested {safety.tested}</div>
                      </td>
                      <td className="hidden py-2 pr-2 text-xs text-slate-500 lg:table-cell">
                        {safety.note ?? ''}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-2 pr-2" colSpan={2}>
                        <Badge tone="slate">Not tested</Badge>
                      </td>
                      <td className="hidden py-2 pr-2 text-slate-400 md:table-cell">—</td>
                      <td className="py-2 pr-2 text-xs text-slate-500">
                        No NCAP test published for this model
                      </td>
                      <td className="hidden py-2 pr-2 text-xs text-slate-500 lg:table-cell">
                        Grand Vitara, Hyryder, Fronx and most MPVs are still awaiting a test.
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Sources:{' '}
          {SAFETY_SOURCES.map((u, i) => (
            <span key={u}>
              {i > 0 && ', '}
              <a className="underline" href={u} target="_blank" rel="noreferrer">
                {new URL(u).hostname}
              </a>
            </span>
          ))}
          . A star rating is for the tested variant - check that the variant you buy has
          six airbags, ESC and ISOFIX mounts.
        </p>
      </Card>
    </div>
  );
}
