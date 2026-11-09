import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Store } from '@ngrx/store';
import { authFeature } from '../../../store/auth/auth.feature';
import { Constants } from '../../constants/constants';

import type { HttpRequest, HttpHandlerFn, HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

  const token: string | null = inject(Store).selectSignal(authFeature.selectToken)();

  if (!token) {
    return next(req);
  }

  if (req.url.includes(Constants.AUTH_PART_PATH)) {
    return next(req);
  }

  const authReq: HttpRequest<unknown> = req.clone({
    setHeaders: {
      Authorization: `${Constants.BEARER} ${token}`,
    },
  });

  return next(authReq);
};
