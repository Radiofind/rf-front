import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { Constants } from '../../core/constants/constants';
import {
  DEFAULT_STATISTICS_PERIOD,
  STATISTICS_GENRE_LEADERS,
  STATISTICS_KPIS,
  STATISTICS_TRACK_LEADERS,
} from '../../features/constants/statistics.constant';
import { GENRE_LABELS } from '../../features/constants/my-uploads.constant';
import { relativeChange, topShares } from '../../shared/helpers/statistics/statistics.helpers';
import { MainLayoutActions } from '../ui/main-layout.actions';
import { StatisticsPageActions } from '../ui/statistics-page.actions';
import { StatisticsApiActions } from './statistics.actions';

import type { StatisticsPeriodEnum } from '../../core/enums/statistics-period.enum';
import type {
  IGenrePlays,
  IStatistics,
  ITimelinePoint,
  ITopTrack,
} from '../../core/models/statistics.model';
import type {
  IGenreShare,
  IStatisticsKpi,
  IStatisticsKpiDefinition,
  ITrackShare,
} from '../../features/models/statistics-view.model';
import type { IShare, ITopShare } from '../../shared/models/top-share.model';

export interface IStatisticsState {
  period: StatisticsPeriodEnum;
  statistics: IStatistics | null;
  isLoading: boolean;
  hasLoadFailed: boolean;
}

export const initialStatisticsState: IStatisticsState = {
  period: DEFAULT_STATISTICS_PERIOD,
  statistics: null,
  isLoading: false,
  hasLoadFailed: false,
};

function loading(state: IStatisticsState, changes: Partial<IStatisticsState>): IStatisticsState {
  return { ...state, ...changes, isLoading: true, hasLoadFailed: false };
}

function genreShares(genres: readonly IGenrePlays[]): IGenreShare[] {
  const total: number = genres.reduce(
    (sum: number, genre: IGenrePlays) => sum + genre.plays,
    Constants.ZERO,
  );
  const shares: ITopShare<IGenrePlays> = topShares(
    genres,
    STATISTICS_GENRE_LEADERS,
    total,
    (genre: IGenrePlays) => genre.plays,
  );
  const leaders: IGenreShare[] = shares.leaders.map(
    ({ item, value, share }: IShare<IGenrePlays>): IGenreShare => ({
      genre: item.genre,
      label: GENRE_LABELS.get(item.genre) ?? 'statistics.genres.unknown',
      plays: value,
      share: share,
    }),
  );

  return shares.restValue > Constants.ZERO
    ? [
        ...leaders,
        {
          genre: null,
          label: 'statistics.genres.other',
          plays: shares.restValue,
          share: shares.restShare,
        },
      ]
    : leaders;
}

function trackShares(topTracks: readonly ITopTrack[], totalPlays: number): ITrackShare[] {
  const shares: ITopShare<ITopTrack> = topShares(
    topTracks,
    STATISTICS_TRACK_LEADERS,
    totalPlays,
    (top: ITopTrack) => top.plays,
  );
  const leaders: ITrackShare[] = shares.leaders.map(
    ({ item, value, share }: IShare<ITopTrack>): ITrackShare => ({
      track: item.track,
      plays: value,
      share: share,
    }),
  );

  return shares.restValue > Constants.ZERO
    ? [...leaders, { track: null, plays: shares.restValue, share: shares.restShare }]
    : leaders;
}

export const statisticsFeature = createFeature({
  name: 'statistics',
  reducer: createReducer(
    initialStatisticsState,
    on(
      StatisticsPageActions.opened,
      StatisticsPageActions.retryClicked,
      (state: IStatisticsState): IStatisticsState => loading(state, {}),
    ),
    on(
      StatisticsPageActions.periodSelected,
      (state: IStatisticsState, { period }: { period: StatisticsPeriodEnum }): IStatisticsState =>
        loading(state, { period: period }),
    ),
    on(
      StatisticsApiActions.statisticsLoaded,
      (state: IStatisticsState, { statistics }: { statistics: IStatistics }): IStatisticsState => ({
        ...state,
        statistics: statistics,
        isLoading: false,
        hasLoadFailed: false,
      }),
    ),
    on(
      StatisticsApiActions.statisticsLoadFailed,
      (state: IStatisticsState): IStatisticsState => ({
        ...state,
        isLoading: false,
        hasLoadFailed: true,
      }),
    ),
    on(MainLayoutActions.closed, (): IStatisticsState => initialStatisticsState),
  ),
  extraSelectors: ({ selectStatistics }) => ({
    selectKpis: createSelector(
      selectStatistics,
      (statistics: IStatistics | null): IStatisticsKpi[] =>
        statistics
          ? STATISTICS_KPIS.map(
              (definition: IStatisticsKpiDefinition): IStatisticsKpi => ({
                ...definition,
                value: statistics.current[definition.metric],
                change: relativeChange(
                  statistics.current[definition.metric],
                  statistics.previous[definition.metric],
                ),
              }),
            )
          : [],
    ),
    selectTimeline: createSelector(
      selectStatistics,
      (statistics: IStatistics | null): readonly ITimelinePoint[] => statistics?.timeline ?? [],
    ),
    selectGenreShares: createSelector(
      selectStatistics,
      (statistics: IStatistics | null): IGenreShare[] => genreShares(statistics?.genres ?? []),
    ),
    selectTopTracks: createSelector(
      selectStatistics,
      (statistics: IStatistics | null): readonly ITopTrack[] => statistics?.topTracks ?? [],
    ),
    selectTrackShares: createSelector(
      selectStatistics,
      (statistics: IStatistics | null): ITrackShare[] =>
        trackShares(statistics?.topTracks ?? [], statistics?.current.plays ?? Constants.ZERO),
    ),
    selectTotalPlays: createSelector(
      selectStatistics,
      (statistics: IStatistics | null): number => statistics?.current.plays ?? Constants.ZERO,
    ),
  }),
});
