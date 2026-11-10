import type { TrackActionEnum } from '../../core/enums/track-action.enum';
import type { ITrack } from '../../core/models/track.model';
import type { TranslationKey } from '../../core/types/translation.type';

export interface ITrackActionOption {
  action: TrackActionEnum;
  label: TranslationKey;
  iconClass: string;
  isDanger: boolean;
}

export interface ITrackActionRequest {
  track: ITrack;
  action: TrackActionEnum;
}
