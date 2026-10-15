import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { of, Subject, throwError } from 'rxjs';
import { SettingsStateService } from './settings-state.service';
import { UserService } from '../user-service/user.service';
import { SnackbarService } from '../../../shared/services/snackbar-service/snackbar.service';
import { Constants } from '../../../core/constants/constants';
import { DEFAULT_GENERAL_SETTINGS } from '../../constants/settings.constant';

import type { IGeneralSettings } from '../../../core/models/settings.model';

describe('SettingsStateService', () => {
  const storedSettings: IGeneralSettings = {
    language: 'DE',
    radioMode: false,
    profileVisibility: 'FOLLOWERS',
    notificationsEnabled: false,
    audioQuality: 'NORMAL',
    accentColor: 'OCEAN',
  };

  let service: SettingsStateService;
  let getGeneralSettings: ReturnType<typeof vi.fn>;
  let updateGeneralSettings: ReturnType<typeof vi.fn>;
  let success: ReturnType<typeof vi.fn>;
  let error: ReturnType<typeof vi.fn>;

  const root = (): HTMLElement => document.documentElement;

  const cssVariable = (name: string): string => root().style.getPropertyValue(name);

  const createService = (platform: string = 'browser'): void => {
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: platform },
        {
          provide: UserService,
          useValue: {
            getGeneralSettings: getGeneralSettings,
            updateGeneralSettings: updateGeneralSettings,
          },
        },
        { provide: SnackbarService, useValue: { success: success, error: error } },
      ],
    });
    service = TestBed.inject(SettingsStateService);
  };

  // Echoes whatever the client sent, the way the real backend does.
  const echoUpdate = (): ReturnType<typeof vi.fn> =>
    vi.fn((settings: IGeneralSettings) => of(settings));

  beforeEach(() => {
    TestBed.resetTestingModule();
    getGeneralSettings = vi.fn().mockReturnValue(of(storedSettings));
    updateGeneralSettings = echoUpdate();
    success = vi.fn();
    error = vi.fn();
  });

  afterEach(() => {
    root().removeAttribute('style');
    root().removeAttribute('lang');
  });

  describe('loading', () => {
    it('starts with the defaults and is not loaded', () => {
      createService();

      expect(service.settings()).toEqual(DEFAULT_GENERAL_SETTINGS);
      expect(service.isLoaded()).toBe(false);
    });

    it('loads the settings of the current user', async () => {
      createService();

      await expect(service.loadSettings()).resolves.toBe(true);

      expect(service.settings()).toEqual(storedSettings);
      expect(service.isLoaded()).toBe(true);
    });

    it('applies the loaded accent color and language to the document', async () => {
      createService();

      await service.loadSettings();

      expect(cssVariable(Constants.FIRST_GRADIENT_COLOR_PROPERTY)).toBe('#0ea5e9');
      expect(cssVariable(Constants.SECOND_GRADIENT_COLOR_PROPERTY)).toBe('#22d3ee');
      expect(cssVariable(Constants.MAIN_COLOR_PROPERTY)).toBe('#0284c7');
      expect(root().lang).toBe('de');
    });

    it('shares a single request between concurrent callers', async () => {
      const settings$: Subject<IGeneralSettings> = new Subject<IGeneralSettings>();
      getGeneralSettings.mockReturnValue(settings$);
      createService();

      const first: Promise<boolean> = service.loadSettings();
      const second: Promise<boolean> = service.loadSettings();

      settings$.next(storedSettings);
      settings$.complete();

      await expect(Promise.all([first, second])).resolves.toEqual([true, true]);
      expect(getGeneralSettings).toHaveBeenCalledTimes(1);
    });

    it('requests the settings again once the previous request has finished', async () => {
      createService();

      await service.loadSettings();
      await service.loadSettings();

      expect(getGeneralSettings).toHaveBeenCalledTimes(2);
    });

    it('keeps the defaults and reports a failed load', async () => {
      getGeneralSettings.mockReturnValue(throwError(() => ({ status: 500 })));
      createService();

      await expect(service.loadSettings()).resolves.toBe(false);

      expect(service.settings()).toEqual(DEFAULT_GENERAL_SETTINGS);
      expect(service.isLoaded()).toBe(false);
    });

    it('can retry after a failed load', async () => {
      getGeneralSettings
        .mockReturnValueOnce(throwError(() => ({ status: 500 })))
        .mockReturnValueOnce(of(storedSettings));
      createService();

      await service.loadSettings();
      await expect(service.loadSettings()).resolves.toBe(true);

      expect(service.settings()).toEqual(storedSettings);
    });

    it('skips the request during server-side rendering', async () => {
      createService('server');

      await expect(service.loadSettings()).resolves.toBe(false);

      expect(getGeneralSettings).not.toHaveBeenCalled();
    });

    it('ignores a response that arrives after the settings were cleared', async () => {
      const settings$: Subject<IGeneralSettings> = new Subject<IGeneralSettings>();
      getGeneralSettings.mockReturnValue(settings$);
      createService();

      const loading: Promise<boolean> = service.loadSettings();
      service.clear();
      settings$.next(storedSettings);
      settings$.complete();
      await loading;

      expect(service.settings()).toEqual(DEFAULT_GENERAL_SETTINGS);
      expect(service.isLoaded()).toBe(false);
    });
  });

  describe('updating', () => {
    beforeEach(async () => {
      createService();
      await service.loadSettings();
    });

    it('applies a change immediately, before the backend answers', () => {
      updateGeneralSettings.mockReturnValue(new Subject<IGeneralSettings>());

      void service.updateSettings({ accentColor: 'PLUM' });

      expect(service.settings().accentColor).toBe('PLUM');
      expect(cssVariable(Constants.FIRST_GRADIENT_COLOR_PROPERTY)).toBe('#7e22ce');
    });

    it('sends the full settings object with the change merged in', async () => {
      await service.updateSettings({ radioMode: true });

      expect(updateGeneralSettings).toHaveBeenCalledWith({ ...storedSettings, radioMode: true });
    });

    it('confirms a successful save', async () => {
      await service.updateSettings({ language: 'FR' });

      expect(service.settings().language).toBe('FR');
      expect(root().lang).toBe('fr');
      expect(success).toHaveBeenCalledWith(Constants.SETTINGS_SAVED);
      expect(error).not.toHaveBeenCalled();
    });

    it('trusts the settings returned by the backend', async () => {
      updateGeneralSettings.mockReturnValue(of({ ...storedSettings, audioQuality: 'LOW' }));

      await service.updateSettings({ audioQuality: 'HIGH' });

      expect(service.settings().audioQuality).toBe('LOW');
    });

    it('rolls back to the last saved settings when the save fails', async () => {
      updateGeneralSettings.mockReturnValue(throwError(() => ({ status: 500 })));

      await service.updateSettings({ accentColor: 'ORCHID', notificationsEnabled: true });

      expect(service.settings()).toEqual(storedSettings);
      expect(cssVariable(Constants.FIRST_GRADIENT_COLOR_PROPERTY)).toBe('#0ea5e9');
      expect(error).toHaveBeenCalledWith(Constants.SETTINGS_SAVE_FAILED);
      expect(success).not.toHaveBeenCalled();
    });

    it('rolls back to the latest successful save, not to the initial state', async () => {
      await service.updateSettings({ language: 'IT' });

      updateGeneralSettings.mockReturnValue(throwError(() => ({ status: 500 })));
      await service.updateSettings({ language: 'ES' });

      expect(service.settings().language).toBe('IT');
    });

    it('sends rapid changes one after another and keeps all of them', async () => {
      const responses: Subject<IGeneralSettings>[] = [];
      updateGeneralSettings.mockImplementation(() => {
        const response$: Subject<IGeneralSettings> = new Subject<IGeneralSettings>();
        responses.push(response$);
        return response$;
      });

      const first: Promise<void> = service.updateSettings({ radioMode: true });
      const second: Promise<void> = service.updateSettings({ accentColor: 'PLUM' });

      await vi.waitFor(() => {
        expect(responses).toHaveLength(1);
      });

      const firstSent: IGeneralSettings = updateGeneralSettings.mock.calls[0]![0];
      responses[0]!.next(firstSent);
      responses[0]!.complete();
      await first;

      await vi.waitFor(() => {
        expect(responses).toHaveLength(2);
      });

      const secondSent: IGeneralSettings = updateGeneralSettings.mock.calls[1]![0];

      expect(secondSent).toEqual({ ...storedSettings, radioMode: true, accentColor: 'PLUM' });

      responses[1]!.next(secondSent);
      responses[1]!.complete();
      await second;

      expect(service.settings()).toEqual(secondSent);
    });

    it('does not let an older response overwrite a newer change', async () => {
      const responses: Subject<IGeneralSettings>[] = [];
      updateGeneralSettings.mockImplementation(() => {
        const response$: Subject<IGeneralSettings> = new Subject<IGeneralSettings>();
        responses.push(response$);
        return response$;
      });

      const first: Promise<void> = service.updateSettings({ accentColor: 'ORCHID' });
      void service.updateSettings({ accentColor: 'PLUM' });

      await vi.waitFor(() => {
        expect(responses).toHaveLength(1);
      });

      responses[0]!.next({ ...storedSettings, accentColor: 'ORCHID' });
      responses[0]!.complete();
      await first;

      expect(service.settings().accentColor).toBe('PLUM');
      expect(success).not.toHaveBeenCalled();
    });

    it('keeps a newer change on screen when an older save fails', async () => {
      const responses: Subject<IGeneralSettings>[] = [];
      updateGeneralSettings.mockImplementation(() => {
        const response$: Subject<IGeneralSettings> = new Subject<IGeneralSettings>();
        responses.push(response$);
        return response$;
      });

      const first: Promise<void> = service.updateSettings({ language: 'FR' });
      void service.updateSettings({ language: 'IT' });

      await vi.waitFor(() => {
        expect(responses).toHaveLength(1);
      });

      responses[0]!.error({ status: 500 });
      await first;

      expect(service.settings().language).toBe('IT');
      expect(error).toHaveBeenCalledWith(Constants.SETTINGS_SAVE_FAILED);
    });

    it('continues with queued saves after a failed one', async () => {
      updateGeneralSettings
        .mockReturnValueOnce(throwError(() => ({ status: 500 })))
        .mockImplementation((settings: IGeneralSettings) => of(settings));

      void service.updateSettings({ language: 'FR' });
      await service.updateSettings({ language: 'IT' });

      expect(updateGeneralSettings).toHaveBeenCalledTimes(2);
      expect(service.settings().language).toBe('IT');
    });
  });

  describe('clearing', () => {
    it('restores the defaults on the document and requires a new load', async () => {
      createService();
      await service.loadSettings();

      service.clear();

      expect(service.settings()).toEqual(DEFAULT_GENERAL_SETTINGS);
      expect(service.isLoaded()).toBe(false);
      expect(cssVariable(Constants.FIRST_GRADIENT_COLOR_PROPERTY)).toBe('#6a5cff');
      expect(cssVariable(Constants.SECOND_GRADIENT_COLOR_PROPERTY)).toBe('#a855f7');
      expect(cssVariable(Constants.MAIN_COLOR_PROPERTY)).toBe('#712be2');
      expect(root().lang).toBe('en');
    });

    it('drops a save that finishes after the settings were cleared', async () => {
      createService();
      await service.loadSettings();

      const response$: Subject<IGeneralSettings> = new Subject<IGeneralSettings>();
      updateGeneralSettings.mockReturnValue(response$);

      const saving: Promise<void> = service.updateSettings({ accentColor: 'PLUM' });

      await vi.waitFor(() => {
        expect(updateGeneralSettings).toHaveBeenCalledTimes(1);
      });

      service.clear();
      response$.next({ ...storedSettings, accentColor: 'PLUM' });
      response$.complete();
      await saving;

      expect(service.settings()).toEqual(DEFAULT_GENERAL_SETTINGS);
      expect(success).not.toHaveBeenCalled();
    });

    it('does not send queued saves of a cleared session', async () => {
      createService();
      await service.loadSettings();

      const response$: Subject<IGeneralSettings> = new Subject<IGeneralSettings>();
      updateGeneralSettings.mockReturnValueOnce(response$);

      const first: Promise<void> = service.updateSettings({ language: 'FR' });
      const second: Promise<void> = service.updateSettings({ language: 'IT' });

      await vi.waitFor(() => {
        expect(updateGeneralSettings).toHaveBeenCalledTimes(1);
      });

      service.clear();
      response$.error({ status: 500 });
      await Promise.all([first, second]);

      expect(updateGeneralSettings).toHaveBeenCalledTimes(1);
      expect(error).not.toHaveBeenCalled();
      expect(service.settings()).toEqual(DEFAULT_GENERAL_SETTINGS);
    });
  });
});
