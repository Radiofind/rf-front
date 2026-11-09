import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, filter, map, of, switchMap, tap } from 'rxjs';
import { UserService } from '../../features/services/user-service/user.service';
import { SnackbarService } from '../../shared/services/snackbar-service/snackbar.service';
import { Constants } from '../../core/constants/constants';
import { LATEST_ACTIVITY_SIZE } from '../../features/constants/notification.constant';
import { ProfilePageActions } from '../ui/profile-page.actions';
import { UploadTrackPageActions } from '../ui/upload-track-page.actions';
import { untilLayoutClosed } from '../shared/session.operators';
import { ProfileApiActions } from './profile.actions';

import type { IUserProfileData } from '../../core/models/user.model';
import type { IActivity } from '../../core/models/activity.model';
import type { IPage } from '../../core/models/page.model';

export const loadProfile = createEffect(
  (
    actions$: Actions = inject(Actions),
    userService: UserService = inject(UserService),
    platformId: object = inject(PLATFORM_ID),
  ) => {
    return actions$.pipe(
      ofType(ProfilePageActions.opened, UploadTrackPageActions.opened),
      filter(() => isPlatformBrowser(platformId)),
      switchMap(() =>
        userService.getUserProfileData().pipe(
          map((profile: IUserProfileData) => ProfileApiActions.profileLoaded({ profile: profile })),
          catchError(() => of(ProfileApiActions.profileLoadFailed())),
          untilLayoutClosed(actions$),
        ),
      ),
    );
  },
  { functional: true },
);

export const loadActivities = createEffect(
  (
    actions$: Actions = inject(Actions),
    userService: UserService = inject(UserService),
    platformId: object = inject(PLATFORM_ID),
  ) => {
    return actions$.pipe(
      ofType(ProfilePageActions.opened),
      filter(() => isPlatformBrowser(platformId)),
      switchMap(() =>
        userService.getActivities(Constants.ZERO, LATEST_ACTIVITY_SIZE).pipe(
          map((page: IPage<IActivity>) =>
            ProfileApiActions.activitiesLoaded({ activities: page.items }),
          ),
          catchError(() => of(ProfileApiActions.activitiesLoadFailed())),
          untilLayoutClosed(actions$),
        ),
      ),
    );
  },
  { functional: true },
);

export const reportProfileLoadFailure = createEffect(
  (
    actions$: Actions = inject(Actions),
    snackbarService: SnackbarService = inject(SnackbarService),
  ) => {
    return actions$.pipe(
      ofType(ProfileApiActions.profileLoadFailed),
      tap(() => {
        snackbarService.error(Constants.PROFILE_LOAD_FAILED);
      }),
    );
  },
  { functional: true, dispatch: false },
);
