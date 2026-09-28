import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { ApiService } from './api.service';
import { AuthStateService } from '../../../features/services/auth-state-service/auth-state.service';
import { EndpointConstants } from '../../constants/endpoints.constants';
import { SKIP_GLOBAL_LOADER } from '../../tokens/loader/loader.token';
import { environment } from '../../../../environments/environment';

import type { TestRequest } from '@angular/common/http/testing';
import type { IAuthResponse, ITwoFactorResponse } from '../../models/auth.model';
import type { IRegisterData } from '../../../features/models/auth-content.model';
import type { ICurrentUser } from '../../models/user.model';

describe('ApiService', () => {
  const api: string = `${environment.apiUrl}${EndpointConstants.AUTH_ENDPOINTS.auth}`;

  const userApi: string = `${environment.apiUrl}${EndpointConstants.USER_ENDPOINTS.users}`;

  const registerData: IRegisterData = {
    name: 'Ada',
    surname: 'Lovelace',
    email: 'ada@example.com',
    dateOfBirth: new Date(1994, 2, 7),
    password: 'Passw0rd!',
  };

  let service: ApiService;
  let httpMock: HttpTestingController;
  let setToken: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    setToken = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        ApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: AuthStateService, useValue: { setToken: setToken } },
      ],
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('posts registration data and stores the returned token', () => {
    const response: IAuthResponse = { challengeId: null, requiresTwoFactor: false, token: 'jwt' };
    let received: IAuthResponse | undefined;

    service.register(registerData).subscribe((value) => {
      received = value;
    });

    const request: TestRequest = httpMock.expectOne(
      `${api}${EndpointConstants.AUTH_ENDPOINTS.register}`,
    );

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBe(registerData);

    request.flush(response);

    expect(received).toEqual(response);
    expect(setToken).toHaveBeenCalledWith('jwt');
  });

  it('stringifies a missing registration token instead of crashing', () => {
    service.register(registerData).subscribe();

    httpMock
      .expectOne(`${api}${EndpointConstants.AUTH_ENDPOINTS.register}`)
      .flush({ challengeId: null, requiresTwoFactor: false, token: null });

    expect(setToken).toHaveBeenCalledWith('null');
  });

  it('posts login data without storing a token', () => {
    const response: IAuthResponse = {
      challengeId: 'challenge',
      requiresTwoFactor: true,
      token: null,
    };
    let received: IAuthResponse | undefined;

    service.login({ email: 'ada@example.com', password: 'Passw0rd!' }).subscribe((value) => {
      received = value;
    });

    httpMock.expectOne(`${api}${EndpointConstants.AUTH_ENDPOINTS.login}`).flush(response);

    expect(received).toEqual(response);
    expect(setToken).not.toHaveBeenCalled();
  });

  it('stores the token returned by the two-factor verification', () => {
    const response: ITwoFactorResponse = {
      token: 'jwt',
      requiresTwoFactor: false,
      challengeId: null,
    };

    service.twoFactorAuth({ challengeId: 'challenge', code: '123456' }).subscribe();

    httpMock.expectOne(`${api}${EndpointConstants.AUTH_ENDPOINTS.twoFactorAuth}`).flush(response);

    expect(setToken).toHaveBeenCalledWith('jwt');
  });

  it('skips the global loader when resending the two-factor code', () => {
    service.resendTwoFactorAuth({ challengeId: 'challenge' }).subscribe();

    const request: TestRequest = httpMock.expectOne(
      `${api}${EndpointConstants.AUTH_ENDPOINTS.resendTwoFactorAuth}`,
    );

    expect(request.request.context.get(SKIP_GLOBAL_LOADER)).toBe(true);

    request.flush({ challengeId: 'challenge', requiresTwoFactor: true, token: null });
  });

  it('posts the forgot-password request', () => {
    service.forgetPassword({ email: 'ada@example.com' }).subscribe();

    const request: TestRequest = httpMock.expectOne(
      `${api}${EndpointConstants.AUTH_ENDPOINTS.forgotPassword}`,
    );

    expect(request.request.body).toEqual({ email: 'ada@example.com' });

    request.flush({});
  });

  it('posts the reset token validation and returns its result', () => {
    let received: boolean | undefined;

    service.resetTokenValidation({ token: 'reset-token' }).subscribe((value) => {
      received = value.valid;
    });

    httpMock
      .expectOne(`${api}${EndpointConstants.AUTH_ENDPOINTS.validateResetToken}`)
      .flush({ valid: true });

    expect(received).toBe(true);
  });

  it('posts the new password', () => {
    service.resetPassword({ token: 'reset-token', newPassword: 'Passw0rd!' }).subscribe();

    const request: TestRequest = httpMock.expectOne(
      `${api}${EndpointConstants.AUTH_ENDPOINTS.resetPassword}`,
    );

    expect(request.request.body).toEqual({ token: 'reset-token', newPassword: 'Passw0rd!' });

    request.flush({});
  });

  it('reads the current user from the users endpoint', () => {
    const currentUser: ICurrentUser = {
      name: 'Ada',
      surname: 'Lovelace',
      email: 'ada@example.com',
    };

    let received: ICurrentUser | undefined;

    service.getCurrentUserData().subscribe((value) => {
      received = value;
    });

    const request: TestRequest = httpMock.expectOne(
      `${userApi}${EndpointConstants.USER_ENDPOINTS.me}`,
    );

    expect(request.request.method).toBe('GET');
    expect(request.request.body).toBeNull();
    expect(request.request.context.get(SKIP_GLOBAL_LOADER)).toBe(false);

    request.flush(currentUser);

    expect(received).toEqual(currentUser);
  });

  it('surfaces an unauthorised current user request to the caller', () => {
    let errorStatus: number | undefined;

    service.getCurrentUserData().subscribe({
      error: (error: { status: number }) => {
        errorStatus = error.status;
      },
    });

    httpMock
      .expectOne(`${userApi}${EndpointConstants.USER_ENDPOINTS.me}`)
      .flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(errorStatus).toBe(401);
  });

  it('surfaces server errors to the caller', () => {
    let errorStatus: number | undefined;

    service.login({ email: 'ada@example.com', password: 'wrong' }).subscribe({
      error: (error: { status: number }) => {
        errorStatus = error.status;
      },
    });

    httpMock
      .expectOne(`${api}${EndpointConstants.AUTH_ENDPOINTS.login}`)
      .flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(errorStatus).toBe(401);
  });
});
