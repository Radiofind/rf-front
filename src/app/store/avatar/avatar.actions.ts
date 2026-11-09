import { createActionGroup, props } from '@ngrx/store';

export const AvatarActions = createActionGroup({
  source: 'Avatar',
  events: {
    'Url Changed': props<{ url: string | null }>(),
  },
});
