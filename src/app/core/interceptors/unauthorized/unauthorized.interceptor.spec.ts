import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, HttpRequest, HttpResponse } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { firstValueFrom, of, throwError } from 'rxjs';
import { unauthorizedInterceptor } from './unauthorized.interceptor';
import { AuthService } from '../../../features/services/auth-service/auth.service';
import { Constants } from '../../constants/constants';
import { environment } from '../../../../environments/environment';

import type { HttpEvent } from '@angular/common/http';
import type { Observable } from 'rxjs';

describe('unauthorizedInterceptor', () => {
  const apiRequest = new HttpRequest<unknown>('GET', `${environment.apiUrl}/users/me`);
  const authRequest = new HttpRequest<unknown>('POST', `${environment.apiUrl}/auth/login`, {});

  let logout: ReturnType<typeof vi.fn>;

  const configure = (platform: string): void => {
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: platform },
        { provide: AuthService, useValue: { logout: logout } },
      ],
    });
  };

  const intercept = (
    request: HttpRequest<unknown>,
    response: Observable<HttpEvent<unknown>>,
  ): Promise<HttpEvent<unknown>> =>
    TestBed.runInInjectionContext(() =>
      firstValueFrom(unauthorizedInterceptor(request, () => response)),
    );

  const failWith = (status: number): Observable<HttpEvent<unknown>> =>
    throwError(() => new HttpErrorResponse({ status: status }));

  beforeEach(() => {
    logout = vi.fn();
  });

  it('logs out and rethrows when the api rejects the token', async () => {
    configure('browser');

    await expect(
      intercept(apiRequest, failWith(Constants.HTTP_UNAUTHORIZED_STATUS)),
    ).rejects.toBeInstanceOf(HttpErrorResponse);

    expect(logout).toHaveBeenCalledTimes(1);
  });

  it('keeps the session for any other error', async () => {
    configure('browser');

    await expect(intercept(apiRequest, failWith(500))).rejects.toBeInstanceOf(HttpErrorResponse);

    expect(logout).not.toHaveBeenCalled();
  });

  it('ignores a 401 from the auth endpoints', async () => {
    configure('browser');

    await expect(
      intercept(authRequest, failWith(Constants.HTTP_UNAUTHORIZED_STATUS)),
    ).rejects.toBeInstanceOf(HttpErrorResponse);

    expect(logout).not.toHaveBeenCalled();
  });

  it('passes successful responses through', async () => {
    configure('browser');
    const response = new HttpResponse({ status: 200 });

    await expect(intercept(apiRequest, of(response))).resolves.toBe(response);

    expect(logout).not.toHaveBeenCalled();
  });

  it('does nothing on the server', async () => {
    configure('server');

    await expect(
      intercept(apiRequest, failWith(Constants.HTTP_UNAUTHORIZED_STATUS)),
    ).rejects.toBeInstanceOf(HttpErrorResponse);

    expect(logout).not.toHaveBeenCalled();
  });
});
