import { createActionGroup, emptyProps, props } from '@ngrx/store';

import type { INotificationSettings, ISecurityOverview } from '../../core/models/settings.model';

export const AccountSettingsApiActions = createActionGroup({
  source: 'Account Settings API',
  events: {
    'Account Settings Loaded': props<{
      notifications: INotificationSettings;
      security: ISecurityOverview;
    }>(),
    'Account Settings Load Failed': emptyProps(),
    'Notification Settings Saved': props<{
      notifications: INotificationSettings;
      revision: number;
    }>(),
    'Notification Settings Save Failed': props<{ revision: number }>(),
  },
});
