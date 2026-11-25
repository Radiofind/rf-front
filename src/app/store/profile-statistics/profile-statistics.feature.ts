import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { DEFAULT_PROFILE_STATISTICS_PERIOD } from '../../features/constants/statistics.constant';
import { MainLayoutActions } from '../ui/main-layout.actions';
import { ProfilePageActions } from '../ui/profile-page.actions';
import { statisticsKpis } from '../shared/statistics-kpis';
import { ProfileStatisticsApiActions } from './profile-statistics.actions';

import type { StatisticsPeriodEnum } from '../../core/enums/statistics-period.enum';
import type { IStatistics } from '../../core/models/statistics.model';

export interface IProfileStatisticsState {
  period: StatisticsPeriodEnum;
  statistics: IStatistics | null;
  isLoading: boolean;
  hasLoadFailed: boolean;
}

export const initialProfileStatisticsState: IProfileStatisticsState = {
  period: DEFAULT_PROFILE_STATISTICS_PERIOD,
  statistics: null,
  isLoading: false,
  hasLoadFailed: false,
};

function loading(
  state: IProfileStatisticsState,
  changes: Partial<IProfileStatisticsState>,
): IProfileStatisticsState {
  return { ...state, ...changes, isLoading: true, hasLoadFailed: false };
}

export const profileStatisticsFeature = createFeature({
  name: 'profileStatistics',
  reducer: createReducer(
    initialProfileStatisticsState,
    on(
      ProfilePageActions.statisticsOpened,
      ProfilePageActions.statisticsRetryClicked,
      (state: IProfileStatisticsState): IProfileStatisticsState => loading(state, {}),
    ),
    on(
      ProfilePageActions.statisticsPeriodSelected,
      (
        state: IProfileStatisticsState,
        { period }: { period: StatisticsPeriodEnum },
      ): IProfileStatisticsState => loading(state, { period: period }),
    ),
    on(
      ProfileStatisticsApiActions.statisticsLoaded,
      (
        state: IProfileStatisticsState,
        { statistics }: { statistics: IStatistics },
      ): IProfileStatisticsState => ({
        ...state,
        statistics: statistics,
        isLoading: false,
        hasLoadFailed: false,
      }),
    ),
    on(
      ProfileStatisticsApiActions.statisticsLoadFailed,
      (state: IProfileStatisticsState): IProfileStatisticsState => ({
        ...state,
        isLoading: false,
        hasLoadFailed: true,
      }),
    ),
    on(MainLayoutActions.closed, (): IProfileStatisticsState => initialProfileStatisticsState),
  ),
  extraSelectors: ({ selectStatistics }) => ({
    selectKpis: createSelector(selectStatistics, statisticsKpis),
  }),
});
