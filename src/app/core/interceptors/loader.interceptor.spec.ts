import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpResponse } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { Subject, throwError } from 'rxjs';
import { loaderInterceptor } from './loader.interceptor';
import { LoaderService } from '../../shared/services/loader-service/loader.service';
import { skipGlobalLoader } from '../tokens/loader.token';

import type { HttpEvent } from '@angular/common/http';
import type { Observable } from 'rxjs';

describe('loaderInterceptor', () => {
  let show: ReturnType<typeof vi.fn>;
  let hide: ReturnType<typeof vi.fn>;

  const configure = (platform: string): void => {
    show = vi.fn();
    hide = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: platform },
        { provide: LoaderService, useValue: { show: show, hide: hide } },
      ],
    });
  };

  const intercept = (
    request: HttpRequest<unknown>,
    next: (req: HttpRequest<unknown>) => Observable<HttpEvent<unknown>>,
  ): Observable<HttpEvent<unknown>> =>
    TestBed.runInInjectionContext(() => loaderInterceptor(request, next));

  beforeEach(() => {
    configure('browser');
  });

  it('shows the loader while the request is in flight and hides it on completion', () => {
    const response$: Subject<HttpEvent<unknown>> = new Subject<HttpEvent<unknown>>();

    intercept(new HttpRequest('GET', '/api/tracks'), () => response$).subscribe();

    expect(show).toHaveBeenCalledTimes(1);
    expect(hide).not.toHaveBeenCalled();

    response$.next(new HttpResponse());
    response$.complete();

    expect(hide).toHaveBeenCalledTimes(1);
  });

  it('hides the loader when the request fails', () => {
    intercept(new HttpRequest('GET', '/api/tracks'), () =>
      throwError(() => new Error('network')),
    ).subscribe({ error: () => undefined });

    expect(show).toHaveBeenCalledTimes(1);
    expect(hide).toHaveBeenCalledTimes(1);
  });

  it('hides the loader when the caller unsubscribes early', () => {
    const response$: Subject<HttpEvent<unknown>> = new Subject<HttpEvent<unknown>>();

    intercept(new HttpRequest('GET', '/api/tracks'), () => response$)
      .subscribe()
      .unsubscribe();

    expect(hide).toHaveBeenCalledTimes(1);
  });

  it('stays out of the way when the request opts out', () => {
    const request = new HttpRequest<unknown>('POST', '/api/auth/resend-2fa', {}, {
      context: skipGlobalLoader(),
    });

    intercept(request, () => new Subject<HttpEvent<unknown>>()).subscribe();

    expect(show).not.toHaveBeenCalled();
  });

  it('does nothing on the server', () => {
    configure('server');

    intercept(new HttpRequest('GET', '/api/tracks'), () => new Subject<HttpEvent<unknown>>()).subscribe();

    expect(show).not.toHaveBeenCalled();
  });
});
