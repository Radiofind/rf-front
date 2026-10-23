import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { defer, of, throwError } from 'rxjs';
import { UserService } from './user.service';
import { ApiService } from '../../../core/services/api/api.service';

import type { Observable } from 'rxjs';
import type {
  IAvatarResponse,
  ICurrentUser,
  IUpdatedProfileData,
  IUpdateProfileData,
  IUserProfileData,
} from '../../../core/models/user.model';
import type { IGeneralSettings } from '../../../core/models/settings.model';

describe('UserService', () => {
  const currentUser: ICurrentUser = {
    name: 'Ada',
    surname: 'Lovelace',
    email: 'ada@example.com',
    avatarUrl: null,
  };

  const profileData: IUserProfileData = {
    name: 'Ada',
    surname: 'Lovelace',
    email: 'ada@example.com',
    recoveryEmail: null,
    dateOfBirth: '1994-03-07',
    artistType: 'BAND',
    artistName: 'The Engines',
    description: null,
    shortDescription: 'Analytical soundscapes',
    socialLinks: {
      telegram: null,
      instagram: null,
      youtube: null,
      facebook: null,
      spotify: null,
      appleMusic: null,
      soundcloud: null,
      bandcamp: null,
      icloud: null,
      tiktok: null,
    },
    mainGenres: [],
    additionalGenres: [],
    registeredAt: '2026-01-15T10:00:00Z',
    avatarUrl: null,
  };

  const updateData: IUpdateProfileData = {
    name: 'Grace',
    surname: 'Hopper',
    email: 'grace@example.com',
    recoveryEmail: null,
    artistType: 'ARTIST',
    artistName: null,
    description: null,
    shortDescription: 'Debugging the charts',
    socialLinks: profileData.socialLinks,
    mainGenres: ['ROCK'],
    additionalGenres: [],
  };

  const updatedProfile: IUpdatedProfileData = {
    profile: { ...profileData, ...updateData },
    emailChanged: true,
    requiresReauthentication: true,
  };

  const avatarResponse: IAvatarResponse = { avatarUrl: '/api/users/me/avatar' };

  const avatarBlob: Blob = new Blob(['avatar-bytes'], { type: 'image/png' });

  const generalSettings: IGeneralSettings = {
    language: 'EN',
    radioMode: true,
    profileVisibility: 'EVERYONE',
    notificationsEnabled: true,
    audioQuality: 'HIGH',
    accentColor: 'VIOLET',
  };

  const avatarFile: File = new File(['avatar-bytes'], 'avatar.png', { type: 'image/png' });

  let service: UserService;
  let apiMock: Record<
    | 'getCurrentUserData'
    | 'getUserProfileData'
    | 'updateUserProfileData'
    | 'uploadNewAvatar'
    | 'getCurrentAvatar'
    | 'deleteAvatar'
    | 'getGeneralSettings'
    | 'updateGeneralSettings',
    ReturnType<typeof vi.fn>
  >;

  const createService = (
    getCurrentUserData: ReturnType<typeof vi.fn> = vi.fn().mockReturnValue(of(currentUser)),
  ): void => {
    TestBed.resetTestingModule();

    apiMock = {
      getCurrentUserData: getCurrentUserData,
      getUserProfileData: vi.fn().mockReturnValue(of(profileData)),
      updateUserProfileData: vi.fn().mockReturnValue(of(updatedProfile)),
      uploadNewAvatar: vi.fn().mockReturnValue(of(avatarResponse)),
      getCurrentAvatar: vi.fn().mockReturnValue(of(avatarBlob)),
      deleteAvatar: vi.fn().mockReturnValue(of(undefined)),
      getGeneralSettings: vi.fn().mockReturnValue(of(generalSettings)),
      updateGeneralSettings: vi.fn().mockReturnValue(of(generalSettings)),
    };

    TestBed.configureTestingModule({
      providers: [UserService, { provide: ApiService, useValue: apiMock }],
    });

    service = TestBed.inject(UserService);
  };

  beforeEach(() => {
    createService();
  });

  it('delegates the current user request to the api service', () => {
    service.getCurrentUserData().subscribe();

    expect(apiMock.getCurrentUserData).toHaveBeenCalledTimes(1);
    expect(apiMock.getCurrentUserData).toHaveBeenCalledWith();
  });

  it('emits the current user returned by the api service', () => {
    let received: ICurrentUser | undefined;

    service.getCurrentUserData().subscribe((value) => {
      received = value;
    });

    expect(received).toEqual(currentUser);
  });

  it('passes the response through untouched', () => {
    let received: ICurrentUser | undefined;

    service.getCurrentUserData().subscribe((value) => {
      received = value;
    });

    expect(received).toBe(currentUser);
  });

  it('completes after a single emission', () => {
    const emissions: ICurrentUser[] = [];
    let completed: boolean = false;

    service.getCurrentUserData().subscribe({
      next: (value) => emissions.push(value),
      complete: () => {
        completed = true;
      },
    });

    expect(emissions).toHaveLength(1);
    expect(completed).toBe(true);
  });

  it('does not touch the backend before the caller subscribes', () => {
    let subscriptions: number = 0;

    createService(
      vi.fn().mockReturnValue(
        defer((): Observable<ICurrentUser> => {
          subscriptions += 1;
          return of(currentUser);
        }),
      ),
    );

    const currentUser$: Observable<ICurrentUser> = service.getCurrentUserData();

    expect(subscriptions).toBe(0);

    currentUser$.subscribe();

    expect(subscriptions).toBe(1);
  });

  it('requests the user again for every new call', () => {
    service.getCurrentUserData().subscribe();
    service.getCurrentUserData().subscribe();

    expect(apiMock.getCurrentUserData).toHaveBeenCalledTimes(2);
  });

  it('surfaces api errors to the caller', () => {
    createService(vi.fn().mockReturnValue(throwError(() => ({ status: 401 }))));

    let errorStatus: number | undefined;
    let received: ICurrentUser | undefined;

    service.getCurrentUserData().subscribe({
      next: (value) => {
        received = value;
      },
      error: (error: { status: number }) => {
        errorStatus = error.status;
      },
    });

    expect(errorStatus).toBe(401);
    expect(received).toBeUndefined();
  });

  describe('profile', () => {
    it('delegates the profile request to the api service', () => {
      let received: IUserProfileData | undefined;

      service.getUserProfileData().subscribe((value) => {
        received = value;
      });

      expect(apiMock.getUserProfileData).toHaveBeenCalledTimes(1);
      expect(apiMock.getUserProfileData).toHaveBeenCalledWith();
      expect(received).toBe(profileData);
    });

    it('surfaces profile errors to the caller', () => {
      apiMock.getUserProfileData.mockReturnValue(throwError(() => ({ status: 401 })));

      let errorStatus: number | undefined;

      service.getUserProfileData().subscribe({
        error: (error: { status: number }) => {
          errorStatus = error.status;
        },
      });

      expect(errorStatus).toBe(401);
    });
  });

  describe('profile update', () => {
    it('passes the update payload to the api service unchanged', () => {
      let received: IUpdatedProfileData | undefined;

      service.updateUserProfileData(updateData).subscribe((value) => {
        received = value;
      });

      expect(apiMock.updateUserProfileData).toHaveBeenCalledTimes(1);
      expect(apiMock.updateUserProfileData).toHaveBeenCalledWith(updateData);
      expect(received).toBe(updatedProfile);
    });

    it('surfaces a rejected update to the caller', () => {
      apiMock.updateUserProfileData.mockReturnValue(throwError(() => ({ status: 409 })));

      let errorStatus: number | undefined;

      service.updateUserProfileData(updateData).subscribe({
        error: (error: { status: number }) => {
          errorStatus = error.status;
        },
      });

      expect(errorStatus).toBe(409);
    });
  });

  describe('avatar', () => {
    it('passes the selected file to the api service unchanged', () => {
      let received: IAvatarResponse | undefined;

      service.uploadNewAvatar(avatarFile).subscribe((value) => {
        received = value;
      });

      expect(apiMock.uploadNewAvatar).toHaveBeenCalledTimes(1);
      expect(apiMock.uploadNewAvatar).toHaveBeenCalledWith(avatarFile);
      expect(received).toBe(avatarResponse);
    });

    it('surfaces a rejected upload to the caller', () => {
      apiMock.uploadNewAvatar.mockReturnValue(throwError(() => ({ status: 413 })));

      let errorStatus: number | undefined;

      service.uploadNewAvatar(avatarFile).subscribe({
        error: (error: { status: number }) => {
          errorStatus = error.status;
        },
      });

      expect(errorStatus).toBe(413);
    });

    it('delegates the avatar download to the api service', () => {
      let received: Blob | undefined;

      service.getCurrentAvatar().subscribe((value) => {
        received = value;
      });

      expect(apiMock.getCurrentAvatar).toHaveBeenCalledTimes(1);
      expect(received).toBe(avatarBlob);
    });

    it('delegates the avatar removal to the api service and completes', () => {
      let completed: boolean = false;

      service.deleteAvatar().subscribe({
        complete: () => {
          completed = true;
        },
      });

      expect(apiMock.deleteAvatar).toHaveBeenCalledTimes(1);
      expect(completed).toBe(true);
    });
  });

  describe('general settings', () => {
    it('delegates the settings request to the api service', () => {
      let received: IGeneralSettings | undefined;

      service.getGeneralSettings().subscribe((value) => {
        received = value;
      });

      expect(apiMock.getGeneralSettings).toHaveBeenCalledTimes(1);
      expect(received).toBe(generalSettings);
    });

    it('passes the settings to save to the api service unchanged', () => {
      let received: IGeneralSettings | undefined;

      service.updateGeneralSettings(generalSettings).subscribe((value) => {
        received = value;
      });

      expect(apiMock.updateGeneralSettings).toHaveBeenCalledWith(generalSettings);
      expect(received).toBe(generalSettings);
    });

    it('surfaces a failed save to the caller', () => {
      apiMock.updateGeneralSettings.mockReturnValue(throwError(() => ({ status: 500 })));

      let errorStatus: number | undefined;

      service.updateGeneralSettings(generalSettings).subscribe({
        error: (error: { status: number }) => {
          errorStatus = error.status;
        },
      });

      expect(errorStatus).toBe(500);
    });
  });
});
