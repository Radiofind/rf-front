import { afterEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { StatisticsPageComponent } from './statistics-page.component';
import { StatisticsPageActions } from '../../../store/ui/statistics-page.actions';
import { initialStatisticsState } from '../../../store/statistics/statistics.feature';
import { StatisticsPeriodEnum } from '../../../core/enums/statistics-period.enum';
import { StatisticsGranularityEnum } from '../../../core/enums/statistics-granularity.enum';

import type { ComponentFixture } from '@angular/core/testing';
import type { IStatistics } from '../../../core/models/statistics.model';
import type { IStatisticsState } from '../../../store/statistics/statistics.feature';

describe('StatisticsPageComponent', () => {
  const statistics: IStatistics = {
    period: StatisticsPeriodEnum.LAST_30_DAYS,
    granularity: StatisticsGranularityEnum.DAY,
    current: { plays: 48200, downloads: 6900, likes: 3000, uniqueListeners: 19800 },
    previous: { plays: 40000, downloads: 0, likes: 3000, uniqueListeners: 20000 },
    timeline: [{ start: '2026-11-19T00:00:00', plays: 120, downloads: 4 }],
    genres: [{ genre: 'CHILLWAVE', plays: 48200 }],
    topTracks: [],
  };

  const createFixture = async (
    state: Partial<IStatisticsState>,
  ): Promise<ComponentFixture<StatisticsPageComponent>> => {
    await TestBed.configureTestingModule({
      imports: [StatisticsPageComponent],
      providers: [
        provideMockStore({ initialState: { statistics: { ...initialStatisticsState, ...state } } }),
      ],
    }).compileComponents();

    const fixture: ComponentFixture<StatisticsPageComponent> =
      TestBed.createComponent(StatisticsPageComponent);
    await fixture.whenStable();

    return fixture;
  };

  const element = (fixture: ComponentFixture<StatisticsPageComponent>): HTMLElement =>
    fixture.nativeElement as HTMLElement;

  const tab = (
    fixture: ComponentFixture<StatisticsPageComponent>,
    label: string,
  ): HTMLButtonElement | undefined =>
    Array.from(element(fixture).querySelectorAll<HTMLButtonElement>('.statistics__tab')).find(
      (button: HTMLButtonElement) => button.textContent.trim() === label,
    );

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads the statistics when the page opens', async () => {
    const dispatch = vi.spyOn(MockStore.prototype, 'dispatch');

    await createFixture({});

    expect(dispatch).toHaveBeenCalledWith(StatisticsPageActions.opened());
  });

  it('shows placeholders until the first statistics arrive', async () => {
    const fixture: ComponentFixture<StatisticsPageComponent> = await createFixture({
      isLoading: true,
    });

    expect(element(fixture).querySelector('app-statistics-skeleton')).not.toBeNull();
    expect(element(fixture).querySelector('.kpi')).toBeNull();
  });

  it('shows every key figure of the period', async () => {
    const fixture: ComponentFixture<StatisticsPageComponent> = await createFixture({
      statistics: statistics,
    });

    const figures: string[] = Array.from(
      element(fixture).querySelectorAll('.kpi'),
      (card: Element) =>
        `${card.querySelector('.kpi__label')?.textContent.trim() ?? ''} ${card.querySelector('.kpi__value')?.textContent.trim() ?? ''}`,
    );

    expect(figures).toEqual([
      'Total plays 48.2K',
      'Downloads 6.9K',
      'Likes 3K',
      'Unique listeners 19.8K',
    ]);
  });

  it('loads another period once it is chosen', async () => {
    const fixture: ComponentFixture<StatisticsPageComponent> = await createFixture({
      statistics: statistics,
    });
    const dispatch = vi.spyOn(TestBed.inject(MockStore), 'dispatch');

    tab(fixture, '3 Months')?.click();

    expect(dispatch).toHaveBeenCalledExactlyOnceWith(
      StatisticsPageActions.periodSelected({ period: StatisticsPeriodEnum.LAST_3_MONTHS }),
    );
  });

  it('does not reload the period already shown', async () => {
    const fixture: ComponentFixture<StatisticsPageComponent> = await createFixture({
      statistics: statistics,
    });
    const dispatch = vi.spyOn(TestBed.inject(MockStore), 'dispatch');

    tab(fixture, '1 Month')?.click();

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('offers to load again when the statistics could not be loaded', async () => {
    const fixture: ComponentFixture<StatisticsPageComponent> = await createFixture({
      hasLoadFailed: true,
    });
    const dispatch = vi.spyOn(TestBed.inject(MockStore), 'dispatch');

    element(fixture).querySelector<HTMLButtonElement>('.statistics__failure button')?.click();

    expect(element(fixture).querySelector('.statistics__failure')?.textContent).toContain(
      'We could not load your statistics',
    );
    expect(dispatch).toHaveBeenCalledExactlyOnceWith(StatisticsPageActions.retryClicked());
  });

  it('offers every period from one day to one year', async () => {
    const fixture: ComponentFixture<StatisticsPageComponent> = await createFixture({});

    expect(
      Array.from(element(fixture).querySelectorAll('.statistics__tab'), (button: Element) =>
        button.textContent.trim(),
      ),
    ).toEqual(['1 Day', '1 Week', '1 Month', '3 Months', '6 Months', '1 Year']);
  });

  it.each([
    [StatisticsGranularityEnum.HOUR, 'Plays and downloads per hour'],
    [StatisticsGranularityEnum.DAY, 'Plays and downloads per day'],
    [StatisticsGranularityEnum.WEEK, 'Plays and downloads per week'],
    [StatisticsGranularityEnum.MONTH, 'Plays and downloads per month'],
  ])('describes a timeline split by %s', async (granularity, subtitle) => {
    const fixture: ComponentFixture<StatisticsPageComponent> = await createFixture({
      statistics: { ...statistics, granularity: granularity },
    });

    expect(element(fixture).querySelector('.statistics__card-subtitle')?.textContent.trim()).toBe(
      subtitle,
    );
  });
});
