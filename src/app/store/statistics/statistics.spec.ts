import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { provideState, provideStore, Store } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { of, throwError } from 'rxjs';
import { statisticsFeature } from './statistics.feature';
import * as statisticsEffects from './statistics.effects';
import { StatisticsPageActions } from '../ui/statistics-page.actions';
import { MainLayoutActions } from '../ui/main-layout.actions';
import { StatisticsService } from '../../features/services/statistics-service/statistics.service';
import { StatisticsPeriodEnum } from '../../core/enums/statistics-period.enum';
import { StatisticsGranularityEnum } from '../../core/enums/statistics-granularity.enum';

import type { IStatistics, ITopTrack } from '../../core/models/statistics.model';

describe('statistics state', () => {
  const statistics: IStatistics = {
    period: StatisticsPeriodEnum.LAST_30_DAYS,
    granularity: StatisticsGranularityEnum.DAY,
    current: { plays: 200, downloads: 12, likes: 30, uniqueListeners: 80 },
    previous: { plays: 160, downloads: 0, likes: 40, uniqueListeners: 80 },
    timeline: [],
    genres: [],
    topTracks: [],
  };

  const topTrack = (id: number, plays: number): ITopTrack => ({
    track: {
      id: id,
      title: `Track ${String(id)}`,
      artistName: 'Neon Lights',
      coverUrl: null,
      status: null,
    },
    plays: plays,
  });

  let getStatistics: ReturnType<typeof vi.fn>;

  const configure = (platform: string = 'browser'): Store => {
    TestBed.configureTestingModule({
      providers: [
        provideStore(),
        provideState(statisticsFeature),
        provideEffects(statisticsEffects),
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

  it('loads the last 30 days when the page opens', () => {
    const store: Store = configure();

    store.dispatch(StatisticsPageActions.opened());

    expect(getStatistics).toHaveBeenCalledExactlyOnceWith(StatisticsPeriodEnum.LAST_30_DAYS);
    expect(store.selectSignal(statisticsFeature.selectStatistics)()).toEqual(statistics);
  });

  it('loads the selected period', () => {
    const store: Store = configure();

    store.dispatch(
      StatisticsPageActions.periodSelected({ period: StatisticsPeriodEnum.LAST_24_HOURS }),
    );

    expect(getStatistics).toHaveBeenCalledExactlyOnceWith(StatisticsPeriodEnum.LAST_24_HOURS);
  });

  it('keeps the failure visible until the retry loads the statistics', () => {
    getStatistics.mockReturnValueOnce(throwError(() => new Error('offline')));
    const store: Store = configure();
    store.dispatch(StatisticsPageActions.opened());
    const failedBeforeRetry: boolean = store.selectSignal(statisticsFeature.selectHasLoadFailed)();

    store.dispatch(StatisticsPageActions.retryClicked());

    expect(failedBeforeRetry).toBe(true);
    expect(store.selectSignal(statisticsFeature.selectHasLoadFailed)()).toBe(false);
    expect(store.selectSignal(statisticsFeature.selectStatistics)()).toEqual(statistics);
  });

  it('does not load during server rendering', () => {
    const store: Store = configure('server');

    store.dispatch(StatisticsPageActions.opened());

    expect(getStatistics).not.toHaveBeenCalled();
  });

  it('forgets the statistics and the period when the layout closes', () => {
    const store: Store = configure();
    store.dispatch(
      StatisticsPageActions.periodSelected({ period: StatisticsPeriodEnum.LAST_7_DAYS }),
    );

    store.dispatch(MainLayoutActions.closed());

    expect(store.selectSignal(statisticsFeature.selectStatistics)()).toBeNull();
    expect(store.selectSignal(statisticsFeature.selectPeriod)()).toBe(
      StatisticsPeriodEnum.LAST_30_DAYS,
    );
  });

  it('compares every figure with the previous period, unless there was nothing before', () => {
    const store: Store = configure();

    store.dispatch(StatisticsPageActions.opened());

    expect(
      store
        .selectSignal(statisticsFeature.selectKpis)()
        .map((kpi) => [kpi.metric, kpi.value, kpi.change]),
    ).toEqual([
      ['plays', 200, 0.25],
      ['downloads', 12, null],
      ['likes', 30, -0.25],
      ['uniqueListeners', 80, 0],
    ]);
  });

  it('shows the four leading genres and pools the rest', () => {
    getStatistics.mockReturnValue(
      of({
        ...statistics,
        genres: [
          { genre: 'CHILLWAVE', plays: 50 },
          { genre: 'LO_FI', plays: 20 },
          { genre: 'DEEP_HOUSE', plays: 15 },
          { genre: 'TRIP_HOP', plays: 10 },
          { genre: 'SYNTHWAVE', plays: 3 },
          { genre: 'VAPORWAVE', plays: 2 },
        ],
      }),
    );
    const store: Store = configure();

    store.dispatch(StatisticsPageActions.opened());

    expect(
      store
        .selectSignal(statisticsFeature.selectGenreShares)()
        .map((share) => [share.genre, share.share]),
    ).toEqual([
      ['CHILLWAVE', 0.5],
      ['LO_FI', 0.2],
      ['DEEP_HOUSE', 0.15],
      ['TRIP_HOP', 0.1],
      [null, 0.05],
    ]);
  });

  it('splits all plays of the period between the leading tracks and the rest', () => {
    getStatistics.mockReturnValue(
      of({
        ...statistics,
        topTracks: [
          topTrack(1, 100),
          topTrack(2, 50),
          topTrack(3, 20),
          topTrack(4, 10),
          topTrack(5, 5),
        ],
      }),
    );
    const store: Store = configure();

    store.dispatch(StatisticsPageActions.opened());

    expect(
      store
        .selectSignal(statisticsFeature.selectTrackShares)()
        .map((share) => [share.track?.id ?? null, share.plays]),
    ).toEqual([
      [1, 100],
      [2, 50],
      [3, 20],
      [4, 10],
      [null, 20],
    ]);
  });

  it('adds no pooled part when the leading tracks hold every play', () => {
    getStatistics.mockReturnValue(
      of({
        ...statistics,
        current: { ...statistics.current, plays: 150 },
        topTracks: [topTrack(1, 100), topTrack(2, 50)],
      }),
    );
    const store: Store = configure();

    store.dispatch(StatisticsPageActions.opened());

    expect(store.selectSignal(statisticsFeature.selectTrackShares)()).toHaveLength(2);
  });
});
