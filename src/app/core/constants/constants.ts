export class Constants {
  // inline strings

  public static readonly EMPTY_STRING: string = '';

  public static readonly TOKEN_KEY: string = 'radiofind_token';

  public static readonly UPPERCASE: string = 'uppercase';

  public static readonly LOWERCASE: string = 'lowercase';

  public static readonly NUMBER_PROPERTY: string = 'number';

  public static readonly SPECIAL_CHARACTER: string = 'specialCharacter';

  public static readonly SPACES_PROPERTY: string = 'spaces';

  // magic numbers

  public static readonly MIN_LINGTH_FORM_VALIDATION_NAME: number = 2;

  public static readonly MIN_LINGTS_FORM_VALIDATION_PASSWORD: number = 8;

  public static readonly MAX_LENGTH_FORM_VALIDATION_PASSWORD: number = 50;

  public static readonly MAX_LENGTH_FORM_ARTIST_OR_BAND_NAME: number = 20;

  // others

  public static readonly NAME_VALIDATOR_PATTERN: RegExp = /^[A-Za-z]+$/;

  public static readonly UPPERCASE_VALIDATOR_PATTERN: RegExp = /[A-Z]/;

  public static readonly LOWERCASE_VALIDATOR_PATTERN: RegExp = /[a-z]/;

  public static readonly DECIMAL_VALIDATOR_PATTERN: RegExp = /\d/;

  public static readonly SPECIAL_CHARACTER_VALIDATOR_PATTERN: RegExp = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

  public static readonly SPACES_VALIDATOR_PATTERN: RegExp = /\s/;
}