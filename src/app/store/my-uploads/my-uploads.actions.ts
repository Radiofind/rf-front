import { createActionGroup, emptyProps, props } from '@ngrx/store';

import type { IPage } from '../../core/models/page.model';
import type { ITrack } from '../../core/models/track.model';
import type { TranslationKey } from '../../core/types/translation.type';

export const MyUploadsApiActions = createActionGroup({
  source: 'My Uploads API',
  events: {
    'Uploads Loaded': props<{ page: IPage<ITrack> }>(),
    'Uploads Load Failed': emptyProps(),
    'Track Changed': props<{ message: TranslationKey }>(),
    'Track Deleted': props<{ trackId: number }>(),
    'Track Action Failed': props<{ message: TranslationKey }>(),
  },
});
