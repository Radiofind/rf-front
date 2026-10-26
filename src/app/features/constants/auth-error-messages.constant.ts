import type { TranslationKey } from '../../core/types/translation.type';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AuthValidationMessages {
  public static readonly REQUIRED: TranslationKey = 'validation.required';

  public static readonly EMAIL: TranslationKey = 'validation.email';

  public static readonly MIN_LENGTH: TranslationKey = 'validation.minLength';

  public static readonly MAX_LENGTH: TranslationKey = 'validation.maxLength';

  public static readonly MAX_LENGTH_PASSWORD: TranslationKey = 'validation.maxLengthPassword';

  public static readonly MAX_LENGTH_DESCRIPTION: TranslationKey = 'validation.maxLengthDescription';

  public static readonly PATTERN: TranslationKey = 'validation.pattern';

  public static readonly PATTERN_WITH_SPACES_AND_SYMBOLS: TranslationKey =
    'validation.patternWithSpacesAndSymbols';

  public static readonly INVALID_DATE: TranslationKey = 'validation.invalidDate';

  public static readonly FUTURE_DATE: TranslationKey = 'validation.futureDate';

  public static readonly MAX_AGE: TranslationKey = 'validation.maxAge';

  public static readonly UPPERCASE: TranslationKey = 'validation.uppercase';

  public static readonly LOWERCASE: TranslationKey = 'validation.lowercase';

  public static readonly NUMBER: TranslationKey = 'validation.number';

  public static readonly SPECIAL_CHARACTER: TranslationKey = 'validation.specialCharacter';

  public static readonly SPACES: TranslationKey = 'validation.spaces';

  public static readonly PASSWORD_MISMATCH: TranslationKey = 'validation.passwordMismatch';

  public static readonly INVALID_LOGIN_PASSWORD: TranslationKey = 'validation.invalidLoginPassword';

  public static readonly REGISTRATION_FAILED: TranslationKey = 'validation.registrationFailed';

  public static readonly EMAIL_TAKEN: TranslationKey = 'validation.emailTaken';

  public static readonly INVALID_TWO_FACTOR_CODE: TranslationKey =
    'validation.invalidTwoFactorCode';

  public static readonly RESEND_TWO_FACTOR_CODE_FAILED: TranslationKey =
    'validation.resendTwoFactorCodeFailed';

  public static readonly TWO_FACTOR_CODE_NO_LONGER_VALID: TranslationKey =
    'validation.twoFactorCodeNoLongerValid';

  public static readonly TOO_MANY_TWO_FACTOR_ATTEMPTS: TranslationKey =
    'validation.tooManyTwoFactorAttempts';

  public static readonly TOO_MANY_TWO_FACTOR_RESENDS: TranslationKey =
    'validation.tooManyTwoFactorResends';

  public static readonly TWO_FACTOR_SESSION_EXPIRED: TranslationKey =
    'validation.twoFactorSessionExpired';
}
