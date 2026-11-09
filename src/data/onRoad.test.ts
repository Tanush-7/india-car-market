import { describe, expect, it } from 'vitest';
import { CITIES, cityById, onRoadBreakdown, onRoadTotal, roadTaxRate } from './onRoad';

describe('multi-city road-tax slabs', () => {
  it('keeps the Karnataka slabs for Bengaluru', () => {
    expect(roadTaxRate(500000, 'Petrol', 'bengaluru')).toBe(0.13);
    expect(roadTaxRate(1500000, 'Petrol', 'bengaluru')).toBe(0.17);
    expect(roadTaxRate(1000000, 'Electric', 'bengaluru')).toBe(0.05);
  });
  it('uses Delhi petrol 4/7/10 and diesel 4/5/8.75/12.5', () => {
    expect(roadTaxRate(500000, 'Petrol', 'delhi')).toBe(0.04);
    expect(roadTaxRate(800000, 'Petrol', 'delhi')).toBe(0.07);
    expect(roadTaxRate(1500000, 'Petrol', 'delhi')).toBe(0.1);
    expect(roadTaxRate(500000, 'Diesel', 'delhi')).toBe(0.05);
    expect(roadTaxRate(800000, 'Diesel', 'delhi')).toBe(0.0875);
    expect(roadTaxRate(1500000, 'Diesel', 'delhi')).toBe(0.125);
    expect(roadTaxRate(1500000, 'Electric', 'delhi')).toBe(0);
  });
  it('uses Maharashtra petrol 11/12/13, diesel +2pp, CNG 7/8/9', () => {
    expect(roadTaxRate(800000, 'Petrol', 'mumbai')).toBe(0.11);
    expect(roadTaxRate(1500000, 'Petrol', 'mumbai')).toBe(0.12);
    expect(roadTaxRate(2500000, 'Petrol', 'mumbai')).toBe(0.13);
    expect(roadTaxRate(800000, 'Diesel', 'mumbai')).toBe(0.13);
    expect(roadTaxRate(800000, 'CNG', 'mumbai')).toBe(0.07);
    expect(roadTaxRate(800000, 'Petrol', 'pune')).toBe(0.11);
    expect(roadTaxRate(800000, 'Electric', 'mumbai')).toBe(0);
  });
  it('uses Tamil Nadu 12/13/18/20 for Chennai', () => {
    expect(roadTaxRate(400000, 'Petrol', 'chennai')).toBe(0.12);
    expect(roadTaxRate(800000, 'Petrol', 'chennai')).toBe(0.13);
    expect(roadTaxRate(1500000, 'Petrol', 'chennai')).toBe(0.18);
    expect(roadTaxRate(2500000, 'Petrol', 'chennai')).toBe(0.2);
    expect(roadTaxRate(1500000, 'Electric', 'chennai')).toBe(0);
  });
  it('uses Telangana 13/14/17/18 for Hyderabad', () => {
    expect(roadTaxRate(400000, 'Petrol', 'hyderabad')).toBe(0.13);
    expect(roadTaxRate(800000, 'Petrol', 'hyderabad')).toBe(0.14);
    expect(roadTaxRate(1500000, 'Petrol', 'hyderabad')).toBe(0.17);
    expect(roadTaxRate(2500000, 'Petrol', 'hyderabad')).toBe(0.18);
  });
  it('uses West Bengal flat 10% with a Rs 40,000 minimum for Kolkata', () => {
    expect(roadTaxRate(800000, 'Petrol', 'kolkata')).toBe(0.1);
    expect(onRoadBreakdown(300000, 'Petrol', 'kolkata').roadTax).toBe(40000);
    expect(onRoadBreakdown(800000, 'Petrol', 'kolkata').roadTax).toBe(80000);
  });
  it('treats Hybrid like petrol everywhere', () => {
    for (const c of CITIES) {
      expect(roadTaxRate(800000, 'Hybrid', c.id)).toBe(roadTaxRate(800000, 'Petrol', c.id));
    }
  });
  it('falls back to Bengaluru for an unknown city id', () => {
    expect(cityById('nowhere').id).toBe('bengaluru');
    expect(roadTaxRate(800000, 'Petrol', 'nowhere')).toBe(0.14);
  });
});

describe('multi-city on-road breakdown', () => {
  it('adds Delhi MCD parking of Rs 4,000 at Rs 8 lakh', () => {
    const b = onRoadBreakdown(800000, 'Petrol', 'delhi');
    expect(b.roadTax).toBe(56000);
    expect(b.extras).toEqual([{ label: 'MCD one-time parking fee', amount: 4000 }]);
    expect(b.total).toBe(800000 + 56000 + 4000 + 1600 + b.insurance);
  });
  it('adds the Maharashtra 2% infrastructure levy', () => {
    const b = onRoadBreakdown(800000, 'Petrol', 'mumbai');
    expect(b.roadTax).toBe(88000);
    expect(b.extras[0].amount).toBe(Math.round(88000 * 0.02));
  });
  it('adds Tamil Nadu Rs 1,500 road safety tax and Telangana Rs 5,000 cess', () => {
    expect(onRoadBreakdown(800000, 'Petrol', 'chennai').extras).toEqual([
      { label: 'Road safety tax', amount: 1500 },
    ]);
    expect(onRoadBreakdown(800000, 'Petrol', 'hyderabad').extras).toEqual([
      { label: 'Road safety cess (from 1 Mar 2026)', amount: 5000 },
    ]);
  });
  it('keeps Bengaluru cess and safety tax', () => {
    const b = onRoadBreakdown(800000, 'Petrol', 'bengaluru');
    expect(b.extras).toEqual([
      { label: 'Cess (11% of road tax)', amount: Math.round(112000 * 0.11) },
      { label: 'Road safety tax', amount: 1000 },
    ]);
    expect(b.total).toBe(800000 + 112000 + Math.round(112000 * 0.11) + 1000 + 1600 + b.insurance);
  });
  it('sums the lines to the total in every city', () => {
    for (const c of CITIES) {
      for (const [price, fuel] of [
        [559000, 'Petrol'],
        [1500000, 'Diesel'],
        [2179000, 'Electric'],
      ] as const) {
        const b = onRoadBreakdown(price, fuel, c.id);
        const lineSum = b.lines
          .filter((l) => !l.label.startsWith('On-road total'))
          .reduce((n, l) => n + l.amount, 0);
        expect(lineSum).toBe(b.total);
      }
    }
  });
  it('onRoadTotal defaults to Bengaluru and matches the breakdown', () => {
    expect(onRoadTotal(800000, 'Petrol')).toBe(onRoadBreakdown(800000, 'Petrol').total);
    expect(onRoadTotal(800000, 'Petrol', 'delhi')).toBe(
      onRoadBreakdown(800000, 'Petrol', 'delhi').total,
    );
  });
});
