import { createFeature, createReducer, on } from '@ngrx/store';
import { Constants } from '../../core/constants/constants';
import { DEFAULT_GENERAL_SETTINGS } from '../../features/constants/settings.constant';
import { GeneralSettingsPageActions } from '../ui/general-settings-page.actions';
import { MainLayoutActions } from '../ui/main-layout.actions';
import { SettingsApiActions } from './settings.actions';

import type { IGeneralSettings } from '../../core/models/settings.model';

export interface ISettingsState {
  settings: IGeneralSettings;
  savedSettings: IGeneralSettings;
  isLoaded: boolean;
  revision: number;
}

export const initialSettingsState: ISettingsState = {
  settings: DEFAULT_GENERAL_SETTINGS,
  savedSettings: DEFAULT_GENERAL_SETTINGS,
  isLoaded: false,
  revision: Constants.ZERO,
};

export const settingsFeature = createFeature({
  name: 'settings',
  reducer: createReducer(
    initialSettingsState,
    on(
      SettingsApiActions.settingsLoaded,
      (state: ISettingsState, { settings }: { settings: IGeneralSettings }): ISettingsState => ({
        ...state,
        settings: settings,
        savedSettings: settings,
        isLoaded: true,
      }),
    ),
    on(
      GeneralSettingsPageActions.settingChanged,
      (
        state: ISettingsState,
        { changes }: { changes: Partial<IGeneralSettings> },
      ): ISettingsState => ({
        ...state,
        settings: { ...state.settings, ...changes },
        revision: state.revision + Constants.ONE,
      }),
    ),
    on(
      SettingsApiActions.settingsSaved,
      (
        state: ISettingsState,
        { settings, revision }: { settings: IGeneralSettings; revision: number },
      ): ISettingsState => ({
        ...state,
        settings: revision === state.revision ? settings : state.settings,
        savedSettings: settings,
      }),
    ),
    on(
      SettingsApiActions.settingsSaveFailed,
      (state: ISettingsState, { revision }: { revision: number }): ISettingsState => ({
        ...state,
        settings: revision === state.revision ? state.savedSettings : state.settings,
      }),
    ),
    on(MainLayoutActions.closed, (state: ISettingsState): ISettingsState => {
      const deviceSettings: IGeneralSettings = {
        ...DEFAULT_GENERAL_SETTINGS,
        language: state.settings.language,
        accentColor: state.settings.accentColor,
      };

      return {
        ...state,
        settings: deviceSettings,
        savedSettings: deviceSettings,
        isLoaded: false,
      };
    }),
  ),
});
