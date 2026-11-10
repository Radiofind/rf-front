import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { concatLatestFrom } from '@ngrx/operators';
import { catchError, debounceTime, filter, map, merge, of, switchMap } from 'rxjs';
import { TrackService } from '../../features/services/track-service/track.service';
import { MY_UPLOADS_SEARCH_DEBOUNCE_MS } from '../../features/constants/my-uploads.constant';
import { MyUploadsPageActions } from '../ui/my-uploads-page.actions';
import { untilLayoutClosed } from '../shared/session.operators';
import { MyUploadsApiActions } from './my-uploads.actions';
import { myUploadsFeature } from './my-uploads.feature';

import type { Action } from '@ngrx/store';
import type { IPage } from '../../core/models/page.model';
import type { IOwnTracksQuery, ITrack } from '../../core/models/track.model';

export const loadMyUploads = createEffect(
  (
    actions$: Actions = inject(Actions),
    store: Store = inject(Store),
    trackService: TrackService = inject(TrackService),
    platformId: object = inject(PLATFORM_ID),
  ) => {
    const immediate$ = actions$.pipe(
      ofType(
        MyUploadsPageActions.opened,
        MyUploadsPageActions.statusSelected,
        MyUploadsPageActions.filtersReset,
        MyUploadsPageActions.pageSelected,
        MyUploadsPageActions.retryClicked,
      ),
    );
    const typed$ = actions$.pipe(
      ofType(MyUploadsPageActions.searchChanged),
      debounceTime(MY_UPLOADS_SEARCH_DEBOUNCE_MS),
    );

    return merge(immediate$, typed$).pipe(
      filter(() => isPlatformBrowser(platformId)),
      concatLatestFrom(() => store.select(myUploadsFeature.selectQuery)),
      switchMap(([, query]: [Action, IOwnTracksQuery]) =>
        trackService.getOwnTracks(query).pipe(
          map((page: IPage<ITrack>) => MyUploadsApiActions.uploadsLoaded({ page: page })),
          catchError(() => of(MyUploadsApiActions.uploadsLoadFailed())),
          untilLayoutClosed(actions$),
        ),
      ),
    );
  },
  { functional: true },
);
