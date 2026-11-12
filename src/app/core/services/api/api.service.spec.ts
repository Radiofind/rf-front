import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { ApiService } from './api.service';
import { EndpointConstants } from '../../constants/endpoints.constants';
import { SKIP_GLOBAL_LOADER } from '../../tokens/loader/loader.token';
import { environment } from '../../../../environments/environment';
import { Constants } from '../../constants/constants';

import type { TestRequest } from '@angular/common/http/testing';
import type { IAuthResponse, ITwoFactorResponse } from '../../models/auth.model';
import type { IRegisterData } from '../../../features/models/auth-content.model';
import type {
  IAvatarResponse,
  ICurrentUser,
  ISocialLinksData,
  IUpdatedProfileData,
  IUpdateProfileData,
  IUserProfileData,
} from '../../models/user.model';
import type { IGeneralSettings } from '../../models/settings.model';
import type { ITrack, IUploadTrackData } from '../../models/track.model';
import type { IUnreadNotifications } from '../../models/notification.model';

describe('ApiService', () => {
  const api: string = `${environment.apiUrl}${EndpointConstants.AUTH_ENDPOINTS.auth}`;

  const userApi: string = `${environment.apiUrl}${EndpointConstants.USER_ENDPOINTS.users}`;

  const currentUserApi: string = `${userApi}${EndpointConstants.USER_ENDPOINTS.me}`;

  const profileUrl: string = `${currentUserApi}${EndpointConstants.USER_ENDPOINTS.profile}`;

  const avatarUrl: string = `${currentUserApi}${EndpointConstants.USER_ENDPOINTS.avatar}`;

  const generalSettingsUrl: string = '/api/users/me/settings/general';

  const generalSettings: IGeneralSettings = {
    language: 'DE',
    radioMode: false,
    profileVisibility: 'ONLY_ME',
    audioQuality: 'NORMAL',
    accentColor: 'OCEAN',
  };

  const socialLinks: ISocialLinksData = {
    telegram: 'https://t.me/countess',
    instagram: null,
    youtube: null,
    facebook: null,
    spotify: null,
    appleMusic: null,
    soundcloud: null,
    bandcamp: null,
    icloud: null,
    tiktok: null,
  };

  const profileData: IUserProfileData = {
    name: 'Ada',
    surname: 'Lovelace',
    email: 'ada@example.com',
    recoveryEmail: null,
    dateOfBirth: '1994-03-07',
    artistType: 'ARTIST',
    artistName: 'Countess',
    description: 'Analytical engine enthusiast',
    shortDescription: 'Engine enthusiast',
    socialLinks: socialLinks,
    mainGenres: ['ELECTRONIC'],
    additionalGenres: [],
    registeredAt: '2026-01-15T10:00:00Z',
    uploadsCount: 0,
    avatarUrl: '/api/users/me/avatar',
  };

  const updateData: IUpdateProfileData = {
    name: 'Grace',
    surname: 'Hopper',
    email: 'grace@example.com',
    recoveryEmail: 'backup@example.com',
    artistType: 'BAND',
    artistName: 'The Compilers',
    description: 'Debugging the charts',
    shortDescription: 'Debuggers',
    socialLinks: { ...socialLinks, spotify: 'https://open.spotify.com/artist/compilers' },
    mainGenres: ['ROCK'],
    additionalGenres: ['JAZZ'],
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

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('posts registration data and returns the auth response', () => {
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
  });

  it('posts login data and returns the challenge', () => {
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
  });

  it('posts the two-factor code and returns the issued token', () => {
    const response: ITwoFactorResponse = {
      token: 'jwt',
      requiresTwoFactor: false,
      challengeId: null,
    };

    let received: ITwoFactorResponse | undefined;

    service.twoFactorAuth({ challengeId: 'challenge', code: '123456' }).subscribe((value) => {
      received = value;
    });

    const request: TestRequest = httpMock.expectOne(
      `${api}${EndpointConstants.AUTH_ENDPOINTS.twoFactorAuth}`,
    );

    expect(request.request.body).toEqual({ challengeId: 'challenge', code: '123456' });

    request.flush(response);

    expect(received).toEqual(response);
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
      avatarUrl: null,
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
        shortDescription: null,
        socialLinks: null,
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

  describe('profile update', () => {
    const updatedProfile: IUpdatedProfileData = {
      profile: { ...profileData, ...updateData },
      emailChanged: true,
      requiresReauthentication: true,
    };

    it('replaces the profile with a PUT of the full update payload', () => {
      let received: IUpdatedProfileData | undefined;

      service.updateUserProfileData(updateData).subscribe((value) => {
        received = value;
      });

      const request: TestRequest = httpMock.expectOne(profileUrl);

      expect(request.request.method).toBe('PUT');
      expect(request.request.url).not.toMatch(/\s/);
      expect(request.request.body).toBe(updateData);

      request.flush(updatedProfile);

      expect(received).toEqual(updatedProfile);
    });

    it('keeps the global loader while the profile is being saved', () => {
      service.updateUserProfileData(updateData).subscribe();

      const request: TestRequest = httpMock.expectOne(profileUrl);

      expect(request.request.context.get(SKIP_GLOBAL_LOADER)).toBe(false);

      request.flush(updatedProfile);
    });

    it('passes the email change flags through untouched', () => {
      const unchanged: IUpdatedProfileData = {
        ...updatedProfile,
        emailChanged: false,
        requiresReauthentication: false,
      };
      let received: IUpdatedProfileData | undefined;

      service.updateUserProfileData(updateData).subscribe((value) => {
        received = value;
      });

      httpMock.expectOne(profileUrl).flush(unchanged);

      expect(received?.emailChanged).toBe(false);
      expect(received?.requiresReauthentication).toBe(false);
    });

    it.each([
      [400, 'Bad Request'],
      [409, 'Conflict'],
    ])('surfaces a %i rejection to the caller', (status, statusText) => {
      let errorStatus: number | undefined;

      service.updateUserProfileData(updateData).subscribe({
        error: (error: { status: number }) => {
          errorStatus = error.status;
        },
      });

      httpMock.expectOne(profileUrl).flush({ message: statusText }, { status, statusText });

      expect(errorStatus).toBe(status);
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

  describe('general settings', () => {
    it('reads the general settings of the current user', () => {
      let received: IGeneralSettings | undefined;

      service.getGeneralSettings().subscribe((value) => {
        received = value;
      });

      const request: TestRequest = httpMock.expectOne(generalSettingsUrl);

      expect(request.request.method).toBe('GET');

      request.flush(generalSettings);

      expect(received).toEqual(generalSettings);
    });

    it('replaces the general settings with a PUT of the full settings object', () => {
      let received: IGeneralSettings | undefined;

      service.updateGeneralSettings(generalSettings).subscribe((value) => {
        received = value;
      });

      const request: TestRequest = httpMock.expectOne(generalSettingsUrl);

      expect(request.request.method).toBe('PUT');
      expect(request.request.body).toEqual(generalSettings);

      request.flush(generalSettings);

      expect(received).toEqual(generalSettings);
    });

    it('saves settings in the background without the global loader', () => {
      service.updateGeneralSettings(generalSettings).subscribe();

      const request: TestRequest = httpMock.expectOne(generalSettingsUrl);

      expect(request.request.context.get(SKIP_GLOBAL_LOADER)).toBe(true);

      request.flush(generalSettings);
    });

    it('keeps the global loader for the initial settings request', () => {
      service.getGeneralSettings().subscribe();

      const request: TestRequest = httpMock.expectOne(generalSettingsUrl);

      expect(request.request.context.get(SKIP_GLOBAL_LOADER)).toBe(false);

      request.flush(generalSettings);
    });

    it('surfaces a rejected update to the caller', () => {
      let errorStatus: number | undefined;

      service.updateGeneralSettings(generalSettings).subscribe({
        error: (error: { status: number }) => {
          errorStatus = error.status;
        },
      });

      httpMock
        .expectOne(generalSettingsUrl)
        .flush({ message: 'Bad Request' }, { status: 400, statusText: 'Bad Request' });

      expect(errorStatus).toBe(400);
    });
  });

  describe('tracks', () => {
    const tracksUrl: string = `${environment.apiUrl}${EndpointConstants.TRACK_ENDPOINTS.tracks}`;

    const audio: File = new File(['audio'], 'song.mp3');

    const trackData = (overrides: Partial<IUploadTrackData> = {}): IUploadTrackData => ({
      title: 'Midnight Dreams',
      genres: ['GRUNGE', 'INDIE_ROCK'],
      description: null,
      audio: audio,
      cover: null,
      ...overrides,
    });

    it('uploads only the given parts as multipart form data', () => {
      let received: ITrack | undefined;
      const track = { id: 42 } as ITrack;

      service.uploadTrack(trackData()).subscribe((value) => {
        received = value;
      });

      const request: TestRequest = httpMock.expectOne(tracksUrl);
      const body: FormData = request.request.body as FormData;

      expect(request.request.method).toBe('POST');
      expect([...body.keys()]).toEqual([
        Constants.TITLE_FORM_DATA,
        Constants.GENRES_FORM_DATA,
        Constants.GENRES_FORM_DATA,
        Constants.AUDIO_FORM_DATA,
      ]);
      expect(body.getAll(Constants.GENRES_FORM_DATA)).toEqual(['GRUNGE', 'INDIE_ROCK']);
      expect(body.get(Constants.TITLE_FORM_DATA)).toBe('Midnight Dreams');
      expect((body.get(Constants.AUDIO_FORM_DATA) as File).name).toBe('song.mp3');

      request.flush(track);

      expect(received).toEqual(track);
    });

    it('adds the description and the cover when given', () => {
      const cover: File = new File(['image'], 'cover.png');

      service.uploadTrack(trackData({ description: 'Late night drive', cover: cover })).subscribe();

      const body: FormData = httpMock.expectOne(tracksUrl).request.body as FormData;

      expect(body.get(Constants.DESCRIPTION_FORM_DATA)).toBe('Late night drive');
      expect((body.get(Constants.COVER_FORM_DATA) as File).name).toBe('cover.png');
    });

    it('shows the global loader while a track uploads', () => {
      service.uploadTrack(trackData()).subscribe();

      const request: TestRequest = httpMock.expectOne(tracksUrl);

      expect(request.request.context.get(SKIP_GLOBAL_LOADER)).toBe(false);
    });
  });

  describe('activities and notifications', () => {
    it('requests a page of activities', () => {
      service.getActivities(0, 5).subscribe();

      const request: TestRequest = httpMock.expectOne(
        (candidate) => candidate.url === '/api/users/me/activities',
      );

      expect(request.request.params.get(Constants.PAGE_QUERY_PARAM)).toBe('0');
      expect(request.request.params.get(Constants.SIZE_QUERY_PARAM)).toBe('5');
    });

    it('requests a page of notifications in the background', () => {
      service.getNotifications(1, 20).subscribe();

      const request: TestRequest = httpMock.expectOne(
        (candidate) => candidate.url === '/api/users/me/notifications',
      );

      expect(request.request.params.get(Constants.PAGE_QUERY_PARAM)).toBe('1');
      expect(request.request.params.get(Constants.SIZE_QUERY_PARAM)).toBe('20');
      expect(request.request.context.get(SKIP_GLOBAL_LOADER)).toBe(true);
    });

    it('requests the unread count in the background', () => {
      let received: IUnreadNotifications | undefined;

      service.getUnreadNotifications().subscribe((value) => {
        received = value;
      });

      const request: TestRequest = httpMock.expectOne('/api/users/me/notifications/unread-count');
      request.flush({ count: 3 });

      expect(request.request.context.get(SKIP_GLOBAL_LOADER)).toBe(true);
      expect(received).toEqual({ count: 3 });
    });

    it('marks every notification as read in the background', () => {
      service.markAllNotificationsAsRead().subscribe();

      const request: TestRequest = httpMock.expectOne('/api/users/me/notifications/read-all');

      expect(request.request.method).toBe('POST');
      expect(request.request.context.get(SKIP_GLOBAL_LOADER)).toBe(true);
    });
  });
});
