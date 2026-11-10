import { createActionGroup, emptyProps, props } from '@ngrx/store';

import type { OwnTracksSortEnum } from '../../core/enums/own-tracks-sort.enum';
import type { IPlayerTrack } from '../../core/models/player.model';
import type { TrackStatus } from '../../core/types/track-status.type';

export const MyUploadsPageActions = createActionGroup({
  source: 'My Uploads Page',
  events: {
    Opened: props<{ pageSize: number | null }>(),
    'Status Selected': props<{ status: TrackStatus | null }>(),
    'Search Changed': props<{ search: string }>(),
    'Filters Reset': emptyProps(),
    'Sort Selected': props<{ sort: OwnTracksSortEnum }>(),
    'Page Selected': props<{ page: number }>(),
    'Page Size Selected': props<{ size: number }>(),
    'Retry Clicked': emptyProps(),
    'Track Played': props<{ queue: readonly IPlayerTrack[]; startIndex: number }>(),
    'Playback Toggled': emptyProps(),
  },
});
