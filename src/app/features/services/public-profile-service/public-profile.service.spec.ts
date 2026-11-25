import { describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PublicProfileService } from './public-profile.service';
import { ApiService } from '../../../core/services/api/api.service';

import type { Observable } from 'rxjs';

describe('PublicProfileService', () => {
  const publicId: string = '6f1c2b4e-3d5a-4c8e-9b7f-1a2b3c4d5e6f';

  it.each([
    [
      'the profile',
      'getPublicProfile',
      [publicId],
      (service: PublicProfileService) => service.getProfile(publicId),
    ],
    [
      'the avatar download',
      'getPublicAvatar',
      [publicId],
      (service: PublicProfileService) => service.getAvatar(publicId),
    ],
    [
      'a page of tracks',
      'getPublicTracks',
      [publicId, 2, 10],
      (service: PublicProfileService) => service.getTracks(publicId, 2, 10),
    ],
    [
      'a follow',
      'followUser',
      [publicId],
      (service: PublicProfileService) => service.follow(publicId),
    ],
    [
      'an unfollow',
      'unfollowUser',
      [publicId],
      (service: PublicProfileService) => service.unfollow(publicId),
    ],
  ])(
    'passes %s through to the api untouched',
    (
      _: string,
      method: string,
      args: unknown[],
      call: (service: PublicProfileService) => Observable<unknown>,
    ) => {
      const response: unknown = { marker: method };
      const apiMethod: ReturnType<typeof vi.fn> = vi.fn().mockReturnValue(of(response));
      TestBed.configureTestingModule({
        providers: [{ provide: ApiService, useValue: { [method]: apiMethod } }],
      });
      let received: unknown;

      call(TestBed.inject(PublicProfileService)).subscribe((value: unknown) => {
        received = value;
      });

      expect(apiMethod).toHaveBeenCalledExactlyOnceWith(...args);
      expect(received).toBe(response);
    },
  );
});
