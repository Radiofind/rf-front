import { createActionGroup, emptyProps, props } from '@ngrx/store';

import type { IUserProfileData } from '../../core/models/user.model';
import type { IActivity } from '../../core/models/activity.model';

export const ProfileApiActions = createActionGroup({
  source: 'Profile API',
  events: {
    'Profile Loaded': props<{ profile: IUserProfileData }>(),
    'Profile Load Failed': emptyProps(),
    'Activities Loaded': props<{ activities: readonly IActivity[] }>(),
    'Activities Load Failed': emptyProps(),
  },
});
