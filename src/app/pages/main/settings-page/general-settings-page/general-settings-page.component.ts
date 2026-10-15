import { Component, computed, inject } from '@angular/core';
import { SettingsRowComponent } from '../../../../features/components/settings/settings-row/settings-row.component';
import { AccentColorPickerComponent } from '../../../../features/components/settings/accent-color-picker/accent-color-picker.component';
import { SelectFieldComponent } from '../../../../shared/components/select-field/select-field.component';
import { ToggleSwitchComponent } from '../../../../shared/components/toggle-switch/toggle-switch.component';
import { SettingsStateService } from '../../../../features/services/settings-state-service/settings-state.service';
import { SnackbarService } from '../../../../shared/services/snackbar-service/snackbar.service';
import { Constants } from '../../../../core/constants/constants';
import {
  AUDIO_QUALITY_OPTIONS,
  LANGUAGE_OPTIONS,
  PROFILE_VISIBILITY_OPTIONS,
} from '../../../../features/constants/settings.constant';

import type { OnInit, Signal } from '@angular/core';
import type { IGeneralSettings } from '../../../../core/models/settings.model';
import type { AudioQuality } from '../../../../core/types/audio-quality.type';
import type { Language } from '../../../../core/types/language.type';
import type { ProfileVisibility } from '../../../../core/types/profile-visibility.type';
import type { ISelectOption } from '../../../../shared/models/select-option.model';

@Component({
  selector: 'app-general-settings-page',
  templateUrl: './general-settings-page.component.html',
  styleUrl: './general-settings-page.component.scss',
  imports: [
    SettingsRowComponent,
    SelectFieldComponent,
    ToggleSwitchComponent,
    AccentColorPickerComponent,
  ],
})
export class GeneralSettingsPageComponent implements OnInit {
  private readonly settingsStateService: SettingsStateService = inject(SettingsStateService);

  private readonly snackbarService: SnackbarService = inject(SnackbarService);

  protected readonly settings: Signal<IGeneralSettings> = this.settingsStateService.settings;

  // Controls stay locked until the real settings arrive, otherwise a save would overwrite them with defaults.
  protected readonly isDisabled: Signal<boolean> = computed<boolean>(
    () => !this.settingsStateService.isLoaded(),
  );

  protected readonly languageOptions: readonly ISelectOption<Language>[] = LANGUAGE_OPTIONS;

  protected readonly profileVisibilityOptions: readonly ISelectOption<ProfileVisibility>[] =
    PROFILE_VISIBILITY_OPTIONS;

  protected readonly audioQualityOptions: readonly ISelectOption<AudioQuality>[] =
    AUDIO_QUALITY_OPTIONS;

  public ngOnInit(): void {
    void this.loadSettings();
  }

  public onSettingChange<K extends keyof IGeneralSettings>(
    key: K,
    value: IGeneralSettings[K],
  ): void {
    if (this.settings()[key] === value) {
      return;
    }

    void this.settingsStateService.updateSettings({ [key]: value });
  }

  private async loadSettings(): Promise<void> {
    if (this.settingsStateService.isLoaded()) {
      return;
    }

    const isLoaded: boolean = await this.settingsStateService.loadSettings();

    if (!isLoaded) {
      this.snackbarService.error(Constants.SETTINGS_LOAD_FAILED);
    }
  }
}
