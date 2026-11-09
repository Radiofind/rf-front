import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { provideStore, provideState, Store } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { of, Subject, throwError } from 'rxjs';
import { settingsFeature } from './settings.feature';
import * as settingsEffects from './settings.effects';
import { UserService } from '../../features/services/user-service/user.service';
import { AccentThemeService } from '../../features/services/accent-theme-service/accent-theme.service';
import { SnackbarService } from '../../shared/services/snackbar-service/snackbar.service';
import { TranslationService } from '../../shared/services/translation-service/translation.service';
import { GeneralSettingsPageActions } from '../ui/general-settings-page.actions';
import { MainLayoutActions } from '../ui/main-layout.actions';
import { Constants } from '../../core/constants/constants';
import { DEFAULT_GENERAL_SETTINGS } from '../../features/constants/settings.constant';

import type { IGeneralSettings } from '../../core/models/settings.model';

describe('settings state', () => {
  const storedSettings: IGeneralSettings = {
    language: 'DE',
    radioMode: false,
    profileVisibility: 'FOLLOWERS',
    notificationsEnabled: false,
    audioQuality: 'NORMAL',
    accentColor: 'OCEAN',
  };

  let getGeneralSettings: ReturnType<typeof vi.fn>;
  let updateGeneralSettings: ReturnType<typeof vi.fn>;
  let applyAccent: ReturnType<typeof vi.fn>;
  let useLanguage: ReturnType<typeof vi.fn>;
  let success: ReturnType<typeof vi.fn>;
  let error: ReturnType<typeof vi.fn>;

  const configure = (platform: string): Store => {
    TestBed.configureTestingModule({
      providers: [
        provideStore(),
        provideState(settingsFeature),
        provideEffects(settingsEffects),
        { provide: PLATFORM_ID, useValue: platform },
        {
          provide: UserService,
          useValue: {
            getGeneralSettings: getGeneralSettings,
            updateGeneralSettings: updateGeneralSettings,
          },
        },
        { provide: AccentThemeService, useValue: { apply: applyAccent } },
        { provide: TranslationService, useValue: { use: useLanguage } },
        { provide: SnackbarService, useValue: { success: success, error: error } },
      ],
    });
    return TestBed.inject<Store>(Store);
  };

  const settings = (store: Store): IGeneralSettings =>
    store.selectSignal(settingsFeature.selectSettings)();

  const isLoaded = (store: Store): boolean => store.selectSignal(settingsFeature.selectIsLoaded)();

  beforeEach(() => {
    TestBed.resetTestingModule();
    getGeneralSettings = vi.fn().mockReturnValue(of(storedSettings));
    updateGeneralSettings = vi.fn((changed: IGeneralSettings) => of(changed));
    applyAccent = vi.fn();
    useLanguage = vi.fn().mockResolvedValue(undefined);
    success = vi.fn();
    error = vi.fn();
  });

  describe('loading', () => {
    it('starts with the defaults and is not loaded', () => {
      const store: Store = configure('browser');

      expect(settings(store)).toEqual(DEFAULT_GENERAL_SETTINGS);
      expect(isLoaded(store)).toBe(false);
    });

    it('loads the settings of the current user when the layout opens', () => {
      const store: Store = configure('browser');

      store.dispatch(MainLayoutActions.opened());

      expect(settings(store)).toEqual(storedSettings);
      expect(isLoaded(store)).toBe(true);
    });

    it('applies the loaded accent color and switches the interface language', () => {
      const store: Store = configure('browser');

      store.dispatch(MainLayoutActions.opened());

      expect(applyAccent).toHaveBeenLastCalledWith('OCEAN');
      expect(useLanguage).toHaveBeenLastCalledWith('DE');
    });

    it('shares one request when the layout and the settings page open together', () => {
      getGeneralSettings.mockReturnValue(new Subject<IGeneralSettings>());
      const store: Store = configure('browser');

      store.dispatch(MainLayoutActions.opened());
      store.dispatch(GeneralSettingsPageActions.opened());

      expect(getGeneralSettings).toHaveBeenCalledOnce();
    });

    it('does not reload settings that are already loaded', () => {
      const store: Store = configure('browser');
      store.dispatch(MainLayoutActions.opened());

      store.dispatch(GeneralSettingsPageActions.opened());

      expect(getGeneralSettings).toHaveBeenCalledOnce();
    });

    it('keeps the defaults and tells the user when loading fails', () => {
      getGeneralSettings.mockReturnValue(throwError(() => ({ status: 500 })));
      const store: Store = configure('browser');

      store.dispatch(MainLayoutActions.opened());

      expect(settings(store)).toEqual(DEFAULT_GENERAL_SETTINGS);
      expect(isLoaded(store)).toBe(false);
      expect(error).toHaveBeenCalledWith(Constants.SETTINGS_LOAD_FAILED);
    });

    it('retries a failed load when the settings page opens', () => {
      getGeneralSettings
        .mockReturnValueOnce(throwError(() => ({ status: 500 })))
        .mockReturnValueOnce(of(storedSettings));
      const store: Store = configure('browser');
      store.dispatch(MainLayoutActions.opened());

      store.dispatch(GeneralSettingsPageActions.opened());

      expect(settings(store)).toEqual(storedSettings);
    });

    it('skips the request during server rendering', () => {
      const store: Store = configure('server');

      store.dispatch(MainLayoutActions.opened());

      expect(getGeneralSettings).not.toHaveBeenCalled();
    });

    it('ignores settings that arrive after the layout closed', () => {
      const settings$: Subject<IGeneralSettings> = new Subject<IGeneralSettings>();
      getGeneralSettings.mockReturnValue(settings$);
      const store: Store = configure('browser');
      store.dispatch(MainLayoutActions.opened());

      store.dispatch(MainLayoutActions.closed());
      settings$.next(storedSettings);

      expect(settings(store)).toEqual(DEFAULT_GENERAL_SETTINGS);
      expect(isLoaded(store)).toBe(false);
    });
  });

  describe('updating', () => {
    let store: Store;

    beforeEach(() => {
      store = configure('browser');
      store.dispatch(MainLayoutActions.opened());
    });

    it('applies a change immediately, before the backend answers', () => {
      updateGeneralSettings.mockReturnValue(new Subject<IGeneralSettings>());

      store.dispatch(
        GeneralSettingsPageActions.settingChanged({ changes: { accentColor: 'PLUM' } }),
      );

      expect(settings(store).accentColor).toBe('PLUM');
      expect(applyAccent).toHaveBeenLastCalledWith('PLUM');
    });

    it('sends the full settings with the change merged in', () => {
      store.dispatch(GeneralSettingsPageActions.settingChanged({ changes: { radioMode: true } }));

      expect(updateGeneralSettings).toHaveBeenCalledWith({ ...storedSettings, radioMode: true });
    });

    it('confirms a successful save', () => {
      store.dispatch(GeneralSettingsPageActions.settingChanged({ changes: { language: 'FR' } }));

      expect(useLanguage).toHaveBeenLastCalledWith('FR');
      expect(success).toHaveBeenCalledWith(Constants.SETTINGS_SAVED);
      expect(error).not.toHaveBeenCalled();
    });

    it('trusts the settings returned by the backend', () => {
      updateGeneralSettings.mockReturnValue(of({ ...storedSettings, audioQuality: 'LOW' }));

      store.dispatch(
        GeneralSettingsPageActions.settingChanged({ changes: { audioQuality: 'HIGH' } }),
      );

      expect(settings(store).audioQuality).toBe('LOW');
    });

    it('rolls back to the last saved settings when the save fails', () => {
      updateGeneralSettings.mockReturnValue(throwError(() => ({ status: 500 })));

      store.dispatch(
        GeneralSettingsPageActions.settingChanged({
          changes: { accentColor: 'ORCHID', notificationsEnabled: true },
        }),
      );

      expect(settings(store)).toEqual(storedSettings);
      expect(applyAccent).toHaveBeenLastCalledWith('OCEAN');
      expect(error).toHaveBeenCalledWith(Constants.SETTINGS_SAVE_FAILED);
      expect(success).not.toHaveBeenCalled();
    });

    it('rolls back to the latest successful save, not to the loaded state', () => {
      store.dispatch(GeneralSettingsPageActions.settingChanged({ changes: { language: 'IT' } }));
      updateGeneralSettings.mockReturnValue(throwError(() => ({ status: 500 })));

      store.dispatch(GeneralSettingsPageActions.settingChanged({ changes: { language: 'ES' } }));

      expect(settings(store).language).toBe('IT');
    });

    it('sends the next change only after the previous save has finished', () => {
      const firstResponse$: Subject<IGeneralSettings> = new Subject<IGeneralSettings>();
      updateGeneralSettings.mockReturnValueOnce(firstResponse$);
      store.dispatch(GeneralSettingsPageActions.settingChanged({ changes: { radioMode: true } }));
      store.dispatch(
        GeneralSettingsPageActions.settingChanged({ changes: { accentColor: 'PLUM' } }),
      );

      firstResponse$.next({ ...storedSettings, radioMode: true });
      firstResponse$.complete();

      expect(updateGeneralSettings).toHaveBeenCalledTimes(2);
      expect(updateGeneralSettings).toHaveBeenLastCalledWith({
        ...storedSettings,
        radioMode: true,
        accentColor: 'PLUM',
      });
      expect(settings(store)).toEqual({ ...storedSettings, radioMode: true, accentColor: 'PLUM' });
    });

    it('holds back a queued change while the previous save is still running', () => {
      updateGeneralSettings.mockReturnValueOnce(new Subject<IGeneralSettings>());

      store.dispatch(GeneralSettingsPageActions.settingChanged({ changes: { radioMode: true } }));
      store.dispatch(
        GeneralSettingsPageActions.settingChanged({ changes: { accentColor: 'PLUM' } }),
      );

      expect(updateGeneralSettings).toHaveBeenCalledOnce();
    });

    it('does not let an older response overwrite a newer change', () => {
      const firstResponse$: Subject<IGeneralSettings> = new Subject<IGeneralSettings>();
      updateGeneralSettings
        .mockReturnValueOnce(firstResponse$)
        .mockReturnValueOnce(new Subject<IGeneralSettings>());
      store.dispatch(
        GeneralSettingsPageActions.settingChanged({ changes: { accentColor: 'ORCHID' } }),
      );
      store.dispatch(
        GeneralSettingsPageActions.settingChanged({ changes: { accentColor: 'PLUM' } }),
      );

      firstResponse$.next({ ...storedSettings, accentColor: 'ORCHID' });
      firstResponse$.complete();

      expect(settings(store).accentColor).toBe('PLUM');
      expect(success).not.toHaveBeenCalled();
    });

    it('keeps a newer change on screen when an older save fails', () => {
      const firstResponse$: Subject<IGeneralSettings> = new Subject<IGeneralSettings>();
      updateGeneralSettings
        .mockReturnValueOnce(firstResponse$)
        .mockReturnValueOnce(new Subject<IGeneralSettings>());
      store.dispatch(GeneralSettingsPageActions.settingChanged({ changes: { language: 'FR' } }));
      store.dispatch(GeneralSettingsPageActions.settingChanged({ changes: { language: 'IT' } }));

      firstResponse$.error({ status: 500 });

      expect(settings(store).language).toBe('IT');
      expect(error).toHaveBeenCalledWith(Constants.SETTINGS_SAVE_FAILED);
    });

    it('continues with queued saves after a failed one', () => {
      updateGeneralSettings.mockReturnValueOnce(throwError(() => ({ status: 500 })));

      store.dispatch(GeneralSettingsPageActions.settingChanged({ changes: { language: 'FR' } }));
      store.dispatch(GeneralSettingsPageActions.settingChanged({ changes: { language: 'IT' } }));

      expect(updateGeneralSettings).toHaveBeenCalledTimes(2);
      expect(settings(store).language).toBe('IT');
    });
  });

  describe('closing the layout', () => {
    let store: Store;

    beforeEach(() => {
      store = configure('browser');
      store.dispatch(MainLayoutActions.opened());
    });

    it('restores the defaults but keeps language and accent, so the auth pages stay in them', () => {
      store.dispatch(MainLayoutActions.closed());

      expect(settings(store)).toEqual({
        ...DEFAULT_GENERAL_SETTINGS,
        language: 'DE',
        accentColor: 'OCEAN',
      });
      expect(isLoaded(store)).toBe(false);
    });

    it('drops a save that finishes after the layout closed', () => {
      const response$: Subject<IGeneralSettings> = new Subject<IGeneralSettings>();
      updateGeneralSettings.mockReturnValue(response$);
      store.dispatch(GeneralSettingsPageActions.settingChanged({ changes: { radioMode: true } }));

      store.dispatch(MainLayoutActions.closed());
      response$.next({ ...storedSettings, radioMode: true });

      expect(settings(store).radioMode).toBe(DEFAULT_GENERAL_SETTINGS.radioMode);
      expect(success).not.toHaveBeenCalled();
    });

    it('does not send queued saves of a closed layout', () => {
      updateGeneralSettings.mockReturnValueOnce(new Subject<IGeneralSettings>());
      store.dispatch(GeneralSettingsPageActions.settingChanged({ changes: { language: 'FR' } }));
      store.dispatch(GeneralSettingsPageActions.settingChanged({ changes: { language: 'IT' } }));

      store.dispatch(MainLayoutActions.closed());

      expect(updateGeneralSettings).toHaveBeenCalledOnce();
      expect(error).not.toHaveBeenCalled();
    });

    it('saves changes again once the layout reopens', () => {
      store.dispatch(MainLayoutActions.closed());
      store.dispatch(MainLayoutActions.opened());

      store.dispatch(GeneralSettingsPageActions.settingChanged({ changes: { radioMode: true } }));

      expect(updateGeneralSettings).toHaveBeenCalledOnce();
    });
  });
});
