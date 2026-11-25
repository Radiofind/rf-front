import { createActionGroup, emptyProps, props } from '@ngrx/store';

import type { IPage } from '../../core/models/page.model';
import type { IPublicProfile } from '../../core/models/public-profile.model';
import type { ITrack } from '../../core/models/track.model';

export const PublicProfileApiActions = createActionGroup({
  source: 'Public Profile API',
  events: {
    'Profile Loaded': props<{ profile: IPublicProfile }>(),
    'Profile Not Found': emptyProps(),
    'Profile Load Failed': emptyProps(),
    'Avatar Loaded': props<{ url: string | null }>(),
    'Tracks Loaded': props<{ page: IPage<ITrack> }>(),
    'Tracks Load Failed': emptyProps(),
    'Follow Saved': emptyProps(),
    'Follow Failed': emptyProps(),
  },
});
