import { createActionGroup, emptyProps, props } from '@ngrx/store';

import type { IPage } from '../../core/models/page.model';
import type { ITrack } from '../../core/models/track.model';

export const MyUploadsApiActions = createActionGroup({
  source: 'My Uploads API',
  events: {
    'Uploads Loaded': props<{ page: IPage<ITrack> }>(),
    'Uploads Load Failed': emptyProps(),
  },
});
