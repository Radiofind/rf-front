import { IAuthEndpoints } from "../models/auth.model";

export const TOKEN_KEY = 'radiofind_token';

export const AUTH_ENDPOINTS: IAuthEndpoints = {
  auth: '/auth',
  register: '/register',
  login: '/login',
};