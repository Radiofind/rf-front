import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { provideStore, Store } from '@ngrx/store';
import { provideAuthState } from './auth.providers';
import { authFeature } from './auth.feature';
import { AuthApiActions } from './auth.actions';
import { TokenStorageService } from '../../core/services/token-storage/token-storage.service';
import { AuthFormActions } from '../ui/auth-form.actions';
import { TwoFactorModalActions } from '../ui/two-factor-modal.actions';
import { HeaderActions } from '../ui/header.actions';
import { EditProfilePageActions } from '../ui/edit-profile-page.actions';
import { Constants } from '../../core/constants/constants';
import { Links } from '../../core/constants/links';

import type { Action } from '@ngrx/store';

describe('auth state', () => {
  let read: ReturnType<typeof vi.fn>;
  let write: ReturnType<typeof vi.fn>;
  let clear: ReturnType<typeof vi.fn>;
  let navigate: ReturnType<typeof vi.fn>;

  const token = (): string | null => TestBed.inject(Store).selectSignal(authFeature.selectToken)();

  beforeEach(() => {
    TestBed.resetTestingModule();
    read = vi.fn().mockReturnValue('stored-jwt');
    write = vi.fn();
    clear = vi.fn();
    navigate = vi.fn().mockResolvedValue(true);

    TestBed.configureTestingModule({
      providers: [
        provideStore(),
        provideAuthState(),
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: TokenStorageService, useValue: { read: read, write: write, clear: clear } },
        { provide: Router, useValue: { navigate: navigate } },
      ],
    });
  });

  it('starts with the token kept from the previous visit', () => {
    expect(token()).toBe('stored-jwt');
  });

  it.each([
    ['registration', AuthFormActions.registered({ token: 'new-jwt' })],
    ['two factor verification', TwoFactorModalActions.verified({ token: 'new-jwt' })],
  ])('keeps the token issued after %s for later visits', (_: string, action: Action) => {
    TestBed.inject(Store).dispatch(action);

    expect(token()).toBe('new-jwt');
    expect(write).toHaveBeenCalledWith('new-jwt');
  });

  it.each([
    ['the user logs out', HeaderActions.logOutClicked()],
    ['a changed email requires a new sign in', EditProfilePageActions.reauthenticationRequired()],
    ['the api rejects the session', AuthApiActions.sessionRejected()],
  ])('forgets the token and opens the login page when %s', (_: string, action: Action) => {
    TestBed.inject(Store).dispatch(action);

    expect(token()).toBeNull();
    expect(clear).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith([Links.LOGIN_URL]);
  });

  it('follows a sign out made in another tab', () => {
    TestBed.inject(Store);

    window.dispatchEvent(
      new StorageEvent(Constants.STORAGE_EVENT, { key: Constants.TOKEN_KEY, newValue: null }),
    );

    expect(token()).toBeNull();
  });

  it('ignores storage changes of other keys', () => {
    TestBed.inject(Store);

    window.dispatchEvent(
      new StorageEvent(Constants.STORAGE_EVENT, { key: Constants.LANGUAGE_KEY, newValue: 'DE' }),
    );

    expect(token()).toBe('stored-jwt');
  });
});
