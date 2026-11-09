// EMI (equated monthly instalment) for a car loan, computed from the
// on-road price. Pure arithmetic - no external data. The loan amount is
// the on-road price minus the down payment; the rate and tenure are
// inputs on the page (defaults: 20% down, 9% per year, 5 years - edit to
// your loan offer). Reducing-balance formula:
//   EMI = P * r * (1+r)^n / ((1+r)^n - 1)
// where r is the monthly rate and n the number of months.

export interface EmiResult {
  loanAmount: number;
  monthlyEmi: number;
  totalInterest: number;
  totalPayable: number;
  months: number;
}

export function emiCalc(
  onRoadPrice: number,
  downPayment: number,
  annualRatePct: number,
  years: number,
): EmiResult {
  const loanAmount = Math.max(0, Math.round(onRoadPrice - downPayment));
  const months = Math.max(1, Math.round(years * 12));
  const r = annualRatePct / 100 / 12;
  let monthlyEmi: number;
  if (r <= 0) {
    monthlyEmi = loanAmount / months;
  } else {
    const factor = Math.pow(1 + r, months);
    monthlyEmi = (loanAmount * r * factor) / (factor - 1);
  }
  monthlyEmi = Math.round(monthlyEmi);
  const totalPayable = monthlyEmi * months;
  return {
    loanAmount,
    monthlyEmi,
    totalInterest: Math.max(0, totalPayable - loanAmount),
    totalPayable,
    months,
  };
}
