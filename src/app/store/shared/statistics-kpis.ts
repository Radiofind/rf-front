import { STATISTICS_KPIS } from '../../features/constants/statistics.constant';
import { relativeChange } from '../../shared/helpers/statistics/statistics.helpers';

import type { IStatistics } from '../../core/models/statistics.model';
import type {
  IStatisticsKpi,
  IStatisticsKpiDefinition,
} from '../../features/models/statistics-view.model';

export function statisticsKpis(statistics: IStatistics | null): IStatisticsKpi[] {
  return statistics
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
    : [];
}
