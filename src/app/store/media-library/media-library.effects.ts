import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { concatLatestFrom } from '@ngrx/operators';
import { catchError, concatMap, debounceTime, filter, map, merge, of, switchMap, tap } from 'rxjs';
import { TrackService } from '../../features/services/track-service/track.service';
import { UploadsPreferencesService } from '../../features/services/uploads-preferences-service/uploads-preferences.service';
import { MY_UPLOADS_SEARCH_DEBOUNCE_MS } from '../../features/constants/my-uploads.constant';
import { MEDIA_LIBRARY_MESSAGES } from '../../features/constants/media-library.constant';
import { SnackbarService } from '../../shared/services/snackbar-service/snackbar.service';
import { PlayerApiActions } from '../player/player.actions';
import { untilLayoutClosed } from '../shared/session.operators';
import { MediaLibraryPageActions } from '../ui/media-library-page.actions';
import { MediaLibraryApiActions } from './media-library.actions';
import { mediaLibraryFeature } from './media-library.feature';

import type { Action } from '@ngrx/store';
import type { IPage } from '../../core/models/page.model';
import type { ILibraryQuery, ITrack } from '../../core/models/track.model';

export const loadLibrary = createEffect(
  (
    actions$: Actions = inject(Actions),
    store: Store = inject(Store),
    trackService: TrackService = inject(TrackService),
    platformId: object = inject(PLATFORM_ID),
  ) => {
    const immediate$ = actions$.pipe(
      ofType(
        MediaLibraryPageActions.opened,
        MediaLibraryPageActions.searchReset,
        MediaLibraryPageActions.sortSelected,
        MediaLibraryPageActions.pageSelected,
        MediaLibraryPageActions.pageSizeSelected,
        MediaLibraryPageActions.retryClicked,
      ),
    );
    const typed$ = actions$.pipe(
      ofType(MediaLibraryPageActions.searchChanged),
      debounceTime(MY_UPLOADS_SEARCH_DEBOUNCE_MS),
    );
    const likesChanged$ = actions$.pipe(
      ofType(PlayerApiActions.likeSaved),
      concatLatestFrom(() => store.select(mediaLibraryFeature.selectIsLoaded)),
      filter(([, isLoaded]: [Action, boolean]) => isLoaded),
    );

    return merge(immediate$, typed$, likesChanged$).pipe(
      filter(() => isPlatformBrowser(platformId)),
      concatLatestFrom(() => store.select(mediaLibraryFeature.selectQuery)),
      switchMap(([, query]: [unknown, ILibraryQuery]) =>
        trackService.getLibrary(query).pipe(
          map((page: IPage<ITrack>) => MediaLibraryApiActions.libraryLoaded({ page: page })),
          catchError(() => of(MediaLibraryApiActions.libraryLoadFailed())),
          untilLayoutClosed(actions$),
        ),
      ),
    );
  },
  { functional: true },
);

export const rememberLibraryPageSize = createEffect(
  (
    actions$: Actions = inject(Actions),
    preferences: UploadsPreferencesService = inject(UploadsPreferencesService),
  ) => {
    return actions$.pipe(
      ofType(MediaLibraryPageActions.pageSizeSelected),
      tap(({ size }: { size: number }) => {
        preferences.writePageSize(size);
      }),
    );
  },
  { functional: true, dispatch: false },
);

export const removeFromLibrary = createEffect(
  (actions$: Actions = inject(Actions), trackService: TrackService = inject(TrackService)) => {
    return actions$.pipe(
      ofType(MediaLibraryPageActions.removeConfirmed),
      concatMap(({ trackId }: { trackId: number }) =>
        trackService.setLiked(trackId, false).pipe(
          map(() => MediaLibraryApiActions.trackRemoved({ trackId: trackId })),
          catchError(() => of(MediaLibraryApiActions.trackRemoveFailed())),
        ),
      ),
    );
  },
  { functional: true },
);

export const forgetRemovedLike = createEffect(
  (actions$: Actions = inject(Actions)) => {
    return actions$.pipe(
      ofType(MediaLibraryApiActions.trackRemoved),
      map(({ trackId }: { trackId: number }) =>
        PlayerApiActions.likeSaved({ trackId: trackId, liked: false }),
      ),
    );
  },
  { functional: true },
);

export const reportLibraryActionOutcome = createEffect(
  (
    actions$: Actions = inject(Actions),
    snackbarService: SnackbarService = inject(SnackbarService),
  ) => {
    return merge(
      actions$.pipe(
        ofType(MediaLibraryApiActions.trackRemoved),
        tap(() => {
          snackbarService.success(MEDIA_LIBRARY_MESSAGES.removed);
        }),
      ),
      actions$.pipe(
        ofType(MediaLibraryPageActions.trackReported),
        tap(() => {
          snackbarService.success(MEDIA_LIBRARY_MESSAGES.reported);
        }),
      ),
      actions$.pipe(
        ofType(MediaLibraryApiActions.trackRemoveFailed),
        tap(() => {
          snackbarService.error(MEDIA_LIBRARY_MESSAGES.actionFailed);
        }),
      ),
    );
  },
  { functional: true, dispatch: false },
);
