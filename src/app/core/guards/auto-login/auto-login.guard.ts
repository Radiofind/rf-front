import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Links } from '../../constants/links';
import { authFeature } from '../../../store/auth/auth.feature';
import { isTokenValid } from '../../../shared/helpers/token/token.helpers';

import type { CanActivateFn } from '@angular/router';

export const noLoginGuard: CanActivateFn = () => {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) {
    return true;
  }

  const token: string | null = inject(Store).selectSignal(authFeature.selectToken)();

  if (isTokenValid(token, Date.now())) {
    void inject(Router).navigate([Links.DEFAULT_PATH]);
    return false;
  }

  return true;
};
