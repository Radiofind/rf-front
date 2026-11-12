import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { concatLatestFrom } from '@ngrx/operators';
import { catchError, concatMap, exhaustMap, filter, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { UserService } from '../../features/services/user-service/user.service';
import { SnackbarService } from '../../shared/services/snackbar-service/snackbar.service';
import { Constants } from '../../core/constants/constants';
import { AccountSettingsPageActions } from '../ui/account-settings-page.actions';
import { MainLayoutActions } from '../ui/main-layout.actions';
import { untilLayoutClosed } from '../shared/session.operators';
import { AccountSettingsApiActions } from './account-settings.actions';
import { accountSettingsFeature } from './account-settings.feature';

import type { Action } from '@ngrx/store';
import type { INotificationSettings } from '../../core/models/settings.model';

export const loadAccountSettings = createEffect(
  (
    actions$: Actions = inject(Actions),
    store: Store = inject(Store),
    userService: UserService = inject(UserService),
    platformId: object = inject(PLATFORM_ID),
  ) => {
    return actions$.pipe(
      ofType(AccountSettingsPageActions.opened),
      filter(() => isPlatformBrowser(platformId)),
      concatLatestFrom(() => store.select(accountSettingsFeature.selectIsLoaded)),
      filter(([, isLoaded]: [Action, boolean]) => !isLoaded),
      exhaustMap(() =>
        forkJoin({
          notifications: userService.getNotificationSettings(),
          security: userService.getSecurityOverview(),
        }).pipe(
          map((settings) => AccountSettingsApiActions.accountSettingsLoaded(settings)),
          catchError(() => of(AccountSettingsApiActions.accountSettingsLoadFailed())),
          untilLayoutClosed(actions$),
        ),
      ),
    );
  },
  { functional: true },
);

export const saveNotificationSettings = createEffect(
  (
    actions$: Actions = inject(Actions),
    store: Store = inject(Store),
    userService: UserService = inject(UserService),
  ) => {
    return actions$.pipe(
      ofType(MainLayoutActions.opened),
      switchMap(() =>
        actions$.pipe(
          ofType(AccountSettingsPageActions.notificationSettingChanged),
          concatLatestFrom(() => [
            store.select(accountSettingsFeature.selectNotifications),
            store.select(accountSettingsFeature.selectRevision),
          ]),
          concatMap(([, notifications, revision]: [Action, INotificationSettings, number]) =>
            userService.updateNotificationSettings(notifications).pipe(
              map((saved: INotificationSettings) =>
                AccountSettingsApiActions.notificationSettingsSaved({
                  notifications: saved,
                  revision: revision,
                }),
              ),
              catchError(() =>
                of(
                  AccountSettingsApiActions.notificationSettingsSaveFailed({ revision: revision }),
                ),
              ),
            ),
          ),
          untilLayoutClosed(actions$),
        ),
      ),
    );
  },
  { functional: true },
);

export const reportNotificationSettingsSaved = createEffect(
  (
    actions$: Actions = inject(Actions),
    store: Store = inject(Store),
    snackbarService: SnackbarService = inject(SnackbarService),
  ) => {
    return actions$.pipe(
      ofType(AccountSettingsApiActions.notificationSettingsSaved),
      concatLatestFrom(() => store.select(accountSettingsFeature.selectRevision)),
      filter(
        ([{ revision }, currentRevision]: [{ revision: number }, number]) =>
          revision === currentRevision,
      ),
      tap(() => {
        snackbarService.success(Constants.SETTINGS_SAVED);
      }),
    );
  },
  { functional: true, dispatch: false },
);

export const reportAccountSettingsFailure = createEffect(
  (
    actions$: Actions = inject(Actions),
    snackbarService: SnackbarService = inject(SnackbarService),
  ) => {
    return actions$.pipe(
      ofType(
        AccountSettingsApiActions.accountSettingsLoadFailed,
        AccountSettingsApiActions.notificationSettingsSaveFailed,
      ),
      tap((action: Action) => {
        snackbarService.error(
          action.type === AccountSettingsApiActions.accountSettingsLoadFailed.type
            ? Constants.SETTINGS_LOAD_FAILED
            : Constants.SETTINGS_SAVE_FAILED,
        );
      }),
    );
  },
  { functional: true, dispatch: false },
);

export const reportAccountDeleted = createEffect(
  (
    actions$: Actions = inject(Actions),
    snackbarService: SnackbarService = inject(SnackbarService),
  ) => {
    return actions$.pipe(
      ofType(AccountSettingsPageActions.accountDeleted),
      tap(() => {
        snackbarService.success(Constants.ACCOUNT_DELETED);
      }),
    );
  },
  { functional: true, dispatch: false },
);
