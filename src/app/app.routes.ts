import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { Links } from './core/constants/links';
import { Constants } from './core/constants/constants';
import { noLoginGuard } from './core/guards/auto-login.guard';

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
    path: Links.UPLOADS_URL,
    canActivate: [authGuard],
    loadComponent: () => import('./pages/uploads-page/uploads-page.component').then(c => c.UploadsPageComponent),
  }
];
