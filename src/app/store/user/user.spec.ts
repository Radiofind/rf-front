import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { provideStore, provideState, Store } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { of, Subject } from 'rxjs';
import { userFeature } from './user.feature';
import * as userEffects from './user.effects';
import { UserService } from '../../features/services/user-service/user.service';
import { MainLayoutActions } from '../ui/main-layout.actions';
import { EditProfilePageActions } from '../ui/edit-profile-page.actions';

import type { ICurrentUser, IUserProfileData } from '../../core/models/user.model';

describe('user state', () => {
  const currentUser: ICurrentUser = {
    name: 'Ada',
    surname: 'Lovelace',
    email: 'ada@example.com',
    avatarUrl: null,
  };

  let getCurrentUserData: ReturnType<typeof vi.fn>;

  const configure = (platform: string): Store => {
    TestBed.configureTestingModule({
      providers: [
        provideStore(),
        provideState(userFeature),
        provideEffects(userEffects),
        { provide: PLATFORM_ID, useValue: platform },
        { provide: UserService, useValue: { getCurrentUserData: getCurrentUserData } },
      ],
    });
    return TestBed.inject<Store>(Store);
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    getCurrentUserData = vi.fn().mockReturnValue(of(currentUser));
  });

  it('shows the name and email of the signed in user once the layout opens', () => {
    const store: Store = configure('browser');

    store.dispatch(MainLayoutActions.opened());

    expect(store.selectSignal(userFeature.selectFullName)()).toBe('Ada Lovelace');
    expect(store.selectSignal(userFeature.selectEmail)()).toBe('ada@example.com');
  });

  it('does not request the user during server rendering', () => {
    const store: Store = configure('server');

    store.dispatch(MainLayoutActions.opened());

    expect(getCurrentUserData).not.toHaveBeenCalled();
  });

  it('shows the new name right after the profile is saved', () => {
    const store: Store = configure('browser');
    store.dispatch(MainLayoutActions.opened());

    store.dispatch(
      EditProfilePageActions.profileSaved({
        profile: {
          name: 'Grace',
          surname: 'Hopper',
          email: 'grace@example.com',
          avatarUrl: null,
        } as IUserProfileData,
      }),
    );

    expect(store.selectSignal(userFeature.selectFullName)()).toBe('Grace Hopper');
    expect(store.selectSignal(userFeature.selectEmail)()).toBe('grace@example.com');
  });

  it('forgets the user when the layout closes', () => {
    const store: Store = configure('browser');
    store.dispatch(MainLayoutActions.opened());

    store.dispatch(MainLayoutActions.closed());

    expect(store.selectSignal(userFeature.selectCurrentUser)()).toBeNull();
  });

  it('ignores a user that arrives after the layout closed', () => {
    const user$: Subject<ICurrentUser> = new Subject<ICurrentUser>();
    getCurrentUserData.mockReturnValue(user$);
    const store: Store = configure('browser');
    store.dispatch(MainLayoutActions.opened());

    store.dispatch(MainLayoutActions.closed());
    user$.next(currentUser);

    expect(store.selectSignal(userFeature.selectCurrentUser)()).toBeNull();
  });
});
