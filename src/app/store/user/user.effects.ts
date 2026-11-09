import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, filter, map, of, switchMap } from 'rxjs';
import { UserService } from '../../features/services/user-service/user.service';
import { MainLayoutActions } from '../ui/main-layout.actions';
import { untilLayoutClosed } from '../shared/session.operators';
import { UserApiActions } from './user.actions';

import type { ICurrentUser } from '../../core/models/user.model';

export const loadCurrentUser = createEffect(
  (
    actions$: Actions = inject(Actions),
    userService: UserService = inject(UserService),
    platformId: object = inject(PLATFORM_ID),
  ) => {
    return actions$.pipe(
      ofType(MainLayoutActions.opened),
      filter(() => isPlatformBrowser(platformId)),
      switchMap(() =>
        userService.getCurrentUserData().pipe(
          map((user: ICurrentUser) => UserApiActions.currentUserLoaded({ user: user })),
          catchError(() => of(UserApiActions.currentUserLoadFailed())),
          untilLayoutClosed(actions$),
        ),
      ),
    );
  },
  { functional: true },
);
