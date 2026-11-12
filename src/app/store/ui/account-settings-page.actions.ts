import { createActionGroup, emptyProps, props } from '@ngrx/store';

import type { INotificationSettings, ISecurityOverview } from '../../core/models/settings.model';

export const AccountSettingsPageActions = createActionGroup({
  source: 'Account Settings Page',
  events: {
    Opened: emptyProps(),
    'Notification Setting Changed': props<{ changes: Partial<INotificationSettings> }>(),
    'Security Changed': props<{ security: ISecurityOverview }>(),
    'Account Deleted': emptyProps(),
  },
});
