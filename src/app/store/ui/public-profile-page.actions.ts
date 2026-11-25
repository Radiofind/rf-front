import { createActionGroup, emptyProps, props } from '@ngrx/store';

import type { IPlayerTrack } from '../../core/models/player.model';

export const PublicProfilePageActions = createActionGroup({
  source: 'Public Profile Page',
  events: {
    Opened: props<{ publicId: string }>(),
    Left: emptyProps(),
    'Retry Clicked': emptyProps(),
    'Follow Clicked': emptyProps(),
    'Unfollow Clicked': emptyProps(),
    'More Tracks Clicked': emptyProps(),
    'Track Played': props<{ queue: readonly IPlayerTrack[]; startIndex: number }>(),
    'Playback Toggled': emptyProps(),
  },
});
