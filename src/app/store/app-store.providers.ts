import { isDevMode } from '@angular/core';
import { provideState, provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideAuthState } from './auth/auth.providers';
import { userFeature } from './user/user.feature';
import { avatarFeature } from './avatar/avatar.feature';
import { profileFeature } from './profile/profile.feature';
import { settingsFeature } from './settings/settings.feature';
import { notificationsFeature } from './notifications/notifications.feature';
import * as userEffects from './user/user.effects';
import * as avatarEffects from './avatar/avatar.effects';
import * as profileEffects from './profile/profile.effects';
import * as settingsEffects from './settings/settings.effects';
import * as notificationsEffects from './notifications/notifications.effects';

import type { EnvironmentProviders } from '@angular/core';

export function provideAppStore(): EnvironmentProviders[] {
  return [
    provideStore(
      {},
      {
        runtimeChecks: {
          strictStateImmutability: true,
          strictActionImmutability: true,
          strictStateSerializability: true,
        },
      },
    ),
    ...provideAuthState(),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
  ];
}

export function provideMainLayoutStore(): EnvironmentProviders[] {
  return [
    provideState(userFeature),
    provideState(avatarFeature),
    provideState(profileFeature),
    provideState(settingsFeature),
    provideState(notificationsFeature),
    provideEffects(
      userEffects,
      avatarEffects,
      profileEffects,
      settingsEffects,
      notificationsEffects,
    ),
  ];
}
