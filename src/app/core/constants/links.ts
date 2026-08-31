export class Links {
  public static readonly DEFAULT_PATH: string = '';

  public static readonly AUTH_URL: string = 'auth/';

  public static readonly LOGIN_URL: string = `${this.AUTH_URL}login`;

  public static readonly REGISTER_URL: string = `${this.AUTH_URL}register`;

  public static readonly UPLOADS_URL: string = 'my-uploads';
}
