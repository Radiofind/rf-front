import { createActionGroup, emptyProps, props } from '@ngrx/store';

import type { IGeneralSettings } from '../../core/models/settings.model';

export const SettingsApiActions = createActionGroup({
  source: 'Settings API',
  events: {
    'Settings Loaded': props<{ settings: IGeneralSettings }>(),
    'Settings Load Failed': emptyProps(),
    'Settings Saved': props<{ settings: IGeneralSettings; revision: number }>(),
    'Settings Save Failed': props<{ revision: number }>(),
  },
});
