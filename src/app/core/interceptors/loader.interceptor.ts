import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { finalize } from 'rxjs';
import { LoaderService } from '../../shared/services/loader-service/loader.service';
import { SKIP_GLOBAL_LOADER } from '../tokens/loader.token';

import type { Observable } from 'rxjs';
import type { HttpEvent, HttpRequest, HttpHandlerFn, HttpInterceptorFn } from '@angular/common/http';

export const loaderInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {

  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId) || req.context.get(SKIP_GLOBAL_LOADER)) {
    return next(req);
  }

  const loaderService: LoaderService = inject(LoaderService);

  loaderService.show();

  const request$: Observable<HttpEvent<unknown>> = next(req);

  return request$.pipe(finalize(() => { loaderService.hide(); }));
}
