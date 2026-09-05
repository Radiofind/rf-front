export class Constants {
  // inline strings

  public static readonly EMPTY_STRING: string = '';

  public static readonly TOKEN_KEY: string = 'radiofind_token';

  public static readonly UPPERCASE: string = 'uppercase';

  public static readonly LOWERCASE: string = 'lowercase';

  public static readonly NUMBER_PROPERTY: string = 'number';

  public static readonly SPECIAL_CHARACTER: string = 'specialCharacter';

  public static readonly SPACES_PROPERTY: string = 'spaces';

  public static readonly PASSWORD_MISMATCH: string = 'passwordMismatch';

  public static readonly INVALID_DATE: string = 'invalidDate';

  public static readonly SERVER_ERROR: string = 'server';

  public static readonly LOGIN: string = 'login';

  public static readonly REGISTER: string = 'register';

  public static readonly AUTH_TYPE_PROP: string = 'authType';

  public static readonly INVALID_LOGIN_PASSWORD: string = 'Invalid login or password';

  public static readonly REGISTRATION_FAILED: string = 'Registration failed, please try again';

  public static readonly REQUIRED_PROPERTY: string = 'required';

  public static readonly SPLIT_DATE_BY_T: string = 'T';

  public static readonly DASH: string = '-';

  public static readonly ZERO_STRING: string = '0';

  public static readonly AUTH_PART_PATH: string = '/auth';

  public static readonly BEARER: string = 'Bearer';

  // magic numbers

  public static readonly ZERO: number = 0;

  public static readonly MIN_LINGTH_FORM_VALIDATION_NAME: number = 2;

  public static readonly MIN_LINGTS_FORM_VALIDATION_PASSWORD: number = 8;

  public static readonly MAX_LENGTH_FORM_ARTIST_OR_BAND_NAME: number = 50;

  public static readonly MIN_BIRTH_DATE: number = 100;

  public static readonly ONE: number = 1;

  public static readonly INVALID_DATA_MESSAGE_TIME: number = 3000;

  public static readonly DEFAULT_TEXTAREA_ROWS: number = 10;

  public static readonly DATE_PAD_LENGTH: number = 2;

  // others

  public static readonly EN_VALIDATOR_PATTERN: RegExp = /^[A-Za-z]+$/;

  public static readonly UPPERCASE_VALIDATOR_PATTERN: RegExp = /[A-Z]/;

  public static readonly LOWERCASE_VALIDATOR_PATTERN: RegExp = /[a-z]/;

  public static readonly DECIMAL_VALIDATOR_PATTERN: RegExp = /\d/;

  public static readonly SPECIAL_CHARACTER_VALIDATOR_PATTERN: RegExp = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

  public static readonly SPACES_VALIDATOR_PATTERN: RegExp = /\s/;
}
