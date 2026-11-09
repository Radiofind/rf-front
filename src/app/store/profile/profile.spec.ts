import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { provideStore, provideState, Store } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { of, throwError } from 'rxjs';
import { profileFeature } from './profile.feature';
import * as profileEffects from './profile.effects';
import { ProfileApiActions } from './profile.actions';
import { UserService } from '../../features/services/user-service/user.service';
import { SnackbarService } from '../../shared/services/snackbar-service/snackbar.service';
import { ProfilePageActions } from '../ui/profile-page.actions';
import { UploadTrackPageActions } from '../ui/upload-track-page.actions';
import { EditProfilePageActions } from '../ui/edit-profile-page.actions';
import { MainLayoutActions } from '../ui/main-layout.actions';
import { Constants } from '../../core/constants/constants';
import { LATEST_ACTIVITY_SIZE } from '../../features/constants/notification.constant';

import type { IUserProfileData } from '../../core/models/user.model';
import type { IActivity } from '../../core/models/activity.model';

describe('profile state', () => {
  const profile: IUserProfileData = {
    name: 'Ada',
    surname: 'Lovelace',
    artistName: 'Nova',
    artistType: 'BAND',
  } as IUserProfileData;

  const activity: IActivity = {
    id: 3,
    type: 'TRACK_UPLOADED',
    createdAt: '2026-11-05T10:00:00Z',
    track: null,
  };

  let getUserProfileData: ReturnType<typeof vi.fn>;
  let getActivities: ReturnType<typeof vi.fn>;
  let error: ReturnType<typeof vi.fn>;

  const configure = (platform: string): Store => {
    TestBed.configureTestingModule({
      providers: [
        provideStore(),
        provideState(profileFeature),
        provideEffects(profileEffects),
        { provide: PLATFORM_ID, useValue: platform },
        {
          provide: UserService,
          useValue: { getUserProfileData: getUserProfileData, getActivities: getActivities },
        },
        { provide: SnackbarService, useValue: { error: error } },
      ],
    });
    return TestBed.inject<Store>(Store);
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    getUserProfileData = vi.fn().mockReturnValue(of(profile));
    getActivities = vi.fn().mockReturnValue(of({ items: [activity] }));
    error = vi.fn();
  });

  it('loads the profile and the latest activity for the profile page', () => {
    const store: Store = configure('browser');

    store.dispatch(ProfilePageActions.opened());

    expect(store.selectSignal(profileFeature.selectProfile)()).toEqual(profile);
    expect(getActivities).toHaveBeenCalledWith(0, LATEST_ACTIVITY_SIZE);
    expect(store.selectSignal(profileFeature.selectActivities)()).toEqual([activity]);
  });

  it('loads only the profile for the upload page', () => {
    const store: Store = configure('browser');

    store.dispatch(UploadTrackPageActions.opened());

    expect(store.selectSignal(profileFeature.selectArtistDisplayName)()).toBe('Nova');
    expect(getActivities).not.toHaveBeenCalled();
  });

  it('tells the user when the profile cannot be loaded', () => {
    getUserProfileData.mockReturnValue(throwError(() => new Error('offline')));
    const store: Store = configure('browser');

    store.dispatch(ProfilePageActions.opened());

    expect(error).toHaveBeenCalledWith(Constants.PROFILE_LOAD_FAILED);
  });

  it('leaves the activity unknown rather than empty when it cannot be loaded', () => {
    getActivities.mockReturnValue(throwError(() => new Error('offline')));
    const store: Store = configure('browser');

    store.dispatch(ProfilePageActions.opened());

    expect(store.selectSignal(profileFeature.selectActivities)()).toBeNull();
    expect(error).not.toHaveBeenCalled();
  });

  it('does not load during server rendering', () => {
    const store: Store = configure('server');

    store.dispatch(ProfilePageActions.opened());

    expect(getUserProfileData).not.toHaveBeenCalled();
  });

  it.each([
    ['  Nova  ', 'Nova'],
    ['   ', 'Ada Lovelace'],
    [null, 'Ada Lovelace'],
  ])('shows the artist name %j as %j', (artistName: string | null, displayName: string) => {
    const store: Store = configure('browser');

    store.dispatch(
      ProfileApiActions.profileLoaded({
        profile: { name: 'Ada', surname: 'Lovelace', artistName: artistName } as IUserProfileData,
      }),
    );

    expect(store.selectSignal(profileFeature.selectArtistDisplayName)()).toBe(displayName);
  });

  it('treats a profile without an artist type as a solo artist', () => {
    const store: Store = configure('browser');

    store.dispatch(
      ProfileApiActions.profileLoaded({
        profile: { name: 'Ada', surname: 'Lovelace', artistType: null } as IUserProfileData,
      }),
    );

    expect(store.selectSignal(profileFeature.selectArtistType)()).toBe('ARTIST');
  });

  it('shows the saved profile without reloading it', () => {
    const store: Store = configure('browser');
    store.dispatch(ProfilePageActions.opened());

    store.dispatch(
      EditProfilePageActions.profileSaved({
        profile: { ...profile, artistName: 'Supernova' },
      }),
    );

    expect(store.selectSignal(profileFeature.selectArtistDisplayName)()).toBe('Supernova');
  });

  it('forgets the profile and the activity when the layout closes', () => {
    const store: Store = configure('browser');
    store.dispatch(ProfilePageActions.opened());

    store.dispatch(MainLayoutActions.closed());

    expect(store.selectSignal(profileFeature.selectProfile)()).toBeNull();
    expect(store.selectSignal(profileFeature.selectActivities)()).toBeNull();
  });
});
