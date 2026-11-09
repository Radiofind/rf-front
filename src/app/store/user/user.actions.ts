import { createActionGroup, emptyProps, props } from '@ngrx/store';

import type { ICurrentUser } from '../../core/models/user.model';

export const UserApiActions = createActionGroup({
  source: 'User API',
  events: {
    'Current User Loaded': props<{ user: ICurrentUser }>(),
    'Current User Load Failed': emptyProps(),
  },
});
