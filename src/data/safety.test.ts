import { describe, expect, it } from 'vitest';
import { agencyLabel, safetyForModel, stars } from './safety';

describe('safety ratings', () => {
  it('returns the BNCAP 5-star rating for the Punch with scores', () => {
    const s = safetyForModel('punch');
    expect(s?.agency).toBe('BNCAP');
    expect(s?.adultStars).toBe(5);
    expect(s?.childStars).toBe(5);
    expect(s?.aop).toBe(30.58);
    expect(s?.cop).toBe(45);
  });
  it('returns the Baleno 4-star adult / 3-star child split', () => {
    const s = safetyForModel('baleno');
    expect(s?.adultStars).toBe(4);
    expect(s?.childStars).toBe(3);
  });
  it('returns the GNCAP 1-star rating for the Swift', () => {
    const s = safetyForModel('swift');
    expect(s?.agency).toBe('GNCAP');
    expect(s?.adultStars).toBe(1);
    expect(s?.childStars).toBe(1);
  });
  it('returns the old-protocol GNCAP 3-star rating for the Creta', () => {
    const s = safetyForModel('creta');
    expect(s?.agency).toBe('GNCAP-old');
    expect(s?.adultStars).toBe(3);
  });
  it('returns null for models never crash-tested', () => {
    expect(safetyForModel('elevate')).toBeNull();
    expect(safetyForModel('grand-vitara')).toBeNull();
    expect(safetyForModel('fronx')).toBeNull();
  });
  it('labels agencies and renders stars', () => {
    expect(agencyLabel('BNCAP')).toBe('Bharat NCAP');
    expect(agencyLabel('GNCAP')).toBe('Global NCAP');
    expect(agencyLabel('GNCAP-old')).toContain('old protocol');
    expect(stars(5)).toBe('★★★★★');
    expect(stars(3)).toBe('★★★☆☆');
  });
});
