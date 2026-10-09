import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthStateService } from '../../../features/services/auth-state-service/auth-state.service';
import { Links } from '../../constants/links';

import type { CanActivateFn } from '@angular/router';

export const noLoginGuard: CanActivateFn = () => {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) {
    return true;
  }

  const authState: AuthStateService = inject(AuthStateService);
  const router: Router = inject(Router);

  if (authState.isTokenValid()) {
    void router.navigate([Links.DEFAULT_PATH]);
    return false;
  }
  return true;
};
