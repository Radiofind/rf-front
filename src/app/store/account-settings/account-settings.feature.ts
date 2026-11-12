import { createFeature, createReducer, on } from '@ngrx/store';
import { Constants } from '../../core/constants/constants';
import { DEFAULT_NOTIFICATION_SETTINGS } from '../../features/constants/settings.constant';
import { AccountSettingsPageActions } from '../ui/account-settings-page.actions';
import { MainLayoutActions } from '../ui/main-layout.actions';
import { AccountSettingsApiActions } from './account-settings.actions';

import type { INotificationSettings, ISecurityOverview } from '../../core/models/settings.model';

export interface IAccountSettingsState {
  notifications: INotificationSettings;
  savedNotifications: INotificationSettings;
  security: ISecurityOverview | null;
  isLoaded: boolean;
  revision: number;
}

export const initialAccountSettingsState: IAccountSettingsState = {
  notifications: DEFAULT_NOTIFICATION_SETTINGS,
  savedNotifications: DEFAULT_NOTIFICATION_SETTINGS,
  security: null,
  isLoaded: false,
  revision: Constants.ZERO,
};

export const accountSettingsFeature = createFeature({
  name: 'accountSettings',
  reducer: createReducer(
    initialAccountSettingsState,
    on(
      AccountSettingsApiActions.accountSettingsLoaded,
      (
        state: IAccountSettingsState,
        {
          notifications,
          security,
        }: { notifications: INotificationSettings; security: ISecurityOverview },
      ): IAccountSettingsState => ({
        ...state,
        notifications: notifications,
        savedNotifications: notifications,
        security: security,
        isLoaded: true,
      }),
    ),
    on(
      AccountSettingsPageActions.notificationSettingChanged,
      (
        state: IAccountSettingsState,
        { changes }: { changes: Partial<INotificationSettings> },
      ): IAccountSettingsState => ({
        ...state,
        notifications: { ...state.notifications, ...changes },
        revision: state.revision + Constants.ONE,
      }),
    ),
    on(
      AccountSettingsApiActions.notificationSettingsSaved,
      (
        state: IAccountSettingsState,
        { notifications, revision }: { notifications: INotificationSettings; revision: number },
      ): IAccountSettingsState => ({
        ...state,
        notifications: revision === state.revision ? notifications : state.notifications,
        savedNotifications: notifications,
      }),
    ),
    on(
      AccountSettingsApiActions.notificationSettingsSaveFailed,
      (
        state: IAccountSettingsState,
        { revision }: { revision: number },
      ): IAccountSettingsState => ({
        ...state,
        notifications: revision === state.revision ? state.savedNotifications : state.notifications,
      }),
    ),
    on(
      AccountSettingsPageActions.securityChanged,
      (
        state: IAccountSettingsState,
        { security }: { security: ISecurityOverview },
      ): IAccountSettingsState => ({
        ...state,
        security: security,
      }),
    ),
    on(MainLayoutActions.closed, (): IAccountSettingsState => initialAccountSettingsState),
  ),
});
