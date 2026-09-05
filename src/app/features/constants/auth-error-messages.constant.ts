// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AuthValidationMessages {
  public static readonly REQUIRED: string = 'Field is required';

  public static readonly EMAIL: string = 'Invalid email';

  public static readonly MIN_LENGTH: string = 'Must be at least 8 character long';

  public static readonly MAX_LENGTH: string = 'Must not exceed 50 characters';

  public static readonly PATTERN: string = 'Only English letters are allowed (without spaces)';

  public static readonly INVALID_DATE: string = 'Invalid date';

  public static readonly FUTURE_DATE: string = 'Date of birth cannot be in the future';

  public static readonly MAX_AGE: string = 'Age cannot exceed 100 years';

  public static readonly UPPERCASE: string = 'Must contain at least one uppercase letter';

  public static readonly LOWERCASE: string = 'Must contain at least one lowercase letter';

  public static readonly NUMBER: string = 'Must contain at least one number';

  public static readonly SPECIAL_CHARACTER: string = 'Must contain at least one special character';

  public static readonly SPACES: string = 'Must not contain spaces';

  public static readonly PASSWORD_MISMATCH: string = 'Invalid password';
}
