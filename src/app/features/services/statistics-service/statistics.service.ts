import { inject, Service } from '@angular/core';
import { ApiService } from '../../../core/services/api/api.service';

import type { Observable } from 'rxjs';
import type { StatisticsPeriodEnum } from '../../../core/enums/statistics-period.enum';
import type { IStatistics } from '../../../core/models/statistics.model';

@Service()
export class StatisticsService {
  private readonly apiService: ApiService = inject(ApiService);

  public getStatistics(period: StatisticsPeriodEnum): Observable<IStatistics> {
    return this.apiService.getStatistics({
      period: period,
      zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  }
}
