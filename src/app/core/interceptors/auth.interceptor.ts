import { type HttpHandlerFn, type HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { AuthStateService } from "../../features/services/auth-state-service/auth-state.service";
import { Constants } from "../constants/constants";

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {

  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

  const authState: AuthStateService = inject(AuthStateService);
  const token: string | null | undefined = authState.getToken();

  if (!token) {
    return next(req);
  }

  if (req.url.includes(Constants.AUTH_PART_PATH)) {
    return next(req);
  }

  const authReq: HttpRequest<unknown> = req.clone({
    setHeaders: {
      Authorization: `${Constants.BEARER} ${token}`
    }
  });

  return next(authReq);
}
