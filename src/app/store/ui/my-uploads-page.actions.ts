import { createActionGroup, emptyProps, props } from '@ngrx/store';

import type { IPlayerTrack } from '../../core/models/player.model';
import type { TrackStatus } from '../../core/types/track-status.type';

export const MyUploadsPageActions = createActionGroup({
  source: 'My Uploads Page',
  events: {
    Opened: emptyProps(),
    'Status Selected': props<{ status: TrackStatus | null }>(),
    'Search Changed': props<{ search: string }>(),
    'Filters Reset': emptyProps(),
    'Page Selected': props<{ page: number }>(),
    'Retry Clicked': emptyProps(),
    'Track Played': props<{ queue: readonly IPlayerTrack[]; startIndex: number }>(),
    'Playback Toggled': emptyProps(),
  },
});
