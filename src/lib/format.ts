/** Indian-rupee formatting helpers. */

/** 1250000 -> "₹12,50,000" (Indian digit grouping). */
export function inr(rupees: number): string {
  return '₹' + Math.round(rupees).toLocaleString('en-IN');
}

/** 1250000 -> "₹12.50L". */
export function inrLakh(rupees: number, digits = 2): string {
  return '₹' + (rupees / 100000).toFixed(digits).replace(/\.?0+$/, '') + 'L';
}

/** Rupees -> lakh as a plain number. */
export function toLakh(rupees: number): number {
  return rupees / 100000;
}

/** "2024-01-16" -> "16 Jan 2024". */
export function fmtDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** "2024-01-16" -> "2024". */
export function yearOf(iso: string): string {
  return iso.slice(0, 4);
}
