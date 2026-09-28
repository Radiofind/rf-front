import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpResponse } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { of } from 'rxjs';
import { authInterceptor } from './auth.interceptor';
import { AuthStateService } from '../../../features/services/auth-state-service/auth-state.service';
import { Constants } from '../../constants/constants';
import { environment } from '../../../../environments/environment';

import type { HttpEvent } from '@angular/common/http';
import type { Observable } from 'rxjs';

describe('authInterceptor', () => {
  const apiRequest = new HttpRequest<unknown>('GET', `${environment.apiUrl}/tracks`);
  const authRequest = new HttpRequest<unknown>('POST', `${environment.apiUrl}/auth/login`, {});

  let next: ReturnType<typeof vi.fn>;

  const configure = (platform: string, token: string | null | undefined): void => {
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: platform },
        {
          provide: AuthStateService,
          useValue: { getToken: (): string | null | undefined => token },
        },
      ],
    });
  };

  const intercept = (request: HttpRequest<unknown>): void => {
    TestBed.runInInjectionContext(() => {
      authInterceptor(
        request,
        next as unknown as (req: HttpRequest<unknown>) => Observable<HttpEvent<unknown>>,
      );
    });
  };

  const forwardedRequest = (): HttpRequest<unknown> =>
    next.mock.calls[0]?.[0] as HttpRequest<unknown>;

  beforeEach(() => {
    next = vi.fn().mockReturnValue(of(new HttpResponse()));
  });

  it('attaches the bearer token to an api request', () => {
    configure('browser', 'jwt');

    intercept(apiRequest);

    expect(forwardedRequest().headers.get('Authorization')).toBe(`${Constants.BEARER} jwt`);
  });

  it('leaves the request untouched when no token is stored', () => {
    configure('browser', null);

    intercept(apiRequest);

    expect(forwardedRequest()).toBe(apiRequest);
  });

  it('never sends the token to the auth endpoints', () => {
    configure('browser', 'jwt');

    intercept(authRequest);

    expect(forwardedRequest()).toBe(authRequest);
    expect(forwardedRequest().headers.has('Authorization')).toBe(false);
  });

  it('does nothing on the server', () => {
    configure('server', 'jwt');

    intercept(apiRequest);

    expect(forwardedRequest()).toBe(apiRequest);
  });
});
