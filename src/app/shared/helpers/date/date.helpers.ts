import { Constants } from '../../../core/constants/constants';
import { DATE_FORMAT_OPTIONS, RELATIVE_TIME_STEPS } from '../../constants/time.constants';

import type { IRelativeTime, IRelativeTimeStep } from '../../models/relative-time.model';
import type { DateFormatEnum } from '../../../core/enums/date-format.enum';

export function toRelativeTime(isoDate: string, now: Date): IRelativeTime {
  const date: Date = new Date(
    isoDate.replace(Constants.EXTRA_FRACTION_DIGITS_PATTERN, Constants.ISO_DATE_REPLACEMENT),
  );
  const elapsedSeconds: number = Math.max(
    Constants.ZERO,
    Math.floor((now.getTime() - date.getTime()) / Constants.MILLISECONDS_IN_ONE_SECOND),
  );

  const step: IRelativeTimeStep | undefined = RELATIVE_TIME_STEPS.find(
    ({ seconds }: IRelativeTimeStep) => elapsedSeconds >= seconds,
  );

  return step
    ? { value: -Math.floor(elapsedSeconds / step.seconds), unit: step.unit }
    : { value: Constants.ZERO - elapsedSeconds, unit: 'second' };
}

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
