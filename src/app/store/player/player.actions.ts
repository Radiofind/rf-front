import { createActionGroup, emptyProps, props } from '@ngrx/store';

import type { IPlayerTrack } from '../../core/models/player.model';

export const PlayerActions = createActionGroup({
  source: 'Player',
  events: {
    'Queue Started': props<{ queue: readonly IPlayerTrack[]; startIndex: number }>(),
    'Order Shuffled': props<{ order: readonly number[] }>(),
    'Track Ended': emptyProps(),
    'Playback Failed': emptyProps(),
    'Listen Qualified': props<{ trackId: number }>(),
  },
});

export const PlayerApiActions = createActionGroup({
  source: 'Player API',
  events: {
    'Like Saved': props<{ trackId: number; liked: boolean }>(),
    'Like Failed': props<{ trackId: number; liked: boolean }>(),
  },
});
