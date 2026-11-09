import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideStore, provideState, Store } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { of, Subject, throwError } from 'rxjs';
import { avatarFeature } from './avatar.feature';
import * as avatarEffects from './avatar.effects';
import { UserService } from '../../features/services/user-service/user.service';
import { UserApiActions } from '../user/user.actions';
import { ProfilePageActions } from '../ui/profile-page.actions';
import { MainLayoutActions } from '../ui/main-layout.actions';

describe('avatar state', () => {
  const avatar: Blob = new Blob(['avatar'], { type: 'image/png' });

  let store: Store;
  let getCurrentAvatar: ReturnType<typeof vi.fn>;
  let createObjectURL: ReturnType<typeof vi.fn>;
  let revokeObjectURL: ReturnType<typeof vi.fn>;

  const avatarUrl = (): string | null => store.selectSignal(avatarFeature.selectUrl)();

  beforeEach(() => {
    TestBed.resetTestingModule();
    getCurrentAvatar = vi.fn().mockReturnValue(of(avatar));
    createObjectURL = vi.fn().mockReturnValue('blob:avatar');
    revokeObjectURL = vi.fn();
    Object.assign(URL, { createObjectURL: createObjectURL, revokeObjectURL: revokeObjectURL });

    TestBed.configureTestingModule({
      providers: [
        provideStore(),
        provideState(avatarFeature),
        provideEffects(avatarEffects),
        { provide: UserService, useValue: { getCurrentAvatar: getCurrentAvatar } },
      ],
    });
    store = TestBed.inject(Store);
  });

  afterEach(() => {
    Reflect.deleteProperty(URL, 'createObjectURL');
    Reflect.deleteProperty(URL, 'revokeObjectURL');
  });

  it('shows the avatar of a user who has one', () => {
    store.dispatch(
      UserApiActions.currentUserLoaded({
        user: { name: 'Ada', surname: 'Lovelace', email: 'ada@example.com', avatarUrl: '/me' },
      }),
    );

    expect(createObjectURL).toHaveBeenCalledWith(avatar);
    expect(avatarUrl()).toBe('blob:avatar');
  });

  it('does not request the image when the user has no avatar', () => {
    store.dispatch(
      UserApiActions.currentUserLoaded({
        user: { name: 'Ada', surname: 'Lovelace', email: 'ada@example.com', avatarUrl: null },
      }),
    );

    expect(getCurrentAvatar).not.toHaveBeenCalled();
    expect(avatarUrl()).toBeNull();
  });

  it('treats a missing avatar file as no avatar', () => {
    getCurrentAvatar.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 })));

    store.dispatch(
      UserApiActions.currentUserLoaded({
        user: { name: 'Ada', surname: 'Lovelace', email: 'ada@example.com', avatarUrl: '/me' },
      }),
    );

    expect(avatarUrl()).toBeNull();
  });

  it('replaces the avatar and releases the previous image', () => {
    store.dispatch(ProfilePageActions.avatarChanged({ avatar: avatar }));
    createObjectURL.mockReturnValue('blob:uploaded');

    store.dispatch(ProfilePageActions.avatarChanged({ avatar: new Blob(['new']) }));

    expect(revokeObjectURL).toHaveBeenCalledWith('blob:avatar');
    expect(avatarUrl()).toBe('blob:uploaded');
  });

  it('releases the image when the avatar is removed', () => {
    store.dispatch(ProfilePageActions.avatarChanged({ avatar: avatar }));

    store.dispatch(ProfilePageActions.avatarChanged({ avatar: null }));

    expect(revokeObjectURL).toHaveBeenCalledWith('blob:avatar');
    expect(avatarUrl()).toBeNull();
  });

  it('keeps a newer avatar when a stale load finishes later', () => {
    const avatar$: Subject<Blob> = new Subject<Blob>();
    getCurrentAvatar.mockReturnValue(avatar$);
    store.dispatch(
      UserApiActions.currentUserLoaded({
        user: { name: 'Ada', surname: 'Lovelace', email: 'ada@example.com', avatarUrl: '/me' },
      }),
    );
    createObjectURL.mockReturnValue('blob:uploaded');

    store.dispatch(ProfilePageActions.avatarChanged({ avatar: new Blob(['uploaded']) }));
    avatar$.next(avatar);

    expect(avatarUrl()).toBe('blob:uploaded');
    expect(createObjectURL).toHaveBeenCalledOnce();
  });

  it('releases the image when the layout closes', () => {
    store.dispatch(ProfilePageActions.avatarChanged({ avatar: avatar }));

    store.dispatch(MainLayoutActions.closed());

    expect(revokeObjectURL).toHaveBeenCalledWith('blob:avatar');
    expect(avatarUrl()).toBeNull();
  });
});
