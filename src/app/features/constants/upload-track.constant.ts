import type { IFileRules } from '../../core/models/file-rules.model';
import type { TranslationKey } from '../../core/types/translation.type';
import type { IUploadTip } from '../models/upload-track-form.model';

export const TRACK_TITLE_MAX_LENGTH: number = 150;

export const MAX_TRACK_GENRES: number = 3;

export const TRACK_DESCRIPTION_MAX_LENGTH: number = 1000;

export const TRACK_DESCRIPTION_ROWS: number = 4;

export const AUDIO_FILE_RULES: Readonly<IFileRules> = {
  extensions: ['.mp3', '.wav', '.flac'],
  maxSizeMb: 100,
  invalidTypeMessage: 'validation.audioType',
  tooLargeMessage: 'validation.audioTooLarge',
};

export const COVER_FILE_RULES: Readonly<IFileRules> = {
  extensions: ['.jpg', '.jpeg', '.png'],
  maxSizeMb: 10,
  invalidTypeMessage: 'validation.coverType',
  tooLargeMessage: 'validation.coverTooLarge',
};

export const AUDIO_ACCEPT: string = [
  ...AUDIO_FILE_RULES.extensions,
  'audio/mpeg',
  'audio/wav',
  'audio/flac',
].join(',');

export const COVER_ACCEPT: string = [
  ...COVER_FILE_RULES.extensions,
  'image/jpeg',
  'image/png',
].join(',');

export const UPLOAD_TRACK_MESSAGES = {
  uploaded: 'messages.trackUploaded',
  uploadFailed: 'messages.trackUploadFailed',
  tooLarge: 'messages.trackTooLarge',
  unsupportedFormat: 'messages.trackUnsupportedFormat',
  alreadyUploaded: 'messages.trackAlreadyUploaded',
} as const satisfies Readonly<Record<string, TranslationKey>>;

export const UPLOAD_TIPS: readonly IUploadTip[] = [
  {
    iconClass: 'bx bx-equalizer',
    title: 'uploadTrack.tipQualityTitle',
    description: 'uploadTrack.tipQualityDescription',
  },
  {
    iconClass: 'bx bx-price-tag',
    title: 'uploadTrack.tipGenreTitle',
    description: 'uploadTrack.tipGenreDescription',
  },
  {
    iconClass: 'bx bx-image',
    title: 'uploadTrack.tipCoverTitle',
    description: 'uploadTrack.tipCoverDescription',
  },
  {
    iconClass: 'bx bx-file-detail',
    title: 'uploadTrack.tipDescriptionTitle',
    description: 'uploadTrack.tipDescriptionDescription',
  },
];
