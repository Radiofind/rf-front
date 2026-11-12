import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { AccountSettingsPageActions } from '../ui/account-settings-page.actions';
import { EditProfilePageActions } from '../ui/edit-profile-page.actions';
import { HeaderActions } from '../ui/header.actions';

export const AuthApiActions = createActionGroup({
  source: 'Auth API',
  events: {
    'Session Rejected': emptyProps(),
  },
});

export const TokenStorageActions = createActionGroup({
  source: 'Token Storage',
  events: {
    'Token Changed': props<{ token: string | null }>(),
  },
});

export const signOutActions = [
  HeaderActions.logOutClicked,
  EditProfilePageActions.reauthenticationRequired,
  AuthApiActions.sessionRejected,
  AccountSettingsPageActions.accountDeleted,
] as const;
