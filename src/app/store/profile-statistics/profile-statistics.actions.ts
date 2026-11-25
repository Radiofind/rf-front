import { createActionGroup, emptyProps, props } from '@ngrx/store';

import type { IStatistics } from '../../core/models/statistics.model';

export const ProfileStatisticsApiActions = createActionGroup({
  source: 'Profile Statistics API',
  events: {
    'Statistics Loaded': props<{ statistics: IStatistics }>(),
    'Statistics Load Failed': emptyProps(),
  },
});
