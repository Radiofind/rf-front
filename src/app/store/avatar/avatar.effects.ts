import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, filter, map, of, pairwise, switchMap, takeUntil, tap } from 'rxjs';
import { UserService } from '../../features/services/user-service/user.service';
import { MainLayoutActions } from '../ui/main-layout.actions';
import { ProfilePageActions } from '../ui/profile-page.actions';
import { UserApiActions } from '../user/user.actions';
import { AvatarActions } from './avatar.actions';
import { avatarFeature } from './avatar.feature';

import type { Observable } from 'rxjs';
import type { Action } from '@ngrx/store';
import type { ICurrentUser } from '../../core/models/user.model';

export const loadAvatar = createEffect(
  (actions$: Actions = inject(Actions), userService: UserService = inject(UserService)) => {
    return actions$.pipe(
      ofType(UserApiActions.currentUserLoaded),
      switchMap(({ user }: { user: ICurrentUser }): Observable<Action> => {
        if (!user.avatarUrl) {
          return of(AvatarActions.urlChanged({ url: null }));
        }

        return userService.getCurrentAvatar().pipe(
          map((avatar: Blob) => AvatarActions.urlChanged({ url: URL.createObjectURL(avatar) })),
          catchError(() => of(AvatarActions.urlChanged({ url: null }))),
          takeUntil(
            actions$.pipe(ofType(ProfilePageActions.avatarChanged, MainLayoutActions.closed)),
          ),
        );
      }),
    );
  },
  { functional: true },
);

export const applyChangedAvatar = createEffect(
  (actions$: Actions = inject(Actions)) => {
    return actions$.pipe(
      ofType(ProfilePageActions.avatarChanged),
      map(({ avatar }: { avatar: Blob | null }) =>
        AvatarActions.urlChanged({ url: avatar ? URL.createObjectURL(avatar) : null }),
      ),
    );
  },
  { functional: true },
);

export const releaseReplacedAvatar = createEffect(
  (store: Store = inject(Store)) => {
    return store.select(avatarFeature.selectUrl).pipe(
      pairwise(),
      map(([previous]: [string | null, string | null]) => previous),
      filter((previous: string | null): previous is string => previous !== null),
      tap((previous: string) => {
        URL.revokeObjectURL(previous);
      }),
    );
  },
  { functional: true, dispatch: false },
);
