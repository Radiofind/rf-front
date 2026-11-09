import { createActionGroup, emptyProps } from '@ngrx/store';

export const HeaderActions = createActionGroup({
  source: 'Header',
  events: {
    'Log Out Clicked': emptyProps(),
  },
});
