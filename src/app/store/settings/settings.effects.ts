import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { concatLatestFrom } from '@ngrx/operators';
import { catchError, concatMap, exhaustMap, filter, map, of, switchMap, tap } from 'rxjs';
import { UserService } from '../../features/services/user-service/user.service';
import { AccentThemeService } from '../../features/services/accent-theme-service/accent-theme.service';
import { SnackbarService } from '../../shared/services/snackbar-service/snackbar.service';
import { TranslationService } from '../../shared/services/translation-service/translation.service';
import { Constants } from '../../core/constants/constants';
import { GeneralSettingsPageActions } from '../ui/general-settings-page.actions';
import { MainLayoutActions } from '../ui/main-layout.actions';
import { untilLayoutClosed } from '../shared/session.operators';
import { SettingsApiActions } from './settings.actions';
import { settingsFeature } from './settings.feature';

import type { Action } from '@ngrx/store';
import type { IGeneralSettings } from '../../core/models/settings.model';

export const loadSettings = createEffect(
  (
    actions$: Actions = inject(Actions),
    store: Store = inject(Store),
    userService: UserService = inject(UserService),
    platformId: object = inject(PLATFORM_ID),
  ) => {
    return actions$.pipe(
      ofType(MainLayoutActions.opened, GeneralSettingsPageActions.opened),
      filter(() => isPlatformBrowser(platformId)),
      concatLatestFrom(() => store.select(settingsFeature.selectIsLoaded)),
      filter(([, isLoaded]: [Action, boolean]) => !isLoaded),
      exhaustMap(() =>
        userService.getGeneralSettings().pipe(
          map((settings: IGeneralSettings) =>
            SettingsApiActions.settingsLoaded({ settings: settings }),
          ),
          catchError(() => of(SettingsApiActions.settingsLoadFailed())),
          untilLayoutClosed(actions$),
        ),
      ),
    );
  },
  { functional: true },
);

export const saveSettings = createEffect(
  (
    actions$: Actions = inject(Actions),
    store: Store = inject(Store),
    userService: UserService = inject(UserService),
  ) => {
    return actions$.pipe(
      ofType(MainLayoutActions.opened),
      switchMap(() =>
        actions$.pipe(
          ofType(GeneralSettingsPageActions.settingChanged),
          concatLatestFrom(() => [
            store.select(settingsFeature.selectSettings),
            store.select(settingsFeature.selectRevision),
          ]),
          concatMap(([, settings, revision]: [Action, IGeneralSettings, number]) =>
            userService.updateGeneralSettings(settings).pipe(
              map((savedSettings: IGeneralSettings) =>
                SettingsApiActions.settingsSaved({ settings: savedSettings, revision: revision }),
              ),
              catchError(() => of(SettingsApiActions.settingsSaveFailed({ revision: revision }))),
            ),
          ),
          untilLayoutClosed(actions$),
        ),
      ),
    );
  },
  { functional: true },
);

export const applySettings = createEffect(
  (
    actions$: Actions = inject(Actions),
    store: Store = inject(Store),
    accentThemeService: AccentThemeService = inject(AccentThemeService),
    translationService: TranslationService = inject(TranslationService),
  ) => {
    return actions$.pipe(
      ofType(
        SettingsApiActions.settingsLoaded,
        GeneralSettingsPageActions.settingChanged,
        SettingsApiActions.settingsSaved,
        SettingsApiActions.settingsSaveFailed,
      ),
      concatLatestFrom(() => store.select(settingsFeature.selectSettings)),
      tap(([, settings]: [Action, IGeneralSettings]) => {
        accentThemeService.apply(settings.accentColor);
        void translationService.use(settings.language);
      }),
    );
  },
  { functional: true, dispatch: false },
);

export const reportSettingsSaved = createEffect(
  (
    actions$: Actions = inject(Actions),
    store: Store = inject(Store),
    snackbarService: SnackbarService = inject(SnackbarService),
  ) => {
    return actions$.pipe(
      ofType(SettingsApiActions.settingsSaved),
      concatLatestFrom(() => store.select(settingsFeature.selectRevision)),
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

export const reportSettingsLoadFailure = createEffect(
  (
    actions$: Actions = inject(Actions),
    snackbarService: SnackbarService = inject(SnackbarService),
  ) => {
    return actions$.pipe(
      ofType(SettingsApiActions.settingsLoadFailed),
      tap(() => {
        snackbarService.error(Constants.SETTINGS_LOAD_FAILED);
      }),
    );
  },
  { functional: true, dispatch: false },
);

export const reportSettingsSaveFailure = createEffect(
  (
    actions$: Actions = inject(Actions),
    snackbarService: SnackbarService = inject(SnackbarService),
  ) => {
    return actions$.pipe(
      ofType(SettingsApiActions.settingsSaveFailed),
      tap(() => {
        snackbarService.error(Constants.SETTINGS_SAVE_FAILED);
      }),
    );
  },
  { functional: true, dispatch: false },
);
