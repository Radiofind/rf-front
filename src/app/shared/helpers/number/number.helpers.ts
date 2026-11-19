const COMPACT_NUMBER_OPTIONS: Intl.NumberFormatOptions = {
  notation: 'compact',
  maximumFractionDigits: 1,
};

const FILE_SIZE_OPTIONS: Intl.NumberFormatOptions = {
  style: 'unit',
  unit: 'megabyte',
  maximumFractionDigits: 1,
};

const PERCENT_OPTIONS: Intl.NumberFormatOptions = {
  style: 'percent',
  maximumFractionDigits: 1,
};

const SIGNED_PERCENT_OPTIONS: Intl.NumberFormatOptions = {
  ...PERCENT_OPTIONS,
  signDisplay: 'exceptZero',
};

const BYTES_IN_MEGABYTE: number = 1024 * 1024;

export function formatCompactNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, COMPACT_NUMBER_OPTIONS).format(value);
}

export function formatFileSize(bytes: number, locale: string): string {
  return new Intl.NumberFormat(locale, FILE_SIZE_OPTIONS).format(bytes / BYTES_IN_MEGABYTE);
}

export function formatPercent(ratio: number, locale: string, signed: boolean = false): string {
  return new Intl.NumberFormat(locale, signed ? SIGNED_PERCENT_OPTIONS : PERCENT_OPTIONS).format(
    ratio,
  );
}
