import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { provideState, provideStore, Store } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { of, throwError } from 'rxjs';
import { publicProfileFeature } from './public-profile.feature';
import * as publicProfileEffects from './public-profile.effects';
import { PublicProfileService } from '../../features/services/public-profile-service/public-profile.service';
import { SnackbarService } from '../../shared/services/snackbar-service/snackbar.service';
import { PublicProfilePageActions } from '../ui/public-profile-page.actions';
import { Constants } from '../../core/constants/constants';
import { PublicProfileStatusEnum } from '../../core/enums/public-profile-status.enum';

import type { IPage } from '../../core/models/page.model';
import type { IPublicProfile, IPublicProfileDetails } from '../../core/models/public-profile.model';
import type { ITrack } from '../../core/models/track.model';

describe('public profile state', () => {
  const publicId: string = '6f1c2b4e-3d5a-4c8e-9b7f-1a2b3c4d5e6f';

  const details: IPublicProfileDetails = {
    artistType: 'ARTIST',
    mainGenres: [],
    additionalGenres: [],
    shortDescription: null,
    description: null,
    socialLinks: null,
    followersCount: 4,
    tracksCount: 2,
    likesCount: 9,
    joinedAt: '2025-03',
  };

  const visible: IPublicProfile = {
    publicId: publicId,
    displayName: 'Nova',
    avatarUrl: null,
    access: 'FULL',
    own: false,
    following: false,
    canFollow: true,
    details: details,
  };

  const restricted: IPublicProfile = {
    ...visible,
    access: 'RESTRICTED',
    details: null,
  };

  const first = { id: 1 } as ITrack;

  const second = { id: 2 } as ITrack;

  const pageOf = (items: ITrack[], page: number, hasNext: boolean): IPage<ITrack> => ({
    items: items,
    page: page,
    size: 10,
    totalElements: 2,
    hasNext: hasNext,
  });

  let getProfile: ReturnType<typeof vi.fn>;
  let getTracks: ReturnType<typeof vi.fn>;
  let getAvatar: ReturnType<typeof vi.fn>;
  let follow: ReturnType<typeof vi.fn>;
  let navigate: ReturnType<typeof vi.fn>;
  let error: ReturnType<typeof vi.fn>;

  const configure = (platform: string = 'browser'): Store => {
    TestBed.configureTestingModule({
      providers: [
        provideStore(),
        provideState(publicProfileFeature),
        provideEffects(publicProfileEffects),
        { provide: PLATFORM_ID, useValue: platform },
        {
          provide: PublicProfileService,
          useValue: {
            getProfile: getProfile,
            getTracks: getTracks,
            getAvatar: getAvatar,
            follow: follow,
            unfollow: follow,
          },
        },
        { provide: Router, useValue: { navigate: navigate } },
        { provide: SnackbarService, useValue: { error: error } },
      ],
    });
    return TestBed.inject<Store>(Store);
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    getProfile = vi.fn().mockReturnValue(of(visible));
    getTracks = vi.fn().mockReturnValue(of(pageOf([first], 0, true)));
    getAvatar = vi.fn().mockReturnValue(of(new Blob()));
    follow = vi.fn().mockReturnValue(of(undefined));
    navigate = vi.fn().mockResolvedValue(true);
    error = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads the opened profile', () => {
    const store: Store = configure();

    store.dispatch(PublicProfilePageActions.opened({ publicId: publicId }));

    expect(getProfile).toHaveBeenCalledWith(publicId);
    expect(store.selectSignal(publicProfileFeature.selectStatus)()).toBe(
      PublicProfileStatusEnum.LOADED,
    );
    expect(store.selectSignal(publicProfileFeature.selectProfile)()).toEqual(visible);
  });

  it.each([
    [410, PublicProfileStatusEnum.DELETED],
    [404, PublicProfileStatusEnum.NOT_FOUND],
    [400, PublicProfileStatusEnum.NOT_FOUND],
    [500, PublicProfileStatusEnum.FAILED],
  ])('ends up %s → %s when the profile cannot be read', (status: number, expected) => {
    getProfile.mockReturnValue(throwError(() => new HttpErrorResponse({ status: status })));
    const store: Store = configure();

    store.dispatch(PublicProfilePageActions.opened({ publicId: publicId }));

    expect(store.selectSignal(publicProfileFeature.selectStatus)()).toBe(expected);
  });

  it('sends the viewer to their own profile page', () => {
    getProfile.mockReturnValue(of({ ...visible, own: true }));
    const store: Store = configure();

    store.dispatch(PublicProfilePageActions.opened({ publicId: publicId }));

    expect(navigate).toHaveBeenCalledWith(['profile'], { replaceUrl: true });
    expect(getTracks).not.toHaveBeenCalled();
  });

  it('loads the first page of tracks of a visible profile', () => {
    const store: Store = configure();

    store.dispatch(PublicProfilePageActions.opened({ publicId: publicId }));

    expect(getTracks).toHaveBeenCalledWith(publicId, 0, 10);
    expect(store.selectSignal(publicProfileFeature.selectTracks)()).toEqual([first]);
    expect(store.selectSignal(publicProfileFeature.selectHasMoreTracks)()).toBe(true);
  });

  it('loads no tracks of a restricted profile', () => {
    getProfile.mockReturnValue(of(restricted));
    const store: Store = configure();

    store.dispatch(PublicProfilePageActions.opened({ publicId: publicId }));

    expect(getTracks).not.toHaveBeenCalled();
    expect(store.selectSignal(publicProfileFeature.selectTracks)()).toBeNull();
  });

  it('appends the next page of tracks', () => {
    const store: Store = configure();
    store.dispatch(PublicProfilePageActions.opened({ publicId: publicId }));
    getTracks.mockReturnValue(of(pageOf([second], 1, false)));

    store.dispatch(PublicProfilePageActions.moreTracksClicked());

    expect(getTracks).toHaveBeenLastCalledWith(publicId, 1, 10);
    expect(store.selectSignal(publicProfileFeature.selectTracks)()).toEqual([first, second]);
    expect(store.selectSignal(publicProfileFeature.selectHasMoreTracks)()).toBe(false);
  });

  it('reloads the profile after following, which may unlock its tracks', () => {
    getProfile.mockReturnValue(of(restricted));
    const store: Store = configure();
    store.dispatch(PublicProfilePageActions.opened({ publicId: publicId }));
    getProfile.mockReturnValue(of({ ...visible, following: true }));

    store.dispatch(PublicProfilePageActions.followClicked());

    expect(follow).toHaveBeenCalledWith(publicId);
    expect(store.selectSignal(publicProfileFeature.selectProfile)()?.following).toBe(true);
    expect(store.selectSignal(publicProfileFeature.selectTracks)()).toEqual([first]);
    expect(store.selectSignal(publicProfileFeature.selectIsFollowPending)()).toBe(false);
  });

  it('tells the user when following fails and lets them try again', () => {
    follow.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    const store: Store = configure();
    store.dispatch(PublicProfilePageActions.opened({ publicId: publicId }));

    store.dispatch(PublicProfilePageActions.followClicked());

    expect(error).toHaveBeenCalledWith(Constants.FOLLOW_FAILED);
    expect(store.selectSignal(publicProfileFeature.selectIsFollowPending)()).toBe(false);
  });

  it('shows the avatar from its own object url and releases it when the page is left', () => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:avatar');
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    getProfile.mockReturnValue(of({ ...visible, avatarUrl: `/api/users/${publicId}/avatar` }));
    const store: Store = configure();
    store.dispatch(PublicProfilePageActions.opened({ publicId: publicId }));

    expect(store.selectSignal(publicProfileFeature.selectAvatarUrl)()).toBe('blob:avatar');

    store.dispatch(PublicProfilePageActions.left());

    expect(revoke).toHaveBeenCalledWith('blob:avatar');
  });

  it('does not load during server rendering', () => {
    const store: Store = configure('server');

    store.dispatch(PublicProfilePageActions.opened({ publicId: publicId }));

    expect(getProfile).not.toHaveBeenCalled();
  });
});
