import { Component, input } from '@angular/core';
import { TranslatePipe } from '../../../../shared/pipes/translate/translate.pipe';
import { CompactNumberPipe } from '../../../../shared/pipes/compact-number/compact-number.pipe';
import { PercentValuePipe } from '../../../../shared/pipes/percent-value/percent-value.pipe';

import type { InputSignal } from '@angular/core';
import type { IStatisticsKpi } from '../../../models/statistics-view.model';

@Component({
  selector: 'app-statistics-kpi-card',
  imports: [TranslatePipe, CompactNumberPipe, PercentValuePipe],
  templateUrl: './statistics-kpi-card.component.html',
  styleUrl: './statistics-kpi-card.component.scss',
})
export class StatisticsKpiCardComponent {
  public readonly kpi: InputSignal<IStatisticsKpi> = input.required<IStatisticsKpi>();
}
