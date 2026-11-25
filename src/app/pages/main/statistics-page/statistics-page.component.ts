import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { StatisticsKpiCardComponent } from '../../../features/components/statistics/statistics-kpi-card/statistics-kpi-card.component';
import { PlaysTimelineChartComponent } from '../../../features/components/statistics/plays-timeline-chart/plays-timeline-chart.component';
import { GenreShareListComponent } from '../../../features/components/statistics/genre-share-list/genre-share-list.component';
import { TopTracksListComponent } from '../../../features/components/statistics/top-tracks-list/top-tracks-list.component';
import { TrackShareDonutComponent } from '../../../features/components/statistics/track-share-donut/track-share-donut.component';
import { StatisticsSkeletonComponent } from '../../../features/components/statistics/statistics-skeleton/statistics-skeleton.component';
import {
  STATISTICS_PERIOD_TABS,
  STATISTICS_PERIODS,
  TIMELINE_FORMATS,
} from '../../../features/constants/statistics.constant';
import { Constants } from '../../../core/constants/constants';
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

  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  private readonly router: Router = inject(Router);

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
    this.store.dispatch(StatisticsPageActions.opened({ period: this.requestedPeriod() }));
  }

  public onPeriodSelect(period: StatisticsPeriodEnum): void {
    if (period !== this.period()) {
      this.store.dispatch(StatisticsPageActions.periodSelected({ period: period }));
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { [Constants.PERIOD_QUERY_PARAM]: period },
        replaceUrl: true,
      });
    }
  }

  public onRetry(): void {
    this.store.dispatch(StatisticsPageActions.retryClicked());
  }

  private requestedPeriod(): StatisticsPeriodEnum | null {
    const period: string | null = this.route.snapshot.queryParamMap.get(
      Constants.PERIOD_QUERY_PARAM,
    );

    return period && STATISTICS_PERIODS.has(period) ? (period as StatisticsPeriodEnum) : null;
  }
}
