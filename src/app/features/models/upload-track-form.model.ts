import type { TranslationKey } from '../../core/types/translation.type';

export interface IUploadTrackForm {
  title: string;
  genres: string[];
  description: string;
  audio: File | null;
  cover: File | null;
}

export interface IUploadTip {
  iconClass: string;
  title: TranslationKey;
  description: TranslationKey;
}
