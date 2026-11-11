import type { IAuthEndpoints } from '../models/auth.model';
import type { ITrackEndpoints } from '../models/track.model';
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
    profile: '/profile',
    avatar: '/avatar',
    settings: '/settings',
    general: '/general',
    activities: '/activities',
    notifications: '/notifications',
    unreadCount: '/unread-count',
    readAll: '/read-all',
    tracks: '/tracks',
    library: '/library',
  };

  public static readonly TRACK_ENDPOINTS: ITrackEndpoints = {
    tracks: '/tracks',
    plays: '/plays',
    like: '/like',
    cancelSubmission: '/cancel-submission',
    submit: '/submit',
    statistics: '/statistics',
    schedule: '/schedule',
    scheduleChangeRequests: '/schedule-change-requests',
    rejection: '/rejection',
    reports: '/reports',
  };
}
