import { describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { UserService } from './user.service';
import { ApiService } from '../../../core/services/api/api.service';

import type { Observable } from 'rxjs';

describe('UserService', () => {
  const avatarFile: File = new File(['avatar-bytes'], 'avatar.png', { type: 'image/png' });

  it.each([
    [
      'the current user',
      'getCurrentUserData',
      [],
      (service: UserService) => service.getCurrentUserData(),
    ],
    [
      'the profile',
      'getUserProfileData',
      [],
      (service: UserService) => service.getUserProfileData(),
    ],
    [
      'a profile update',
      'updateUserProfileData',
      [{ name: 'Grace' }],
      (service: UserService) => service.updateUserProfileData({ name: 'Grace' } as never),
    ],
    [
      'an avatar upload',
      'uploadNewAvatar',
      [avatarFile],
      (service: UserService) => service.uploadNewAvatar(avatarFile),
    ],
    [
      'the avatar download',
      'getCurrentAvatar',
      [],
      (service: UserService) => service.getCurrentAvatar(),
    ],
    ['the avatar removal', 'deleteAvatar', [], (service: UserService) => service.deleteAvatar()],
    [
      'the general settings',
      'getGeneralSettings',
      [],
      (service: UserService) => service.getGeneralSettings(),
    ],
    [
      'a settings save',
      'updateGeneralSettings',
      [{ language: 'DE' }],
      (service: UserService) => service.updateGeneralSettings({ language: 'DE' } as never),
    ],
    [
      'a page of activities',
      'getActivities',
      [0, 5],
      (service: UserService) => service.getActivities(0, 5),
    ],
    [
      'a page of notifications',
      'getNotifications',
      [1, 20],
      (service: UserService) => service.getNotifications(1, 20),
    ],
    [
      'the unread count',
      'getUnreadNotifications',
      [],
      (service: UserService) => service.getUnreadNotifications(),
    ],
    [
      'marking everything read',
      'markAllNotificationsAsRead',
      [],
      (service: UserService) => service.markAllNotificationsAsRead(),
    ],
  ])(
    'passes %s through to the api untouched',
    (
      _: string,
      method: string,
      args: unknown[],
      call: (service: UserService) => Observable<unknown>,
    ) => {
      const response: unknown = { marker: method };
      const apiMethod: ReturnType<typeof vi.fn> = vi.fn().mockReturnValue(of(response));
      TestBed.configureTestingModule({
        providers: [{ provide: ApiService, useValue: { [method]: apiMethod } }],
      });
      let received: unknown;

      call(TestBed.inject(UserService)).subscribe((value: unknown) => {
        received = value;
      });

      expect(apiMethod).toHaveBeenCalledExactlyOnceWith(...args);
      expect(received).toBe(response);
    },
  );
});
