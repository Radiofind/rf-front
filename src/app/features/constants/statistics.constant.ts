import { DateFormatEnum } from '../../core/enums/date-format.enum';
import { StatisticsGranularityEnum } from '../../core/enums/statistics-granularity.enum';
import { StatisticsPeriodEnum } from '../../core/enums/statistics-period.enum';

import type {
  IStatisticsKpiDefinition,
  IStatisticsPeriodTab,
  ITimelineFormat,
} from '../models/statistics-view.model';

export const DEFAULT_STATISTICS_PERIOD: StatisticsPeriodEnum = StatisticsPeriodEnum.LAST_30_DAYS;

export const DEFAULT_PROFILE_STATISTICS_PERIOD: StatisticsPeriodEnum =
  StatisticsPeriodEnum.LAST_7_DAYS;

export const STATISTICS_PERIOD_TABS: readonly IStatisticsPeriodTab[] = [
  { period: StatisticsPeriodEnum.LAST_24_HOURS, label: 'statistics.periods.oneDay' },
  { period: StatisticsPeriodEnum.LAST_7_DAYS, label: 'statistics.periods.oneWeek' },
  { period: StatisticsPeriodEnum.LAST_30_DAYS, label: 'statistics.periods.oneMonth' },
  { period: StatisticsPeriodEnum.LAST_3_MONTHS, label: 'statistics.periods.threeMonths' },
  { period: StatisticsPeriodEnum.LAST_6_MONTHS, label: 'statistics.periods.sixMonths' },
  { period: StatisticsPeriodEnum.LAST_12_MONTHS, label: 'statistics.periods.oneYear' },
];

export const PROFILE_STATISTICS_PERIOD_TABS: readonly IStatisticsPeriodTab[] = [
  { period: StatisticsPeriodEnum.LAST_7_DAYS, label: 'statistics.periods.oneWeek' },
  { period: StatisticsPeriodEnum.LAST_30_DAYS, label: 'statistics.periods.oneMonth' },
  { period: StatisticsPeriodEnum.LAST_12_MONTHS, label: 'statistics.periods.oneYear' },
];

export const STATISTICS_PERIODS: ReadonlySet<string> = new Set<string>(
  Object.values(StatisticsPeriodEnum),
);

export const TIMELINE_FORMATS: Readonly<Record<StatisticsGranularityEnum, ITimelineFormat>> = {
  [StatisticsGranularityEnum.HOUR]: {
    subtitle: 'statistics.timeline.perHour',
    axisLabel: DateFormatEnum.HOUR,
    detail: DateFormatEnum.WEEKDAY_DATE_HOUR,
    detailLabel: null,
  },
  [StatisticsGranularityEnum.DAY]: {
    subtitle: 'statistics.timeline.perDay',
    axisLabel: DateFormatEnum.DAY_MONTH,
    detail: DateFormatEnum.WEEKDAY_DATE,
    detailLabel: null,
  },
  [StatisticsGranularityEnum.WEEK]: {
    subtitle: 'statistics.timeline.perWeek',
    axisLabel: DateFormatEnum.DAY_MONTH,
    detail: DateFormatEnum.FULL_DATE,
    detailLabel: 'statistics.timeline.weekOf',
  },
  [StatisticsGranularityEnum.MONTH]: {
    subtitle: 'statistics.timeline.perMonth',
    axisLabel: DateFormatEnum.MONTH,
    detail: DateFormatEnum.LONG_MONTH_YEAR,
    detailLabel: null,
  },
};

export const STATISTICS_KPIS: readonly IStatisticsKpiDefinition[] = [
  { metric: 'plays', label: 'statistics.kpis.plays', iconClass: 'bx bx-play' },
  { metric: 'downloads', label: 'statistics.kpis.downloads', iconClass: 'bx bx-arrow-down-circle' },
  { metric: 'likes', label: 'statistics.kpis.likes', iconClass: 'bx bx-heart' },
  {
    metric: 'uniqueListeners',
    label: 'statistics.kpis.uniqueListeners',
    iconClass: 'bx bx-broadcast',
  },
];

export const STATISTICS_GENRE_LEADERS: number = 4;

export const STATISTICS_TRACK_LEADERS: number = 4;

export const TIMELINE_AXIS_INTERVALS: number = 4;

export const TIMELINE_LABEL_COUNT: number = 6;

export const DONUT_SEGMENT_GAP: number = 0.8;
