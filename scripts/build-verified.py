#!/usr/bin/env python3
"""Build src/data/verifiedData.ts from data-collection/raw/*.json.

Merge strategy: verified records REPLACE sample models with the same
(maker_id, model_id); verified models not in the sample set are added.
Sample models outside the researched scope are retained untouched.
Writes data-collection/MERGE_REPORT.md for review.
"""
import json, glob, os, re
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, 'data-collection', 'raw')
OUT_TS = os.path.join(ROOT, 'src', 'data', 'verifiedData.ts')
REPORT = os.path.join(ROOT, 'data-collection', 'MERGE_REPORT.md')
VERIFIED_AT = '2026-10-12'

BODY = {'SUV','Crossover','Sedan','Hatchback','MPV','Coupe','Off-road','Other'}
FUEL = {'Petrol','Diesel','CNG','Electric','Hybrid','Plug-in Hybrid','Other'}
TRANS = {'Manual','AMT','iMT','CVT','DCT','Automatic'}

COUNTRIES = {
    'maruti': 'India / Japan', 'hyundai': 'South Korea', 'tata': 'India',
    'mahindra': 'India', 'kia': 'South Korea', 'toyota': 'Japan',
    'honda': 'Japan', 'mg': 'United Kingdom / China', 'ford': 'United States',
    'datsun': 'Japan', 'skoda': 'Czechia', 'volkswagen': 'Germany',
    'renault': 'France', 'nissan': 'Japan',
}

# Researcher ids that differ from the sample-dataset ids for the same model.
ID_ALIASES = {('mg', 'windsor-ev'): 'windsor'}

def ts_str(s):
    return json.dumps(s)  # valid TS string literal

makers, models, variants = {}, [], []
report_lines = []
replaced, added = [], []

for f in sorted(glob.glob(os.path.join(RAW, '*.json'))):
    d = json.load(open(f))
    maker_id = d['maker_id']
    makers[maker_id] = {'id': maker_id, 'name': d['maker'],
                        'countryOfOrigin': COUNTRIES.get(maker_id)}
    for m in d['models']:
        assert m['body_type'] in BODY, (f, m['model_id'], m['body_type'])
        assert m['source_url'], (f, m['model_id'])
        assert m['variants'], (f, m['model_id'], 'no variants')
        model_id = ID_ALIASES.get((maker_id, m['model_id']), m['model_id'])
        notes = ' | '.join(m.get('flags', []) + ([m['notes']] if m.get('notes') else []))
        model = {
            'id': model_id, 'makerId': maker_id, 'name': m['name'],
            'bodyType': m['body_type'],
            'firstLaunchDate': m.get('first_launch_date'),
            'latestFaceliftDate': m.get('latest_facelift_date'),
            'status': m.get('status', 'active'),
            'sourceUrl': m['source_url'], 'lastVerifiedAt': VERIFIED_AT,
            'isEstimate': True,  # flipped below only if every variant is official
            'notes': notes or None,
        }
        all_official = True
        for i, v in enumerate(m['variants']):
            assert v['fuel'] in FUEL, (f, m['model_id'], v['fuel'])
            assert v['transmission'] in TRANS, (f, m['model_id'], v['transmission'])
            assert v['ex_showroom_price_inr'] > 0, (f, m['model_id'], v['name'])
            assert v['source_url'], (f, m['model_id'], v['name'])
            est = bool(v.get('is_estimate', True))
            all_official = all_official and not est
            variants.append({
                'id': f"{model_id}-v{i+1}", 'modelId': model_id,
                'name': v['name'], 'fuelType': v['fuel'],
                'transmission': v['transmission'],
                'exShowroomPrice': int(v['ex_showroom_price_inr']),
                'availabilityStatus': 'available',
                'sourceUrl': v['source_url'], 'lastVerifiedAt': VERIFIED_AT,
                'isEstimate': est,
            })
        model['isEstimate'] = not all_official
        models.append(model)

# sanity: ids unique
assert len({m['id'] for m in models}) == len(models), 'dup model ids'
assert len({v['id'] for v in variants}) == len(variants), 'dup variant ids'
# every model has >=1 variant in 10-25L
for m in models:
    vs = [v for v in variants if v['modelId'] == m['id']]
    assert any(1_000_000 <= v['exShowroomPrice'] < 2_500_000 for v in vs), m['id']

