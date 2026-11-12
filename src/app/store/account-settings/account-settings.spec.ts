import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { provideState, provideStore, Store } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { of, throwError } from 'rxjs';
import { accountSettingsFeature } from './account-settings.feature';
import * as accountSettingsEffects from './account-settings.effects';
import { UserService } from '../../features/services/user-service/user.service';
import { SnackbarService } from '../../shared/services/snackbar-service/snackbar.service';
import { AccountSettingsPageActions } from '../ui/account-settings-page.actions';
import { MainLayoutActions } from '../ui/main-layout.actions';
import { Constants } from '../../core/constants/constants';
import { DEFAULT_NOTIFICATION_SETTINGS } from '../../features/constants/settings.constant';
import { TwoFactorMethodEnum } from '../../core/enums/two-factor-method.enum';

import type { INotificationSettings, ISecurityOverview } from '../../core/models/settings.model';

describe('account settings state', () => {
  const storedNotifications: INotificationSettings = {
    trackUpdates: false,
    radioUpdates: true,
    likes: true,
  };

  const storedSecurity: ISecurityOverview = {
    twoFactorMethod: TwoFactorMethodEnum.EMAIL,
    email: 'ad***@example.com',
    recoveryEmail: null,
    backupCodesRemaining: 4,
  };

  let getNotificationSettings: ReturnType<typeof vi.fn>;
  let updateNotificationSettings: ReturnType<typeof vi.fn>;
  let getSecurityOverview: ReturnType<typeof vi.fn>;
  let success: ReturnType<typeof vi.fn>;
  let error: ReturnType<typeof vi.fn>;

  const configure = (): Store => {
    TestBed.configureTestingModule({
      providers: [
        provideStore(),
        provideState(accountSettingsFeature),
        provideEffects(accountSettingsEffects),
        { provide: PLATFORM_ID, useValue: 'browser' },
        {
          provide: UserService,
          useValue: {
            getNotificationSettings: getNotificationSettings,
            updateNotificationSettings: updateNotificationSettings,
            getSecurityOverview: getSecurityOverview,
          },
        },
        { provide: SnackbarService, useValue: { success: success, error: error } },
      ],
    });
    return TestBed.inject<Store>(Store);
  };

  const notifications = (store: Store): INotificationSettings =>
    store.selectSignal(accountSettingsFeature.selectNotifications)();

  beforeEach(() => {
    TestBed.resetTestingModule();
    getNotificationSettings = vi.fn().mockReturnValue(of(storedNotifications));
    updateNotificationSettings = vi.fn((changed: INotificationSettings) => of(changed));
    getSecurityOverview = vi.fn().mockReturnValue(of(storedSecurity));
    success = vi.fn();
    error = vi.fn();
  });

  it('loads notifications and security when the page opens', () => {
    const store: Store = configure();

    store.dispatch(AccountSettingsPageActions.opened());

    expect(notifications(store)).toEqual(storedNotifications);
    expect(store.selectSignal(accountSettingsFeature.selectSecurity)()).toEqual(storedSecurity);
  });

  it('does not reload settings that are already loaded', () => {
    const store: Store = configure();
    store.dispatch(AccountSettingsPageActions.opened());

    store.dispatch(AccountSettingsPageActions.opened());

    expect(getNotificationSettings).toHaveBeenCalledOnce();
  });

  it('tells the user when loading fails', () => {
    getSecurityOverview.mockReturnValue(throwError(() => ({ status: 500 })));
    const store: Store = configure();

    store.dispatch(AccountSettingsPageActions.opened());

    expect(notifications(store)).toEqual(DEFAULT_NOTIFICATION_SETTINGS);
    expect(error).toHaveBeenCalledWith(Constants.SETTINGS_LOAD_FAILED);
  });

  it('saves the whole notification settings after a change', () => {
    const store: Store = configure();
    store.dispatch(MainLayoutActions.opened());
    store.dispatch(AccountSettingsPageActions.opened());

    store.dispatch(
      AccountSettingsPageActions.notificationSettingChanged({ changes: { likes: false } }),
    );

    expect(updateNotificationSettings).toHaveBeenCalledWith({
      ...storedNotifications,
      likes: false,
    });
    expect(success).toHaveBeenCalledWith(Constants.SETTINGS_SAVED);
  });

  it('rolls back to the saved notification settings when the save fails', () => {
    updateNotificationSettings.mockReturnValue(throwError(() => ({ status: 500 })));
    const store: Store = configure();
    store.dispatch(MainLayoutActions.opened());
    store.dispatch(AccountSettingsPageActions.opened());

    store.dispatch(
      AccountSettingsPageActions.notificationSettingChanged({ changes: { likes: false } }),
    );

    expect(notifications(store)).toEqual(storedNotifications);
    expect(error).toHaveBeenCalledWith(Constants.SETTINGS_SAVE_FAILED);
  });

  it('keeps the security state the dialogs report', () => {
    const store: Store = configure();

    store.dispatch(
      AccountSettingsPageActions.securityChanged({
        security: { ...storedSecurity, twoFactorMethod: TwoFactorMethodEnum.AUTHENTICATOR },
      }),
    );

    expect(store.selectSignal(accountSettingsFeature.selectSecurity)()).toEqual({
      ...storedSecurity,
      twoFactorMethod: TwoFactorMethodEnum.AUTHENTICATOR,
    });
  });

  it('confirms the deletion of the account', () => {
    const store: Store = configure();

    store.dispatch(AccountSettingsPageActions.accountDeleted());

    expect(success).toHaveBeenCalledWith(Constants.ACCOUNT_DELETED);
  });
});
