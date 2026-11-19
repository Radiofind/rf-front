import { createActionGroup, emptyProps, props } from '@ngrx/store';

import type { StatisticsPeriodEnum } from '../../core/enums/statistics-period.enum';

export const StatisticsPageActions = createActionGroup({
  source: 'Statistics Page',
  events: {
    Opened: emptyProps(),
    'Period Selected': props<{ period: StatisticsPeriodEnum }>(),
    'Retry Clicked': emptyProps(),
  },
});
