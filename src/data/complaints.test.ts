import { describe, expect, it } from 'vitest';
import {
  COMPLAINTS_SOURCES,
  RECALLS_2025,
  RECALLS_2025_TOTAL,
  RECALLS_SINCE_2012_TOTAL,
} from './complaints';

describe('complaints / recall figures', () => {
  it('has a source for every figure shown', () => {
    expect(COMPLAINTS_SOURCES.length).toBeGreaterThanOrEqual(3);
    for (const s of COMPLAINTS_SOURCES) {
      expect(s.url).toMatch(/^https:\/\//);
    }
  });
  it('lists only positive 2025 recall counts that sum below the published total', () => {
    for (const r of RECALLS_2025) {
      expect(r.vehicles).toBeGreaterThan(0);
      expect(r.note.length).toBeGreaterThan(0);
    }
    const sum = RECALLS_2025.reduce((n, r) => n + r.vehicles, 0);
    expect(sum).toBeLessThan(RECALLS_2025_TOTAL);
  });
  it('keeps the cumulative total above the single-year total', () => {
    expect(RECALLS_SINCE_2012_TOTAL).toBeGreaterThan(RECALLS_2025_TOTAL);
  });
});
