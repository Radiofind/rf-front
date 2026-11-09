import { createActionGroup, emptyProps, props } from '@ngrx/store';

import type { IGeneralSettings } from '../../core/models/settings.model';

export const GeneralSettingsPageActions = createActionGroup({
  source: 'General Settings Page',
  events: {
    Opened: emptyProps(),
    'Setting Changed': props<{ changes: Partial<IGeneralSettings> }>(),
  },
});
