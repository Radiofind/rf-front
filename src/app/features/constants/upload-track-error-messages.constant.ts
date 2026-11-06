import type { TranslationKey } from '../../core/types/translation.type';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class UploadTrackValidationMessages {
  public static readonly AUDIO_REQUIRED: TranslationKey = 'validation.audioRequired';

  public static readonly GENRE_REQUIRED: TranslationKey = 'validation.genreRequired';

  public static readonly MAX_GENRES: TranslationKey = 'validation.maxTrackGenres';

  public static readonly MAX_LENGTH_TITLE: TranslationKey = 'validation.maxLengthTitle';
}
