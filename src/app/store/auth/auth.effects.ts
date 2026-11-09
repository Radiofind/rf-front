import { DOCUMENT, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY, filter, fromEvent, map, tap } from 'rxjs';
import { TokenStorageService } from '../../core/services/token-storage/token-storage.service';
import { Constants } from '../../core/constants/constants';
import { Links } from '../../core/constants/links';
import { AuthFormActions } from '../ui/auth-form.actions';
import { TwoFactorModalActions } from '../ui/two-factor-modal.actions';
import { signOutActions, TokenStorageActions } from './auth.actions';

export const persistToken = createEffect(
  (
    actions$: Actions = inject(Actions),
    tokenStorage: TokenStorageService = inject(TokenStorageService),
  ) => {
    return actions$.pipe(
      ofType(AuthFormActions.registered, TwoFactorModalActions.verified),
      tap(({ token }: { token: string }) => {
        tokenStorage.write(token);
      }),
    );
  },
  { functional: true, dispatch: false },
);

export const signOut = createEffect(
  (
    actions$: Actions = inject(Actions),
    tokenStorage: TokenStorageService = inject(TokenStorageService),
    router: Router = inject(Router),
  ) => {
    return actions$.pipe(
      ofType(...signOutActions),
      tap(() => {
        tokenStorage.clear();
        void router.navigate([Links.LOGIN_URL]);
      }),
    );
  },
  { functional: true, dispatch: false },
);

export const syncTokenAcrossTabs = createEffect(
  (document: Document = inject(DOCUMENT), platformId: object = inject(PLATFORM_ID)) => {
    const window: Window | null = document.defaultView;

    if (!isPlatformBrowser(platformId) || !window) {
      return EMPTY;
    }

    return fromEvent<StorageEvent>(window, Constants.STORAGE_EVENT).pipe(
      filter((event: StorageEvent) => event.key === Constants.TOKEN_KEY),
      map((event: StorageEvent) => TokenStorageActions.tokenChanged({ token: event.newValue })),
    );
  },
  { functional: true },
);
