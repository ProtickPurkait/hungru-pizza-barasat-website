const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

const plain = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** 125000 → "₹1,25,000" (Indian lakh grouping). */
export function formatINR(value: number): string {
  return inr.format(Math.round(value));
}

/** 1500 → "1,500" */
export function formatNumber(value: number): string {
  return plain.format(Math.round(value));
}

const longDate = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** "2026-10-10" → "10 October 2026". Anything that is not a YYYY-MM-DD date comes back unchanged. */
export function formatDate(iso: string): string {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T00:00:00Z`) : null;
  return date && !Number.isNaN(date.getTime()) ? longDate.format(date) : iso;
}
