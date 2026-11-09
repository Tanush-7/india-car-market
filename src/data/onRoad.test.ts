import { describe, expect, it } from 'vitest';
import { onRoadBreakdown, roadTaxRate } from './onRoad';

describe('Karnataka road-tax slabs', () => {
  it('uses 13% up to Rs 5 lakh, 14% above it up to Rs 10 lakh', () => {
    expect(roadTaxRate(500000, 'Petrol')).toBe(0.13);
    expect(roadTaxRate(500001, 'Petrol')).toBe(0.14);
    expect(roadTaxRate(1000000, 'Petrol')).toBe(0.14);
  });
  it('uses 17% above Rs 10 lakh up to Rs 20 lakh, 18% above', () => {
    expect(roadTaxRate(1000001, 'Petrol')).toBe(0.17);
    expect(roadTaxRate(2000000, 'Petrol')).toBe(0.17);
    expect(roadTaxRate(2000001, 'Petrol')).toBe(0.18);
  });
  it('uses the EV slabs 5% / 8% / 10%', () => {
    expect(roadTaxRate(1000000, 'Electric')).toBe(0.05);
    expect(roadTaxRate(1000001, 'Electric')).toBe(0.08);
    expect(roadTaxRate(2500000, 'Electric')).toBe(0.08);
    expect(roadTaxRate(2500001, 'Electric')).toBe(0.1);
  });
  it('treats diesel like petrol', () => {
    expect(roadTaxRate(800000, 'Diesel')).toBe(0.14);
  });
});

describe('on-road breakdown', () => {
  it('adds 11% cess on the tax, Rs 1,000 safety tax and Rs 1,600 fixed fees', () => {
    const b = onRoadBreakdown(800000, 'Petrol');
    expect(b.roadTax).toBe(112000);
    expect(b.cess).toBe(Math.round(112000 * 0.11));
    expect(b.roadSafetyTax).toBe(1000);
    expect(b.registration + b.hsrp + b.fastag).toBe(1600);
    expect(b.tcs).toBe(0);
    expect(b.total).toBe(
      800000 + b.roadTax + b.cess + 1000 + 1600 + b.insurance,
    );
  });
  it('adds 1% TCS only above Rs 10 lakh ex-showroom', () => {
    expect(onRoadBreakdown(1000000, 'Petrol').tcs).toBe(0);
    const b = onRoadBreakdown(1500000, 'Petrol');
    expect(b.tcs).toBe(15000);
  });
  it('labels first-year insurance as an estimate at ~3.5%', () => {
    const b = onRoadBreakdown(1000000, 'Petrol');
    expect(b.insurance).toBe(35000);
    expect(b.lines.find((l) => l.label.includes('insurance'))?.kind).toBe('estimate');
  });
  it('sums the lines to the total', () => {
    for (const [price, fuel] of [
      [559000, 'Petrol'],
      [3295000, 'Petrol'],
      [2179000, 'Electric'],
    ] as const) {
      const b = onRoadBreakdown(price, fuel);
      const lineSum = b.lines
        .filter((l) => !l.label.startsWith('On-road total'))
        .reduce((n, l) => n + l.amount, 0);
      expect(lineSum).toBe(b.total);
    }
  });
});
