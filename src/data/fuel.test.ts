import { describe, expect, it } from 'vitest';
import { defaultMileage, fuelPriceFor, fuelPricesFor, monthlyFuelCost } from './fuel';
import { emiCalc } from './emi';

describe('fuel prices', () => {
  it('uses the verified November 2026 Bengaluru prices', () => {
    const p = fuelPricesFor('bengaluru');
    expect(p.petrol).toBe(111.68);
    expect(p.diesel).toBe(99.56);
    expect(p.cng).toBe(99.0);
    expect(p.cngVerified).toBe(true);
  });
  it('uses Delhi petrol 102.12 and CNG 86.98', () => {
    expect(fuelPriceFor('Petrol', 'delhi').price).toBe(102.12);
    expect(fuelPriceFor('CNG', 'delhi').price).toBe(86.98);
    expect(fuelPriceFor('CNG', 'delhi').verified).toBe(true);
  });
  it('flags unverified CNG defaults as approximate', () => {
    expect(fuelPriceFor('CNG', 'chennai').verified).toBe(false);
    expect(fuelPriceFor('CNG', 'hyderabad').verified).toBe(false);
  });
  it('prices electricity per unit for EVs', () => {
    const f = fuelPriceFor('Electric', 'bengaluru');
    expect(f.price).toBe(7.0);
    expect(f.unit).toBe('unit (kWh)');
  });
  it('treats Hybrid fuel cost on petrol', () => {
    expect(fuelPriceFor('Hybrid', 'bengaluru').price).toBe(111.68);
  });
});

describe('mileage defaults', () => {
  it('gives EVs km/kWh and CNG km/kg', () => {
    expect(defaultMileage('SUV', 1500000, 'Electric')).toMatchObject({ value: 6, unit: 'km/kWh' });
    expect(defaultMileage('Hatchback', 600000, 'CNG')).toMatchObject({ value: 26, unit: 'km/kg' });
  });
  it('gives diesel a higher default than petrol in the same segment', () => {
    const petrol = defaultMileage('SUV', 1500000, 'Petrol').value;
    const diesel = defaultMileage('SUV', 1500000, 'Diesel').value;
    expect(diesel).toBeGreaterThan(petrol);
  });
});

describe('monthly fuel cost', () => {
  it('divides km by mileage and multiplies by the fuel price', () => {
    expect(monthlyFuelCost(1000, 20, 111.68)).toBe(5584);
    expect(monthlyFuelCost(0, 20, 111.68)).toBe(0);
  });
});

describe('EMI', () => {
  it('computes a reducing-balance EMI', () => {
    const r = emiCalc(1000000, 200000, 9, 5);
    expect(r.loanAmount).toBe(800000);
    expect(r.months).toBe(60);
    // 800k at 9% for 60 months: EMI about Rs 16,607.
    expect(r.monthlyEmi).toBeGreaterThan(16000);
    expect(r.monthlyEmi).toBeLessThan(17000);
    expect(r.totalInterest).toBe(r.monthlyEmi * 60 - 800000);
    expect(r.totalPayable).toBe(r.monthlyEmi * 60);
  });
  it('handles a zero interest rate as a straight split', () => {
    const r = emiCalc(600000, 0, 0, 5);
    expect(r.monthlyEmi).toBe(10000);
    expect(r.totalInterest).toBe(0);
  });
  it('never goes negative when the down payment exceeds the price', () => {
    const r = emiCalc(500000, 600000, 9, 5);
    expect(r.loanAmount).toBe(0);
    expect(r.monthlyEmi).toBe(0);
  });
});
