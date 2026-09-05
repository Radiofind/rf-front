import type { IAuthEndpoints } from "../models/auth.model";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class EndpointConstants {
    public static readonly AUTH_ENDPOINTS: IAuthEndpoints = {
    auth: '/auth',
    register: '/register',
    login: '/login',
  };
}
