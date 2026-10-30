import {
  inject,
  isDevMode,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth/auth.interceptor';
import { loaderInterceptor } from './core/interceptors/loader/loader.interceptor';
import { unauthorizedInterceptor } from './core/interceptors/unauthorized/unauthorized.interceptor';
import { TranslationService } from './shared/services/translation-service/translation.service';
import { AccentThemeService } from './features/services/accent-theme-service/accent-theme.service';

import type { ApplicationConfig } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withRouterConfig({ canceledNavigationResolution: 'computed' })),
    provideClientHydration(withEventReplay()),
    provideStore(),
    provideEffects(),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    provideHttpClient(
      withInterceptors([loaderInterceptor, authInterceptor, unauthorizedInterceptor]),
    ),
    provideAppInitializer(() => inject(TranslationService).init()),
    provideAppInitializer(() => {
      inject(AccentThemeService).init();
    }),
  ],
};
