import { Constants } from '../../../core/constants/constants';
import { DateFormatEnum } from '../../../core/enums/date-format.enum';

const DATE_FORMAT_OPTIONS: Readonly<Record<DateFormatEnum, Intl.DateTimeFormatOptions>> = {
  [DateFormatEnum.MONTH_YEAR]: {
    month: 'short',
    year: 'numeric',
  },
  [DateFormatEnum.FULL_DATE]: {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  },
};

export function transformStringToDate(stringDate: string): Date {
  const [year, month, day]: string[] = stringDate.split(Constants.DASH);
  return new Date(Number(year), Number(month) - Constants.ONE, Number(day));
}

export function transformDateToString(date: Date): string {
  const year: string = String(date.getFullYear());
  const month: string = String(date.getMonth() + Constants.ONE).padStart(
    Constants.DATE_PAD_LENGTH,
    Constants.ZERO_STRING,
  );
  const day: string = String(date.getDate()).padStart(
    Constants.DATE_PAD_LENGTH,
    Constants.ZERO_STRING,
  );

  return [year, month, day].join(Constants.DASH);
}

export function formatStringDate(
  stringDate: string,
  format: DateFormatEnum,
  locale: string,
): string {
  const [datePart = stringDate]: string[] = stringDate.split(Constants.SPLIT_DATE_BY_T);
  return new Intl.DateTimeFormat(locale, DATE_FORMAT_OPTIONS[format]).format(
    transformStringToDate(datePart),
  );
}
