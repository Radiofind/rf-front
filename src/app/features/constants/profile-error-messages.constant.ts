// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ProfileValidationMessages {
  public static readonly MAX_LENGTH_NAME: string = 'Must not exceed 100 characters';

  public static readonly MAX_LENGTH_EMAIL: string = 'Must not exceed 254 characters';

  public static readonly MAX_LENGTH_SHORT_DESCRIPTION: string = 'Must not exceed 160 characters';

  public static readonly MAX_LENGTH_DESCRIPTION: string = 'Must not exceed 1000 characters';

  public static readonly MAX_MAIN_GENRES: string = 'Choose up to 3 main genres';

  public static readonly MAX_ADDITIONAL_GENRES: string = 'Choose up to 10 additional genres';

  public static readonly SAME_EMAIL: string = 'Recovery email must differ from your email';

  public static readonly EMAIL_TAKEN: string = 'This email is already in use';

  public static readonly INVALID_URL: string = 'Enter a full link starting with https://';

  public static readonly WRONG_SOCIAL_LINK: string = 'This link must lead to';
}
