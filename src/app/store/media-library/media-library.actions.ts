import { createActionGroup, emptyProps, props } from '@ngrx/store';

import type { IPage } from '../../core/models/page.model';
import type { ITrack } from '../../core/models/track.model';

export const MediaLibraryApiActions = createActionGroup({
  source: 'Media Library API',
  events: {
    'Library Loaded': props<{ page: IPage<ITrack> }>(),
    'Library Load Failed': emptyProps(),
    'Track Removed': props<{ trackId: number }>(),
    'Track Remove Failed': emptyProps(),
  },
});
