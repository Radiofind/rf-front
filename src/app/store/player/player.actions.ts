import { createActionGroup, emptyProps, props } from '@ngrx/store';

import type { IPlayerTrack } from '../../core/models/player.model';

export const PlayerActions = createActionGroup({
  source: 'Player',
  events: {
    'Queue Started': props<{ queue: readonly IPlayerTrack[]; startIndex: number }>(),
    'Order Shuffled': props<{ order: readonly number[] }>(),
    'Track Ended': emptyProps(),
    'Playback Failed': emptyProps(),
  },
});
