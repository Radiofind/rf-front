import { HttpInterceptorFn } from "@angular/common/http";
import { inject, PLATFORM_ID } from "@angular/core";
import { AuthStateService } from "../services/auth-state.service";
import { isPlatformBrowser } from "@angular/common";

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

  const authState = inject(AuthStateService);
  const token = authState.getToken();

  if (!token) {
    return next(req);
  }

  if (req.url.includes('/auth')) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authReq);
}