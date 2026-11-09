import { createActionGroup, emptyProps } from '@ngrx/store';

export const UploadTrackPageActions = createActionGroup({
  source: 'Upload Track Page',
  events: {
    Opened: emptyProps(),
    'Track Uploaded': emptyProps(),
  },
});
