import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { provideState, provideStore, Store } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { of, throwError } from 'rxjs';
import { profileStatisticsFeature } from './profile-statistics.feature';
import * as profileStatisticsEffects from './profile-statistics.effects';
import { ProfilePageActions } from '../ui/profile-page.actions';
import { MainLayoutActions } from '../ui/main-layout.actions';
import { StatisticsService } from '../../features/services/statistics-service/statistics.service';
import { StatisticsPeriodEnum } from '../../core/enums/statistics-period.enum';
import { StatisticsGranularityEnum } from '../../core/enums/statistics-granularity.enum';

import type { IStatistics } from '../../core/models/statistics.model';

describe('profile statistics state', () => {
  const statistics: IStatistics = {
    period: StatisticsPeriodEnum.LAST_7_DAYS,
    granularity: StatisticsGranularityEnum.DAY,
    current: { plays: 120, downloads: 6, likes: 30, uniqueListeners: 40 },
    previous: { plays: 100, downloads: 0, likes: 40, uniqueListeners: 40 },
    timeline: [],
    genres: [],
    topTracks: [],
  };

  let getStatistics: ReturnType<typeof vi.fn>;

  const configure = (platform: string = 'browser'): Store => {
    TestBed.configureTestingModule({
      providers: [
        provideStore(),
        provideState(profileStatisticsFeature),
        provideEffects(profileStatisticsEffects),
        { provide: PLATFORM_ID, useValue: platform },
        { provide: StatisticsService, useValue: { getStatistics: getStatistics } },
      ],
    });
    return TestBed.inject<Store>(Store);
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    getStatistics = vi.fn().mockReturnValue(of(statistics));
  });

  it('loads the last 7 days when the statistics tab opens', () => {
    const store: Store = configure();

    store.dispatch(ProfilePageActions.statisticsOpened());

    expect(getStatistics).toHaveBeenCalledExactlyOnceWith(StatisticsPeriodEnum.LAST_7_DAYS);
    expect(store.selectSignal(profileStatisticsFeature.selectStatistics)()).toEqual(statistics);
  });

  it('loads the selected period', () => {
    const store: Store = configure();

    store.dispatch(
      ProfilePageActions.statisticsPeriodSelected({ period: StatisticsPeriodEnum.LAST_12_MONTHS }),
    );

    expect(getStatistics).toHaveBeenCalledExactlyOnceWith(StatisticsPeriodEnum.LAST_12_MONTHS);
    expect(store.selectSignal(profileStatisticsFeature.selectPeriod)()).toBe(
      StatisticsPeriodEnum.LAST_12_MONTHS,
    );
  });

  it('keeps the failure visible until the retry loads the statistics', () => {
    getStatistics.mockReturnValueOnce(throwError(() => new Error('offline')));
    const store: Store = configure();
    store.dispatch(ProfilePageActions.statisticsOpened());
    const failedBeforeRetry: boolean = store.selectSignal(
      profileStatisticsFeature.selectHasLoadFailed,
    )();

    store.dispatch(ProfilePageActions.statisticsRetryClicked());

    expect(failedBeforeRetry).toBe(true);
    expect(store.selectSignal(profileStatisticsFeature.selectHasLoadFailed)()).toBe(false);
    expect(store.selectSignal(profileStatisticsFeature.selectStatistics)()).toEqual(statistics);
  });

  it('does not load during server rendering', () => {
    const store: Store = configure('server');

    store.dispatch(ProfilePageActions.statisticsOpened());

    expect(getStatistics).not.toHaveBeenCalled();
  });

  it('forgets the statistics and the period when the layout closes', () => {
    const store: Store = configure();
    store.dispatch(
      ProfilePageActions.statisticsPeriodSelected({ period: StatisticsPeriodEnum.LAST_30_DAYS }),
    );

    store.dispatch(MainLayoutActions.closed());

    expect(store.selectSignal(profileStatisticsFeature.selectStatistics)()).toBeNull();
    expect(store.selectSignal(profileStatisticsFeature.selectPeriod)()).toBe(
      StatisticsPeriodEnum.LAST_7_DAYS,
    );
  });

  it('compares every figure with the previous period, unless there was nothing before', () => {
    const store: Store = configure();

    store.dispatch(ProfilePageActions.statisticsOpened());

    expect(
      store
        .selectSignal(profileStatisticsFeature.selectKpis)()
        .map((kpi) => [kpi.metric, kpi.value, kpi.change]),
    ).toEqual([
      ['plays', 120, 0.2],
      ['downloads', 6, null],
      ['likes', 30, -0.25],
      ['uniqueListeners', 40, 0],
    ]);
  });
});
