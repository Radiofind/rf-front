import { Constants } from '../../core/constants/constants';
import { DateFormatEnum } from '../../core/enums/date-format.enum';

import type { IRelativeTimeStep } from '../models/relative-time.model';

export const DATE_FORMAT_OPTIONS: Readonly<Record<DateFormatEnum, Intl.DateTimeFormatOptions>> = {
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

export const TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
};

const SECONDS_IN_HOUR: number = 60 * Constants.SECONDS_IN_MINUTE;

const SECONDS_IN_DAY: number = 24 * SECONDS_IN_HOUR;

const SECONDS_IN_WEEK: number = 7 * SECONDS_IN_DAY;

const SECONDS_IN_MONTH: number = 30 * SECONDS_IN_DAY;

const SECONDS_IN_YEAR: number = 365 * SECONDS_IN_DAY;

export const RELATIVE_TIME_STEPS: readonly IRelativeTimeStep[] = [
  { unit: 'year', seconds: SECONDS_IN_YEAR },
  { unit: 'month', seconds: SECONDS_IN_MONTH },
  { unit: 'week', seconds: SECONDS_IN_WEEK },
  { unit: 'day', seconds: SECONDS_IN_DAY },
  { unit: 'hour', seconds: SECONDS_IN_HOUR },
  { unit: 'minute', seconds: Constants.SECONDS_IN_MINUTE },
];
