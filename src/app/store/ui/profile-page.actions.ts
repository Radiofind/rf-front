import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const ProfilePageActions = createActionGroup({
  source: 'Profile Page',
  events: {
    Opened: emptyProps(),
    'Avatar Changed': props<{ avatar: Blob | null }>(),
  },
});
