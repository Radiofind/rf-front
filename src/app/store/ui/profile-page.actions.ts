import { createActionGroup, emptyProps, props } from '@ngrx/store';

import type { StatisticsPeriodEnum } from '../../core/enums/statistics-period.enum';

export const ProfilePageActions = createActionGroup({
  source: 'Profile Page',
  events: {
    Opened: emptyProps(),
    'Avatar Changed': props<{ avatar: Blob | null }>(),
    'Statistics Opened': emptyProps(),
    'Statistics Period Selected': props<{ period: StatisticsPeriodEnum }>(),
    'Statistics Retry Clicked': emptyProps(),
  },
});
