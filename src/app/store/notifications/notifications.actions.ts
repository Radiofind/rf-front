import { createActionGroup, emptyProps, props } from '@ngrx/store';

import type { INotificationFeed } from '../../core/models/notification.model';

export const NotificationsApiActions = createActionGroup({
  source: 'Notifications API',
  events: {
    'Notifications Loaded': props<{ feed: INotificationFeed }>(),
    'Notifications Load Failed': emptyProps(),
    'Mark All As Read Sent': emptyProps(),
    'All Marked As Read': emptyProps(),
    'Mark All As Read Failed': emptyProps(),
  },
});
