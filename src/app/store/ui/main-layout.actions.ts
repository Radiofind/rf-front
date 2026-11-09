import { createActionGroup, emptyProps } from '@ngrx/store';

export const MainLayoutActions = createActionGroup({
  source: 'Main Layout',
  events: {
    Opened: emptyProps(),
    Closed: emptyProps(),
    'Notifications Opened': emptyProps(),
  },
});
