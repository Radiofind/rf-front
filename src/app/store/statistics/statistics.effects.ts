import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { concatLatestFrom } from '@ngrx/operators';
import { catchError, filter, map, of, switchMap } from 'rxjs';
import { StatisticsService } from '../../features/services/statistics-service/statistics.service';
import { StatisticsPageActions } from '../ui/statistics-page.actions';
import { untilLayoutClosed } from '../shared/session.operators';
import { StatisticsApiActions } from './statistics.actions';
import { statisticsFeature } from './statistics.feature';

import type { Action } from '@ngrx/store';
import type { StatisticsPeriodEnum } from '../../core/enums/statistics-period.enum';
import type { IStatistics } from '../../core/models/statistics.model';

export const loadStatistics = createEffect(
  (
    actions$: Actions = inject(Actions),
    store: Store = inject(Store),
    statisticsService: StatisticsService = inject(StatisticsService),
    platformId: object = inject(PLATFORM_ID),
  ) => {
    return actions$.pipe(
      ofType(
        StatisticsPageActions.opened,
        StatisticsPageActions.periodSelected,
        StatisticsPageActions.retryClicked,
      ),
      filter(() => isPlatformBrowser(platformId)),
      concatLatestFrom(() => store.select(statisticsFeature.selectPeriod)),
      switchMap(([, period]: [Action, StatisticsPeriodEnum]) =>
        statisticsService.getStatistics(period).pipe(
          map((statistics: IStatistics) =>
            StatisticsApiActions.statisticsLoaded({ statistics: statistics }),
          ),
          catchError(() => of(StatisticsApiActions.statisticsLoadFailed())),
          untilLayoutClosed(actions$),
        ),
      ),
    );
  },
  { functional: true },
);
