import type { StatisticsPeriodEnum } from '../../core/enums/statistics-period.enum';
import type { IStatisticsTotals } from '../../core/models/statistics.model';
import type { ITrackSummary } from '../../core/models/track.model';
import type { TranslationKey } from '../../core/types/translation.type';

export interface IStatisticsPeriodTab {
  period: StatisticsPeriodEnum;
  label: TranslationKey;
}

export interface IStatisticsKpiDefinition {
  metric: keyof IStatisticsTotals;
  label: TranslationKey;
  iconClass: string;
}

export interface IStatisticsKpi extends IStatisticsKpiDefinition {
  value: number;
  change: number | null;
}

export interface IGenreShare {
  genre: string | null;
  label: TranslationKey;
  plays: number;
  share: number;
}

/** A null track stands for every track outside the leaders. */
export interface ITrackShare {
  track: ITrackSummary | null;
  plays: number;
  share: number;
}
