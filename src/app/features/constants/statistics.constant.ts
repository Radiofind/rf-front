import { StatisticsPeriodEnum } from '../../core/enums/statistics-period.enum';

import type {
  IStatisticsKpiDefinition,
  IStatisticsPeriodTab,
} from '../models/statistics-view.model';

export const DEFAULT_STATISTICS_PERIOD: StatisticsPeriodEnum = StatisticsPeriodEnum.LAST_30_DAYS;

export const MONTHLY_STATISTICS_PERIODS: ReadonlySet<StatisticsPeriodEnum> = new Set([
  StatisticsPeriodEnum.LAST_12_MONTHS,
]);

export const STATISTICS_PERIOD_TABS: readonly IStatisticsPeriodTab[] = [
  { period: StatisticsPeriodEnum.LAST_7_DAYS, label: 'statistics.periods.last7Days' },
  { period: StatisticsPeriodEnum.LAST_30_DAYS, label: 'statistics.periods.last30Days' },
  { period: StatisticsPeriodEnum.LAST_12_MONTHS, label: 'statistics.periods.last12Months' },
];

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
