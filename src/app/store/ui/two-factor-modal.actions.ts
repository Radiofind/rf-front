import { createActionGroup, props } from '@ngrx/store';

export const TwoFactorModalActions = createActionGroup({
  source: 'Two Factor Modal',
  events: {
    Verified: props<{ token: string }>(),
  },
});
