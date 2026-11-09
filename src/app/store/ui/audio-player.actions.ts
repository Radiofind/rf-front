import { createActionGroup, emptyProps } from '@ngrx/store';

export const AudioPlayerActions = createActionGroup({
  source: 'Audio Player',
  events: {
    'Play Toggled': emptyProps(),
    'Previous Clicked': emptyProps(),
    'Next Clicked': emptyProps(),
    'Shuffle Toggled': emptyProps(),
    'Repeat Toggled': emptyProps(),
    'Like Toggled': emptyProps(),
  },
});
