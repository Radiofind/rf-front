import { createActionGroup, props } from '@ngrx/store';

export const AuthFormActions = createActionGroup({
  source: 'Auth Form',
  events: {
    Registered: props<{ token: string }>(),
  },
});
