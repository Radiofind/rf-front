import { Component } from '@angular/core';
import { STATISTICS_KPIS } from '../../../constants/statistics.constant';

import type { IStatisticsKpiDefinition } from '../../../models/statistics-view.model';

@Component({
  selector: 'app-statistics-skeleton',
  templateUrl: './statistics-skeleton.component.html',
  styleUrl: './statistics-skeleton.component.scss',
})
export class StatisticsSkeletonComponent {
  protected readonly kpis: readonly IStatisticsKpiDefinition[] = STATISTICS_KPIS;
}
