// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Links {
  public static readonly DEFAULT_PATH: string = '';

  public static readonly AUTH_URL: string = 'auth/';

  public static readonly LOGIN_URL: string = `${this.AUTH_URL}login`;

  public static readonly REGISTER_URL: string = `${this.AUTH_URL}register`;

  public static readonly RESET_PASSWORD_URL: string = `${this.AUTH_URL}reset-password`;

  public static readonly UPLOADS_URL: string = 'my-uploads';

  public static readonly NOT_FOUND_URL: string = 'not-found';

  public static readonly FORBIDDEN_URL: string = 'forbidden';

  public static readonly SERVER_ERROR_URL: string = 'server-error';

  public static readonly WILDCARD_PATH: string = '**';
}
