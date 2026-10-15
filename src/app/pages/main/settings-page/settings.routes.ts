import { Links } from '../../../core/constants/links';

import type { Routes } from '@angular/router';

export const SETTINGS_ROUTES: Routes = [
  {
    path: Links.DEFAULT_PATH,
    redirectTo: Links.GENERAL_SETTINGS_PATH,
    pathMatch: 'full',
  },
  {
    path: Links.GENERAL_SETTINGS_PATH,
    loadComponent: () =>
      import('./general-settings-page/general-settings-page.component').then(
        (c) => c.GeneralSettingsPageComponent,
      ),
  },
  {
    path: Links.ACCOUNT_SETTINGS_PATH,
    loadComponent: () =>
      import('./account-settings-page/account-settings-page.component').then(
        (c) => c.AccountSettingsPageComponent,
      ),
  },
];
