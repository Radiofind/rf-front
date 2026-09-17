import { authGuard } from './core/guards/auth.guard';
import { Links } from './core/constants/links';
import { Constants } from './core/constants/constants';
import { noLoginGuard } from './core/guards/auto-login.guard';
import { ErrorTypeEnum } from './core/enums/error-type.enum';

import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: Links.DEFAULT_PATH,
    redirectTo: Links.UPLOADS_URL,
    pathMatch: 'full',
  },
  {
    path: Links.LOGIN_URL,
    canActivate: [noLoginGuard],
    loadComponent: () => import('./pages/auth-page/auth-page.component').then(c => c.AuthPageComponent),
    data: { authType: Constants.LOGIN }
  },
  {
    path: Links.REGISTER_URL,
    loadComponent: () => import('./pages/auth-page/auth-page.component').then(c => c.AuthPageComponent),
    data: { authType: Constants.REGISTER }
  },
  {
    path: Links.RESET_PASSWORD_URL,
    loadComponent: () => import('./pages/reset-password-page/reset-password-page.component').then(c => c.ResetPasswordPageComponent),
  },
  {
    path: Links.UPLOADS_URL,
    canActivate: [authGuard],
    loadComponent: () => import('./pages/uploads-page/uploads-page.component').then(c => c.UploadsPageComponent),
  },
  {
    path: Links.FORBIDDEN_URL,
    loadComponent: () => import('./pages/error-page/error-page.component').then(c => c.ErrorPageComponent),
    data: { errorType: ErrorTypeEnum.FORBIDDEN }
  },
  {
    path: Links.SERVER_ERROR_URL,
    loadComponent: () => import('./pages/error-page/error-page.component').then(c => c.ErrorPageComponent),
    data: { errorType: ErrorTypeEnum.SERVER_ERROR }
  },
  {
    path: Links.NOT_FOUND_URL,
    loadComponent: () => import('./pages/error-page/error-page.component').then(c => c.ErrorPageComponent),
    data: { errorType: ErrorTypeEnum.NOT_FOUND }
  },
  {
    path: Links.WILDCARD_PATH,
    loadComponent: () => import('./pages/error-page/error-page.component').then(c => c.ErrorPageComponent),
    data: { errorType: ErrorTypeEnum.NOT_FOUND }
  }
];
