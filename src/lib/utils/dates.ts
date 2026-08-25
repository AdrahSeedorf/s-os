/**
 * Formats a `YYYY-MM` content date for display.
 *
 * Shared rather than redefined per component: it was already duplicated in
 * three places, and the content model only ever claims month precision, so
 * this is the one place that needs to know that.
 */
export function formatMonth(value: string, style: 'long' | 'short' = 'long'): string {
  const [year, month] = value.split('-');
  if (!year) return value;
  if (!month) return year;

  const date = new Date(Number(year), Number(month) - 1, 1);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString(undefined, { month: style, year: 'numeric' });
}
