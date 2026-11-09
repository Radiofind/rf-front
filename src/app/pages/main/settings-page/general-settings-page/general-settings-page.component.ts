import { Component, computed, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { SettingsRowComponent } from '../../../../features/components/settings/settings-row/settings-row.component';
import { AccentColorPickerComponent } from '../../../../features/components/settings/accent-color-picker/accent-color-picker.component';
import { SelectFieldComponent } from '../../../../shared/components/select-field/select-field.component';
import { ToggleSwitchComponent } from '../../../../shared/components/toggle-switch/toggle-switch.component';
import { TranslationService } from '../../../../shared/services/translation-service/translation.service';
import { TranslatePipe } from '../../../../shared/pipes/translate/translate.pipe';
import {
  AUDIO_QUALITY_OPTIONS,
  LANGUAGE_OPTIONS,
  PROFILE_VISIBILITY_OPTIONS,
} from '../../../../features/constants/settings.constant';
import { GeneralSettingsPageActions } from '../../../../store/ui/general-settings-page.actions';
import { settingsFeature } from '../../../../store/settings/settings.feature';

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
    TranslatePipe,
  ],
})
export class GeneralSettingsPageComponent implements OnInit {
  private readonly store: Store = inject(Store);

  private readonly translationService: TranslationService = inject(TranslationService);

  protected readonly settings: Signal<IGeneralSettings> = this.store.selectSignal(
    settingsFeature.selectSettings,
  );

  private readonly isLoaded: Signal<boolean> = this.store.selectSignal(
    settingsFeature.selectIsLoaded,
  );

  protected readonly isDisabled: Signal<boolean> = computed<boolean>(() => !this.isLoaded());

  protected readonly languageOptions: readonly ISelectOption<Language>[] = LANGUAGE_OPTIONS;

  protected readonly profileVisibilityOptions: Signal<readonly ISelectOption<ProfileVisibility>[]> =
    computed(() => this.translationService.translateOptions(PROFILE_VISIBILITY_OPTIONS));

  protected readonly audioQualityOptions: Signal<readonly ISelectOption<AudioQuality>[]> = computed(
    () => this.translationService.translateOptions(AUDIO_QUALITY_OPTIONS),
  );

  public ngOnInit(): void {
    this.store.dispatch(GeneralSettingsPageActions.opened());
  }

  public onSettingChange<K extends keyof IGeneralSettings>(
    key: K,
    value: IGeneralSettings[K],
  ): void {
    if (this.settings()[key] === value) {
      return;
    }

    this.store.dispatch(GeneralSettingsPageActions.settingChanged({ changes: { [key]: value } }));
  }
}
