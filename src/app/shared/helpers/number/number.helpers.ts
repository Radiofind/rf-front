const COMPACT_NUMBER_OPTIONS: Intl.NumberFormatOptions = {
  notation: 'compact',
  maximumFractionDigits: 1,
};

const FILE_SIZE_OPTIONS: Intl.NumberFormatOptions = {
  style: 'unit',
  unit: 'megabyte',
  maximumFractionDigits: 1,
};

const BYTES_IN_MEGABYTE: number = 1024 * 1024;

export function formatCompactNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, COMPACT_NUMBER_OPTIONS).format(value);
}

export function formatFileSize(bytes: number, locale: string): string {
  return new Intl.NumberFormat(locale, FILE_SIZE_OPTIONS).format(bytes / BYTES_IN_MEGABYTE);
}
