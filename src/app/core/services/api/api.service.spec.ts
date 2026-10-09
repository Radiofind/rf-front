import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { ApiService } from './api.service';
import { AuthStateService } from '../../../features/services/auth-state-service/auth-state.service';
import { EndpointConstants } from '../../constants/endpoints.constants';
import { SKIP_GLOBAL_LOADER } from '../../tokens/loader/loader.token';
import { environment } from '../../../../environments/environment';
import { Constants } from '../../constants/constants';

import type { TestRequest } from '@angular/common/http/testing';
import type { IAuthResponse, ITwoFactorResponse } from '../../models/auth.model';
import type { IRegisterData } from '../../../features/models/auth-content.model';
import type { IAvatarResponse, ICurrentUser, IUserProfileData } from '../../models/user.model';

describe('ApiService', () => {
  const api: string = `${environment.apiUrl}${EndpointConstants.AUTH_ENDPOINTS.auth}`;

  const userApi: string = `${environment.apiUrl}${EndpointConstants.USER_ENDPOINTS.users}`;

  const currentUserApi: string = `${userApi}${EndpointConstants.USER_ENDPOINTS.me}`;

  const profileUrl: string = `${currentUserApi}${EndpointConstants.USER_ENDPOINTS.profile}`;

  const avatarUrl: string = `${currentUserApi}${EndpointConstants.USER_ENDPOINTS.avatar}`;

  const profileData: IUserProfileData = {
    name: 'Ada',
    surname: 'Lovelace',
    dateOfBirth: '1994-03-07',
    artistType: 'ARTIST',
    artistName: 'Countess',
    description: 'Analytical engine enthusiast',
    registeredAt: '2026-01-15T10:00:00Z',
    avatarUrl: '/api/users/me/avatar',
  };

  const registerData: IRegisterData = {
    name: 'Ada',
    surname: 'Lovelace',
    email: 'ada@example.com',
    dateOfBirth: '1994-03-07',
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

  afterEach(() => {
    httpMock.verify();
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

  it('builds the current user url without stray whitespace', () => {
    service.getCurrentUserData().subscribe();

    const request: TestRequest = httpMock.expectOne(currentUserApi);

    expect(request.request.url).toBe(currentUserApi);
    expect(request.request.url).not.toMatch(/\s/);

    request.flush({ name: 'Ada', surname: 'Lovelace', email: 'ada@example.com' });
  });

  describe('profile', () => {
    it('reads the profile of the current user', () => {
      let received: IUserProfileData | undefined;

      service.getUserProfileData().subscribe((value) => {
        received = value;
      });

      const request: TestRequest = httpMock.expectOne(profileUrl);

      expect(request.request.method).toBe('GET');
      expect(request.request.url).not.toMatch(/\s/);
      expect(request.request.body).toBeNull();
      expect(request.request.context.get(SKIP_GLOBAL_LOADER)).toBe(false);

      request.flush(profileData);

      expect(received).toEqual(profileData);
    });

    it('passes nullable profile fields through as null', () => {
      const emptyProfile: IUserProfileData = {
        ...profileData,
        artistType: null,
        artistName: null,
        description: null,
        avatarUrl: null,
      };
      let received: IUserProfileData | undefined;

      service.getUserProfileData().subscribe((value) => {
        received = value;
      });

      httpMock.expectOne(profileUrl).flush(emptyProfile);

      expect(received).toEqual(emptyProfile);
    });

    it('surfaces profile errors to the caller', () => {
      let errorStatus: number | undefined;

      service.getUserProfileData().subscribe({
        error: (error: { status: number }) => {
          errorStatus = error.status;
        },
      });

      httpMock
        .expectOne(profileUrl)
        .flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

      expect(errorStatus).toBe(401);
    });
  });

  describe('avatar', () => {
    const file: File = new File(['avatar-bytes'], 'avatar.png', { type: 'image/png' });

    it('uploads the avatar as multipart form data under the file key', () => {
      const response: IAvatarResponse = { avatarUrl: '/api/users/me/avatar' };
      let received: IAvatarResponse | undefined;

      service.uploadNewAvatar(file).subscribe((value) => {
        received = value;
      });

      const request: TestRequest = httpMock.expectOne(avatarUrl);

      expect(request.request.method).toBe('POST');
      expect(request.request.url).not.toMatch(/\s/);
      expect(request.request.body).toBeInstanceOf(FormData);

      const body: FormData = request.request.body as FormData;

      expect(body.get(Constants.FILE_FORM_DATA)).toBeInstanceOf(File);
      expect((body.get(Constants.FILE_FORM_DATA) as File).name).toBe('avatar.png');
      expect([...body.keys()]).toEqual([Constants.FILE_FORM_DATA]);

      request.flush(response);

      expect(received).toEqual(response);
    });

    it('does not force a content type so the browser can set the multipart boundary', () => {
      service.uploadNewAvatar(file).subscribe();

      const request: TestRequest = httpMock.expectOne(avatarUrl);

      expect(request.request.headers.has('Content-Type')).toBe(false);

      request.flush({ avatarUrl: '/api/users/me/avatar' });
    });

    it('surfaces a rejected upload to the caller', () => {
      let errorStatus: number | undefined;

      service.uploadNewAvatar(file).subscribe({
        error: (error: { status: number }) => {
          errorStatus = error.status;
        },
      });

      httpMock
        .expectOne(avatarUrl)
        .flush({ message: 'Payload Too Large' }, { status: 413, statusText: 'Payload Too Large' });

      expect(errorStatus).toBe(413);
    });

    it('downloads the current avatar as a blob', () => {
      const blob: Blob = new Blob(['avatar-bytes'], { type: 'image/png' });
      let received: Blob | undefined;

      service.getCurrentAvatar().subscribe((value) => {
        received = value;
      });

      const request: TestRequest = httpMock.expectOne(avatarUrl);

      expect(request.request.method).toBe('GET');
      expect(request.request.responseType).toBe('blob');

      request.flush(blob);

      expect(received).toBe(blob);
    });

    it('surfaces a missing avatar to the caller', () => {
      let errorStatus: number | undefined;

      service.getCurrentAvatar().subscribe({
        error: (error: { status: number }) => {
          errorStatus = error.status;
        },
      });

      httpMock.expectOne(avatarUrl).flush(new Blob(), { status: 404, statusText: 'Not Found' });

      expect(errorStatus).toBe(404);
    });

    it('deletes the current avatar', () => {
      let completed: boolean = false;

      service.deleteAvatar().subscribe({
        complete: () => {
          completed = true;
        },
      });

      const request: TestRequest = httpMock.expectOne(avatarUrl);

      expect(request.request.method).toBe('DELETE');
      expect(request.request.body).toBeNull();

      request.flush(null, { status: 204, statusText: 'No Content' });

      expect(completed).toBe(true);
    });
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
