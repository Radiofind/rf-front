import { inject, PLATFORM_ID, Service, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { UserService } from '../user-service/user.service';
import { AccentThemeService } from '../accent-theme-service/accent-theme.service';
import { SnackbarService } from '../../../shared/services/snackbar-service/snackbar.service';
import { TranslationService } from '../../../shared/services/translation-service/translation.service';
import { Constants } from '../../../core/constants/constants';
import { DEFAULT_GENERAL_SETTINGS } from '../../constants/settings.constant';

import type { Signal, WritableSignal } from '@angular/core';
import type { IGeneralSettings } from '../../../core/models/settings.model';

@Service()
export class SettingsStateService {
  private readonly userService: UserService = inject(UserService);

  private readonly snackbarService: SnackbarService = inject(SnackbarService);

  private readonly translationService: TranslationService = inject(TranslationService);

  private readonly accentThemeService: AccentThemeService = inject(AccentThemeService);

  private readonly isBrowser: boolean = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly settingsState: WritableSignal<IGeneralSettings> = signal<IGeneralSettings>({
    ...DEFAULT_GENERAL_SETTINGS,
  });

  private readonly isLoadedState: WritableSignal<boolean> = signal<boolean>(false);

  private savedSettings: IGeneralSettings = { ...DEFAULT_GENERAL_SETTINGS };

  private loadRequest: Promise<boolean> | null = null;

  private saveQueue: Promise<void> = Promise.resolve();

  private changeId: number = Constants.ZERO;

  private sessionId: number = Constants.ZERO;

  public readonly settings: Signal<IGeneralSettings> = this.settingsState.asReadonly();

  public readonly isLoaded: Signal<boolean> = this.isLoadedState.asReadonly();

  public loadSettings(): Promise<boolean> {
    if (!this.isBrowser) {
      return Promise.resolve(false);
    }

    this.loadRequest ??= this.fetchSettings().finally(() => {
      this.loadRequest = null;
    });

    return this.loadRequest;
  }

  public updateSettings(changes: Partial<IGeneralSettings>): Promise<void> {
    const settings: IGeneralSettings = { ...this.settingsState(), ...changes };

    this.changeId += Constants.ONE;
    const changeId: number = this.changeId;
    const sessionId: number = this.sessionId;

    this.applySettings(settings);

    this.saveQueue = this.saveQueue.then(() => this.saveSettings(settings, changeId, sessionId));

    return this.saveQueue;
  }

  public clear(): void {
    this.sessionId += Constants.ONE;
    this.savedSettings = {
      ...DEFAULT_GENERAL_SETTINGS,
      language: this.translationService.language(),
    };
    this.isLoadedState.set(false);
    this.applySettings(this.savedSettings);
  }

  private async fetchSettings(): Promise<boolean> {
    const sessionId: number = this.sessionId;

    try {
      const settings: IGeneralSettings = await firstValueFrom(
        this.userService.getGeneralSettings(),
      );

      if (sessionId === this.sessionId) {
        this.savedSettings = settings;
        this.applySettings(settings);
        this.isLoadedState.set(true);
      }

      return true;
    } catch {
      return false;
    }
  }

  private async saveSettings(
    settings: IGeneralSettings,
    changeId: number,
    sessionId: number,
  ): Promise<void> {
    if (sessionId !== this.sessionId) {
      return;
    }

    try {
      const savedSettings: IGeneralSettings = await firstValueFrom(
        this.userService.updateGeneralSettings(settings),
      );

      if (sessionId !== this.sessionId) {
        return;
      }

      this.savedSettings = savedSettings;

      if (changeId === this.changeId) {
        this.applySettings(savedSettings);
        this.snackbarService.success(Constants.SETTINGS_SAVED);
      }
    } catch {
      if (sessionId !== this.sessionId) {
        return;
      }

      if (changeId === this.changeId) {
        this.applySettings(this.savedSettings);
      }

      this.snackbarService.error(Constants.SETTINGS_SAVE_FAILED);
    }
  }

  private applySettings(settings: IGeneralSettings): void {
    this.settingsState.set(settings);

    this.accentThemeService.apply(settings.accentColor);
    void this.translationService.use(settings.language);
  }
}
