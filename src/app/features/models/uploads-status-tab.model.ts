import type { TrackStatus } from '../../core/types/track-status.type';
import type { TranslationKey } from '../../core/types/translation.type';

export interface IUploadsStatusTab {
  status: TrackStatus | null;
  label: TranslationKey;
}
