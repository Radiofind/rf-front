import { Routes } from '@angular/router';
import { EMPTY_STRING } from './core/constants/constants';
import { authGuard } from './core/guards/auth.guard';
import { Links } from './core/constants/links';

export const emptyString = EMPTY_STRING;

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'my-uploads',
    pathMatch: 'full',
  },
  {
    path: Links.LOGIN_URL,
    loadComponent: () => import('./pages/auth-page/auth-page.component').then(c => c.AuthPageComponent),
  },
  {
    path: Links.REGISTER_URL,
    loadComponent: () => import('./pages/auth-page/auth-page.component').then(c => c.AuthPageComponent),
  },
  {
    path: Links.UPLOADS_URL,
    canActivate: [authGuard],
    loadComponent: () => import('./pages/uploads-page/uploads-page.component').then(c => c.UploadsPageComponent),
  }
];
