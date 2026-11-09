import { describe, expect, it } from 'vitest';
import { maintenanceForModel } from './maintenance';

describe('maintenance segment mapping', () => {
  it('maps electric-only models to the EV segment', () => {
    expect(maintenanceForModel('SUV', 2179000, ['Electric']).key).toBe('ev');
  });
  it('maps cheap hatchbacks to entry, dearer ones to premium', () => {
    expect(maintenanceForModel('Hatchback', 500000, ['Petrol']).key).toBe('entryHatch');
    expect(maintenanceForModel('Hatchback', 900000, ['Petrol']).key).toBe('premiumHatch');
  });
  it('maps sedans by the Rs 12 lakh line', () => {
    expect(maintenanceForModel('Sedan', 900000, ['Petrol']).key).toBe('compactSedan');
    expect(maintenanceForModel('Sedan', 1500000, ['Petrol']).key).toBe('midSedan');
  });
  it('maps SUVs by price, diesel to the turbo/diesel segment', () => {
    expect(maintenanceForModel('SUV', 800000, ['Petrol']).key).toBe('sub4mSuv');
    expect(maintenanceForModel('SUV', 1500000, ['Petrol']).key).toBe('midSuvNa');
    expect(maintenanceForModel('SUV', 1500000, ['Diesel']).key).toBe('midSuvTurboDiesel');
    expect(maintenanceForModel('SUV', 2500000, ['Diesel']).key).toBe('largeSuv');
  });
  it('keeps every segment range plausible (low < high, within Rs 10k-50k)', () => {
    for (const body of ['Hatchback', 'Sedan', 'SUV', 'MPV', 'Off-road', 'Coupe', 'Crossover'] as const) {
      for (const price of [400000, 900000, 1500000, 3000000]) {
        const s = maintenanceForModel(body, price, ['Petrol']);
        expect(s.low).toBeLessThan(s.high);
        expect(s.low).toBeGreaterThanOrEqual(10000);
        expect(s.high).toBeLessThanOrEqual(50000);
      }
    }
  });
});
