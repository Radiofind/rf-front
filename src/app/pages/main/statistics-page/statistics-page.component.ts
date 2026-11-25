import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { StatisticsKpiCardComponent } from '../../../features/components/statistics/statistics-kpi-card/statistics-kpi-card.component';
import { PlaysTimelineChartComponent } from '../../../features/components/statistics/plays-timeline-chart/plays-timeline-chart.component';
import { GenreShareListComponent } from '../../../features/components/statistics/genre-share-list/genre-share-list.component';
import { TopTracksListComponent } from '../../../features/components/statistics/top-tracks-list/top-tracks-list.component';
import { TrackShareDonutComponent } from '../../../features/components/statistics/track-share-donut/track-share-donut.component';
import { StatisticsSkeletonComponent } from '../../../features/components/statistics/statistics-skeleton/statistics-skeleton.component';
import {
  STATISTICS_PERIOD_TABS,
  TIMELINE_FORMATS,
} from '../../../features/constants/statistics.constant';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { TranslatePipe } from '../../../shared/pipes/translate/translate.pipe';
import { StatisticsPageActions } from '../../../store/ui/statistics-page.actions';
import { statisticsFeature } from '../../../store/statistics/statistics.feature';

import type { OnInit, Signal } from '@angular/core';
import type { StatisticsGranularityEnum } from '../../../core/enums/statistics-granularity.enum';
import type { StatisticsPeriodEnum } from '../../../core/enums/statistics-period.enum';
import type { IStatistics, ITimelinePoint, ITopTrack } from '../../../core/models/statistics.model';
import type {
  IGenreShare,
  IStatisticsKpi,
  IStatisticsPeriodTab,
  ITimelineFormat,
  ITrackShare,
} from '../../../features/models/statistics-view.model';

@Component({
  selector: 'app-statistics-page',
  templateUrl: './statistics-page.component.html',
  styleUrl: './statistics-page.component.scss',
  imports: [
    StatisticsKpiCardComponent,
    PlaysTimelineChartComponent,
    GenreShareListComponent,
    TopTracksListComponent,
    TrackShareDonutComponent,
    StatisticsSkeletonComponent,
    ButtonComponent,
    EmptyStateComponent,
    TranslatePipe,
  ],
})
export class StatisticsPageComponent implements OnInit {
  private readonly store: Store = inject(Store);

  protected readonly tabs: readonly IStatisticsPeriodTab[] = STATISTICS_PERIOD_TABS;

  protected readonly timelineFormats: Readonly<Record<StatisticsGranularityEnum, ITimelineFormat>> =
    TIMELINE_FORMATS;

  protected readonly period: Signal<StatisticsPeriodEnum> = this.store.selectSignal(
    statisticsFeature.selectPeriod,
  );

  protected readonly statistics: Signal<IStatistics | null> = this.store.selectSignal(
    statisticsFeature.selectStatistics,
  );

  protected readonly isLoading: Signal<boolean> = this.store.selectSignal(
    statisticsFeature.selectIsLoading,
  );

  protected readonly hasLoadFailed: Signal<boolean> = this.store.selectSignal(
    statisticsFeature.selectHasLoadFailed,
  );

  protected readonly kpis: Signal<IStatisticsKpi[]> = this.store.selectSignal(
    statisticsFeature.selectKpis,
  );

  protected readonly timeline: Signal<readonly ITimelinePoint[]> = this.store.selectSignal(
    statisticsFeature.selectTimeline,
  );

  protected readonly genreShares: Signal<IGenreShare[]> = this.store.selectSignal(
    statisticsFeature.selectGenreShares,
  );

  protected readonly topTracks: Signal<readonly ITopTrack[]> = this.store.selectSignal(
    statisticsFeature.selectTopTracks,
  );

  protected readonly trackShares: Signal<ITrackShare[]> = this.store.selectSignal(
    statisticsFeature.selectTrackShares,
  );

  protected readonly totalPlays: Signal<number> = this.store.selectSignal(
    statisticsFeature.selectTotalPlays,
  );

  public ngOnInit(): void {
    this.store.dispatch(StatisticsPageActions.opened());
  }

  public onPeriodSelect(period: StatisticsPeriodEnum): void {
    if (period !== this.period()) {
      this.store.dispatch(StatisticsPageActions.periodSelected({ period: period }));
    }
  }

  public onRetry(): void {
    this.store.dispatch(StatisticsPageActions.retryClicked());
  }
}
