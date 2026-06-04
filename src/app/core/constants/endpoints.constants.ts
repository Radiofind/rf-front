import { IAuthEndpoints } from "../models/auth.model";

export class EndpointConstants {
    public static readonly AUTH_ENDPOINTS: IAuthEndpoints = {
    auth: '/auth',
    register: '/register',
    login: '/login',
  };
}
