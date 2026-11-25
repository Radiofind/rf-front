import type { StatisticsGranularityEnum } from '../enums/statistics-granularity.enum';
import type { StatisticsPeriodEnum } from '../enums/statistics-period.enum';
import type { ITrackSummary } from './track.model';

export interface IStatisticsQuery {
  period: StatisticsPeriodEnum;
  zone: string;
}

export interface IStatisticsTotals {
  plays: number;
  downloads: number;
  likes: number;
  uniqueListeners: number;
}

export interface ITimelinePoint {
  start: string;
  plays: number;
  downloads: number;
}

export interface IGenrePlays {
  genre: string;
  plays: number;
}

export interface ITopTrack {
  track: ITrackSummary;
  plays: number;
}

export interface IStatistics {
  period: StatisticsPeriodEnum;
  granularity: StatisticsGranularityEnum;
  current: IStatisticsTotals;
  previous: IStatisticsTotals;
  timeline: ITimelinePoint[];
  genres: IGenrePlays[];
  topTracks: ITopTrack[];
}
