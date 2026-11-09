import { jwtDecode } from 'jwt-decode';
import { Constants } from '../../../core/constants/constants';

import type { IJwtPayload } from '../../../core/models/auth.model';

export function isTokenValid(token: string | null, now: number): boolean {
  if (!token) {
    return false;
  }

  try {
    return jwtDecode<IJwtPayload>(token).exp * Constants.MILLISECONDS_IN_ONE_SECOND > now;
  } catch {
    return false;
  }
}
