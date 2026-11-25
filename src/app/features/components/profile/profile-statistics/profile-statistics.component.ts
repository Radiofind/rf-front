import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StatisticsKpiCardComponent } from '../../statistics/statistics-kpi-card/statistics-kpi-card.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { TranslatePipe } from '../../../../shared/pipes/translate/translate.pipe';
import { Constants } from '../../../../core/constants/constants';
import { Links } from '../../../../core/constants/links';
import {
  PROFILE_STATISTICS_PERIOD_TABS,
  STATISTICS_KPIS,
} from '../../../constants/statistics.constant';

import type { InputSignal, OutputEmitterRef, Signal } from '@angular/core';
import type { Params } from '@angular/router';
import type { StatisticsPeriodEnum } from '../../../../core/enums/statistics-period.enum';
import type {
  IStatisticsKpi,
  IStatisticsKpiDefinition,
  IStatisticsPeriodTab,
} from '../../../models/statistics-view.model';

@Component({
  selector: 'app-profile-statistics',
  templateUrl: './profile-statistics.component.html',
  styleUrl: './profile-statistics.component.scss',
  imports: [
    StatisticsKpiCardComponent,
    ButtonComponent,
    EmptyStateComponent,
    RouterLink,
    TranslatePipe,
  ],
})
export class ProfileStatisticsComponent {
  public readonly period: InputSignal<StatisticsPeriodEnum> =
    input.required<StatisticsPeriodEnum>();

  public readonly kpis: InputSignal<readonly IStatisticsKpi[]> = input<readonly IStatisticsKpi[]>(
    [],
  );

  public readonly isLoading: InputSignal<boolean> = input<boolean>(false);

  public readonly hasLoadFailed: InputSignal<boolean> = input<boolean>(false);

  public readonly periodSelected: OutputEmitterRef<StatisticsPeriodEnum> =
    output<StatisticsPeriodEnum>();

  public readonly retryClicked: OutputEmitterRef<void> = output();

  protected readonly tabs: readonly IStatisticsPeriodTab[] = PROFILE_STATISTICS_PERIOD_TABS;

  protected readonly placeholders: readonly IStatisticsKpiDefinition[] = STATISTICS_KPIS;

  protected readonly statisticsLink: string = `/${Links.STATISTICS_URL}`;

  protected readonly statisticsQueryParams: Signal<Params> = computed<Params>(() => ({
    [Constants.PERIOD_QUERY_PARAM]: this.period(),
  }));

  public onPeriodSelect(period: StatisticsPeriodEnum): void {
    if (period !== this.period()) {
      this.periodSelected.emit(period);
    }
  }

  public onRetry(): void {
    this.retryClicked.emit();
  }
}
