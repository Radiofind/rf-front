import type { TranslationKey } from '../../core/types/translation.type';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ProfileValidationMessages {
  public static readonly MAX_LENGTH_NAME: TranslationKey = 'validation.maxLengthName';

  public static readonly MAX_LENGTH_EMAIL: TranslationKey = 'validation.maxLengthEmail';

  public static readonly MAX_LENGTH_SHORT_DESCRIPTION: TranslationKey =
    'validation.maxLengthShortDescription';

  public static readonly MAX_LENGTH_DESCRIPTION: TranslationKey = 'validation.maxLengthDescription';

  public static readonly MAX_MAIN_GENRES: TranslationKey = 'validation.maxMainGenres';

  public static readonly MAX_ADDITIONAL_GENRES: TranslationKey = 'validation.maxAdditionalGenres';

  public static readonly SAME_EMAIL: TranslationKey = 'validation.sameEmail';

  public static readonly EMAIL_TAKEN: TranslationKey = 'validation.emailTaken';

  public static readonly INVALID_URL: TranslationKey = 'validation.invalidUrl';

  public static readonly WRONG_SOCIAL_LINK: TranslationKey = 'validation.wrongSocialLink';
}
