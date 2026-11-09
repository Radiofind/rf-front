import { createActionGroup, emptyProps, props } from '@ngrx/store';

import type { IUserProfileData } from '../../core/models/user.model';

export const EditProfilePageActions = createActionGroup({
  source: 'Edit Profile Page',
  events: {
    'Profile Saved': props<{ profile: IUserProfileData }>(),
    'Reauthentication Required': emptyProps(),
  },
});
