import type { TrackActionEnum } from '../../core/enums/track-action.enum';
import type { ITrack } from '../../core/models/track.model';
import type { TranslationKey } from '../../core/types/translation.type';

export interface ITracksTableSorts<TSort extends string> {
  title: TSort;
  duration: TSort;
  plays: TSort;
  likes: TSort;
  date: TSort;
}

export interface ITracksTableConfig<TSort extends string> {
  sorts: ITracksTableSorts<TSort>;
  dateLabel: TranslationKey;
  dateOf: (track: ITrack) => string | null;
  hasStatus: boolean;
  actionsOf: (track: ITrack) => readonly TrackActionEnum[];
}