def emit_maker(mk):
    co = ", countryOfOrigin: " + ts_str(mk['countryOfOrigin']) if mk.get('countryOfOrigin') else ''
    return "  { id: " + ts_str(mk['id']) + ", name: " + ts_str(mk['name']) + co + " },"

def emit_model(m):
    def opt(k):
        v = m.get(k)
        return ", " + k + ": " + ts_str(v) if v else ''
    return ("  { id: " + ts_str(m['id']) + ", makerId: " + ts_str(m['makerId']) +
            ", name: " + ts_str(m['name']) + ", bodyType: " + ts_str(m['bodyType']) +
            opt('firstLaunchDate') + opt('latestFaceliftDate') +
            ", status: " + ts_str(m['status']) + ", sourceUrl: " + ts_str(m['sourceUrl']) +
            ", lastVerifiedAt: " + ts_str(m['lastVerifiedAt']) +
            ", isEstimate: " + str(m['isEstimate']).lower() + opt('notes') + " },")

def emit_variant(v):
    return ("  { id: " + ts_str(v['id']) + ", modelId: " + ts_str(v['modelId']) +
            ", name: " + ts_str(v['name']) + ", fuelType: " + ts_str(v['fuelType']) +
            ", transmission: " + ts_str(v['transmission']) +
            ", exShowroomPrice: " + str(v['exShowroomPrice']) +
            ", availabilityStatus: " + ts_str(v['availabilityStatus']) +
            ", sourceUrl: " + ts_str(v['sourceUrl']) +
            ", lastVerifiedAt: " + ts_str(v['lastVerifiedAt']) +
            ", isEstimate: " + str(v['isEstimate']).lower() + " },")

with open(OUT_TS, 'w') as f:
    f.write("// ---------------------------------------------------------------------------\n")
    f.write("// VERIFIED DATASET - Phase 3, researched 2026-10-12, ₹10-25L segment.\n")
    f.write("//\n")
    f.write("// Every record carries its source_url and verification date. Prices with\n")
    f.write("// isEstimate=true come from automotive portals, NOT manufacturer price lists.\n")
    f.write("// NOTE: many portal tables predate the 22 Sep 2026 GST rate cut; figures may\n")
    f.write("// be marginally stale. See data-collection/VALIDATION.md and per-model notes.\n")
    f.write("// Generated by scripts/build-verified.py - do not hand-edit.\n")
    f.write("// ---------------------------------------------------------------------------\n\n")
    f.write("import type { CarModel, Maker, Variant } from './types';\n\n")
    f.write("export const VERIFIED_AT = '2026-10-12';\n")
    f.write("export const VERIFIED_NOTE =\n")
    f.write("  'Phase 3 verified inventory (researched 2026-10-12, ₹10-25L ex-showroom segment). ' +\n")
    f.write("  'Prices carry their source and verification date; portal-sourced prices are marked estimates. ' +\n")
    f.write("  'Many tables predate the 22 Sep 2026 GST cut and may be marginally stale.';\n\n")
    f.write("export const verifiedMakers: Maker[] = [\n")
    f.write("\n".join(emit_maker(makers[k]) for k in sorted(makers)) + "\n];\n\n")
    f.write("export const verifiedModels: CarModel[] = [\n")
    f.write("\n".join(emit_model(m) for m in models) + "\n];\n\n")
    f.write("export const verifiedVariants: Variant[] = [\n")
    f.write("\n".join(emit_variant(v) for v in variants) + "\n];\n")

official = sum(1 for v in variants if not v['isEstimate'])
with open(REPORT, 'w') as f:
    f.write(f"# Merge report - generated {date.today().isoformat()}\n\n")
    f.write(f"- Verified makers: {len(makers)}, models: {len(models)}, variants: {len(variants)}\n")
    f.write(f"- Official-source prices: {official} ({official/len(variants)*100:.1f}%)\n")
    f.write("- Strategy: verified models replace sample models with the same (maker_id, model_id); ")
    f.write("all other sample models are retained as labeled sample data.\n")

print(f"makers={len(makers)} models={len(models)} variants={len(variants)} official={official}")
print("wrote", OUT_TS)
