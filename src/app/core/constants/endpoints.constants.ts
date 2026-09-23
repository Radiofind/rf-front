import type { IAuthEndpoints } from '../models/auth.model';
import type { IUserEndpoints } from '../models/user.model';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class EndpointConstants {
  public static readonly AUTH_ENDPOINTS: IAuthEndpoints = {
    auth: '/auth',
    register: '/register',
    login: '/login',
    twoFactorAuth: '/verify-2fa',
    resendTwoFactorAuth: '/resend-2fa',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
    validateResetToken: '/validate-reset-token',
  };

  public static readonly USER_ENDPOINTS: IUserEndpoints = {
    users: '/users',
    me: '/me',
  };
}
