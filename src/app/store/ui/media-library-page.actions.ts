import { createActionGroup, emptyProps, props } from '@ngrx/store';

import type { LibrarySortEnum } from '../../core/enums/library-sort.enum';
import type { IPlayerTrack } from '../../core/models/player.model';

export const MediaLibraryPageActions = createActionGroup({
  source: 'Media Library Page',
  events: {
    Opened: props<{ pageSize: number | null }>(),
    'Search Changed': props<{ search: string }>(),
    'Search Reset': emptyProps(),
    'Sort Selected': props<{ sort: LibrarySortEnum }>(),
    'Page Selected': props<{ page: number }>(),
    'Page Size Selected': props<{ size: number }>(),
    'Retry Clicked': emptyProps(),
    'Track Played': props<{ queue: readonly IPlayerTrack[]; startIndex: number }>(),
    'Playback Toggled': emptyProps(),
    'Remove Confirmed': props<{ trackId: number }>(),
    'Track Reported': emptyProps(),
  },
});
