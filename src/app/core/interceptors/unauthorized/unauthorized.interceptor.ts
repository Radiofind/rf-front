import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../../features/services/auth-service/auth.service';
import { Constants } from '../../constants/constants';

import type { HttpRequest, HttpHandlerFn, HttpInterceptorFn } from '@angular/common/http';

export const unauthorizedInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId) || req.url.includes(Constants.AUTH_PART_PATH)) {
    return next(req);
  }

  const authService: AuthService = inject(AuthService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === Constants.HTTP_UNAUTHORIZED_STATUS
      ) {
        authService.logout();
      }

      return throwError(() => error);
    }),
  );
};
