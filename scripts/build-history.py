#!/usr/bin/env python3
"""Build src/data/verifiedHistory.ts from data-collection/raw-history/*.json.

- Re-dates the 90 GST-cut records from 2026-09-22 to the correct 2025-09-22
  (verified: India's GST 2.0 cut took effect 22 Sep 2025).
- Matches price changes to verified variant ids by normalized variant name;
  unmatched names are DROPPED and documented (attaching to the wrong trim
  would corrupt history).
- The Maruti range-wide note (model_id "all") is appended to every Maruti model.
- Writes data-collection/MERGE_HISTORY.md for review.
"""
import json, glob, os, re
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, 'data-collection', 'raw')
HIST = os.path.join(ROOT, 'data-collection', 'raw-history')
OUT_TS = os.path.join(ROOT, 'src', 'data', 'verifiedHistory.ts')
REPORT = os.path.join(ROOT, 'data-collection', 'MERGE_HISTORY.md')

ID_ALIASES = {('mg', 'windsor-ev'): 'windsor'}
LAUNCH_TYPES = {'New nameplate', 'New generation', 'Major facelift', 'EV derivative'}

def norm(s):
    return re.sub(r'\s+', ' ', s.strip().lower())

# variant lookup: (model_id, normalized_name) -> variant_id, mirroring build-verified.py
variant_ids = {}
model_ids = set()
maker_models = {}
for f in sorted(glob.glob(os.path.join(RAW, '*.json'))):
    d = json.load(open(f))
    for m in d['models']:
        mid = ID_ALIASES.get((d['maker_id'], m['model_id']), m['model_id'])
        model_ids.add(mid)
        maker_models.setdefault(d['maker_id'], []).append(mid)
        for i, v in enumerate(m['variants']):
            variant_ids[(mid, norm(v['name']))] = f"{mid}-v{i+1}"

def ts(s):
    return json.dumps(s)

launches, prices, model_notes = [], [], {}
unmatched, redated, approx = [], 0, 0
launch_keys = set()

for f in sorted(glob.glob(os.path.join(HIST, '*.json'))):
    d = json.load(open(f))
    mk = d['maker_id']
    for L in d['launches']:
        mid = ID_ALIASES.get((mk, L['model_id']), L['model_id'])
        assert mid in model_ids, (f, L['model_id'])
        assert L['launch_type'] in LAUNCH_TYPES, (f, L['launch_type'])
        assert '2023-10-01' <= L['launch_date'] <= '2026-10-31', (f, L['launch_date'])
        assert L['source_url'], (f, mid, L['launch_date'])
        key = (mid, L['launch_date'], L['launch_type'])
        assert key not in launch_keys, ('dup launch', key)
        launch_keys.add(key)
        launches.append({
            'id': f"lh-{mid}-{L['launch_date']}-{len(launches)}",
            'modelId': mid, 'launchDate': L['launch_date'],
            'launchType': L['launch_type'],
            'launchPrice': int(L['launch_price_inr']) if L.get('launch_price_inr') else None,
            'sourceUrl': L['source_url'],
            'isEstimate': bool(L.get('is_estimate', True)),
            'notes': (L.get('notes') or '').strip() or None,
        })
    for p in d['price_changes']:
        mid = ID_ALIASES.get((mk, p['model_id']), p['model_id'])
        assert mid in model_ids, (f, p['model_id'])
        assert '2023-10-01' <= p['effective_date'] <= '2026-10-31', (f, p['effective_date'])
        assert p['source_url'], (f, mid, p.get('variant_name'))
        assert int(p['ex_showroom_price_inr']) > 0
        eff = p['effective_date']
        note_bits = []
        if eff == '2026-09-22':
            eff = '2025-09-22'
            redated += 1
            note_bits.append('Re-dated from 2026-09-22: GST 2.0 cut took effect 22 Sep 2025.')
        vid = variant_ids.get((mid, norm(p['variant_name'])))
        if not vid:
            unmatched.append((mk, mid, p['variant_name'], p['effective_date']))
            continue
        raw_notes = (p.get('notes') or '').strip()
        if re.search(r'approx', raw_notes, re.I):
            approx += 1
        if raw_notes:
            note_bits.append(raw_notes)
        prices.append({
            'id': f"ph-{vid}-{eff}-{len(prices)}",
            'variantId': vid, 'exShowroomPrice': int(p['ex_showroom_price_inr']),
            'effectiveDate': eff, 'sourceUrl': p['source_url'],
            'isEstimate': bool(p.get('is_estimate', True)),
            'notes': ' '.join(note_bits) or None,
        })
    for n in d.get('model_notes', []):
        if n['model_id'] == 'all':
            # range-wide maker note: append to every model of this maker
            targets = maker_models.get(mk, [])
        else:
            mid = ID_ALIASES.get((mk, n['model_id']), n['model_id'])
            assert mid in model_ids, (f, n['model_id'])
            targets = [mid]
        for t in targets:
            model_notes[t] = (model_notes.get(t, '') + ' | ' + n['note']).strip(' |')

