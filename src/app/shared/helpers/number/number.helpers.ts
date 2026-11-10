const COMPACT_NUMBER_OPTIONS: Intl.NumberFormatOptions = {
  notation: 'compact',
  maximumFractionDigits: 1,
};

export function formatCompactNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, COMPACT_NUMBER_OPTIONS).format(value);
}