def emit_launch(L):
    lp = f", launchPrice: {L['launchPrice']}" if L['launchPrice'] else ''
    nt = f", notes: {ts(L['notes'])}" if L['notes'] else ''
    return ("  { id: " + ts(L['id']) + ", modelId: " + ts(L['modelId']) +
            ", launchDate: " + ts(L['launchDate']) + ", launchType: " + ts(L['launchType']) +
            lp + ", sourceUrl: " + ts(L['sourceUrl']) +
            ", isEstimate: " + str(L['isEstimate']).lower() + nt + " },")

def emit_price(p):
    nt = f", notes: {ts(p['notes'])}" if p['notes'] else ''
    return ("  { id: " + ts(p['id']) + ", variantId: " + ts(p['variantId']) +
            ", exShowroomPrice: " + str(p['exShowroomPrice']) +
            ", effectiveDate: " + ts(p['effectiveDate']) +
            ", sourceUrl: " + ts(p['sourceUrl']) +
            ", isEstimate: " + str(p['isEstimate']).lower() + nt + " },")

with open(OUT_TS, 'w') as f:
    f.write("// ---------------------------------------------------------------------------\n")
    f.write("// VERIFIED HISTORY - Phase 4, researched 2026-10-12.\n")
    f.write("// Launch events and notable variant price changes, Oct 2023 - Oct 2026.\n")
    f.write("// 90 GST-cut records re-dated 2026-09-22 -> 2025-09-22 (cut took effect\n")
    f.write("// 22 Sep 2025). 21 price changes dropped: variant names unmatched.\n")
    f.write("// Generated by scripts/build-history.py - do not hand-edit.\n")
    f.write("// ---------------------------------------------------------------------------\n\n")
    f.write("import type { LaunchEvent, PriceRecord } from './types';\n\n")
    f.write("export const verifiedLaunches: LaunchEvent[] = [\n")
    f.write("\n".join(emit_launch(L) for L in launches) + "\n];\n\n")
    f.write("export const verifiedPriceHistory: PriceRecord[] = [\n")
    f.write("\n".join(emit_price(p) for p in prices) + "\n];\n\n")
    f.write("export const verifiedModelNotes: Record<string, string> = {\n")
    for mid in sorted(model_notes):
        f.write(f"  {ts(mid)}: {ts(model_notes[mid])},\n")
    f.write("};\n")

with open(REPORT, 'w') as f:
    f.write(f"# History merge report - {date.today().isoformat()}\n\n")
    f.write(f"- Launch events: {len(launches)}\n")
    f.write(f"- Price changes matched: {len(prices)}\n")
    f.write(f"- Price changes dropped (unmatched variant): {len(unmatched)}\n")
    f.write(f"- GST re-dated 2026-09-22 -> 2025-09-22: {redated}\n")
    f.write(f"- Records flagged approximate date: {approx}\n")
    f.write(f"- Models with appended notes: {len(model_notes)}\n\n")
    f.write("## Dropped price changes (variant name unmatched)\n\n")
    for mk, mid, name, eff in unmatched:
        f.write(f"- {mk}/{mid}: {name!r} ({eff})\n")

print(f"launches={len(launches)} prices={len(prices)} unmatched={len(unmatched)} redated={redated} notes={len(model_notes)}")
