import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { concatLatestFrom } from '@ngrx/operators';
import { catchError, concatMap, debounceTime, filter, map, merge, of, switchMap, tap } from 'rxjs';
import { TrackService } from '../../features/services/track-service/track.service';
import { UploadsPreferencesService } from '../../features/services/uploads-preferences-service/uploads-preferences.service';
import { MY_UPLOADS_SEARCH_DEBOUNCE_MS } from '../../features/constants/my-uploads.constant';
import { MyUploadsPageActions } from '../ui/my-uploads-page.actions';
import { SnackbarService } from '../../shared/services/snackbar-service/snackbar.service';
import { MY_UPLOADS_MESSAGES } from '../../features/constants/my-uploads.constant';
import { untilLayoutClosed } from '../shared/session.operators';
import { MyUploadsApiActions } from './my-uploads.actions';
import { myUploadsFeature } from './my-uploads.feature';

import type { Action } from '@ngrx/store';
import type { IPage } from '../../core/models/page.model';
import type { IOwnTracksQuery, ITrack } from '../../core/models/track.model';
import type { TranslationKey } from '../../core/types/translation.type';

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
        MyUploadsPageActions.sortSelected,
        MyUploadsPageActions.pageSelected,
        MyUploadsPageActions.pageSizeSelected,
        MyUploadsPageActions.retryClicked,
        MyUploadsPageActions.trackEdited,
        MyUploadsApiActions.trackChanged,
        MyUploadsApiActions.trackDeleted,
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

export const rememberPageSize = createEffect(
  (
    actions$: Actions = inject(Actions),
    preferences: UploadsPreferencesService = inject(UploadsPreferencesService),
  ) => {
    return actions$.pipe(
      ofType(MyUploadsPageActions.pageSizeSelected),
      tap(({ size }: { size: number }) => {
        preferences.writePageSize(size);
      }),
    );
  },
  { functional: true, dispatch: false },
);

export const cancelSubmission = createEffect(
  (actions$: Actions = inject(Actions), trackService: TrackService = inject(TrackService)) => {
    return actions$.pipe(
      ofType(MyUploadsPageActions.submissionCancelConfirmed),
      concatMap(({ trackId }: { trackId: number }) =>
        trackService.cancelSubmission(trackId).pipe(
          map(() =>
            MyUploadsApiActions.trackChanged({ message: MY_UPLOADS_MESSAGES.submissionCancelled }),
          ),
          catchError(() =>
            of(
              MyUploadsApiActions.trackActionFailed({ message: MY_UPLOADS_MESSAGES.actionFailed }),
            ),
          ),
        ),
      ),
    );
  },
  { functional: true },
);

export const submitForReview = createEffect(
  (actions$: Actions = inject(Actions), trackService: TrackService = inject(TrackService)) => {
    return actions$.pipe(
      ofType(MyUploadsPageActions.submitConfirmed),
      concatMap(({ trackId, isResubmission }: { trackId: number; isResubmission: boolean }) =>
        trackService.submitForReview(trackId).pipe(
          map(() =>
            MyUploadsApiActions.trackChanged({
              message: isResubmission
                ? MY_UPLOADS_MESSAGES.resubmitted
                : MY_UPLOADS_MESSAGES.submitted,
            }),
          ),
          catchError(() =>
            of(
              MyUploadsApiActions.trackActionFailed({ message: MY_UPLOADS_MESSAGES.actionFailed }),
            ),
          ),
        ),
      ),
    );
  },
  { functional: true },
);

export const deleteTrack = createEffect(
  (actions$: Actions = inject(Actions), trackService: TrackService = inject(TrackService)) => {
    return actions$.pipe(
      ofType(MyUploadsPageActions.deleteConfirmed),
      concatMap(({ trackId }: { trackId: number }) =>
        trackService.delete(trackId).pipe(
          map(() => MyUploadsApiActions.trackDeleted({ trackId: trackId })),
          catchError(() =>
            of(
              MyUploadsApiActions.trackActionFailed({ message: MY_UPLOADS_MESSAGES.actionFailed }),
            ),
          ),
        ),
      ),
    );
  },
  { functional: true },
);

export const reportTrackActionOutcome = createEffect(
  (
    actions$: Actions = inject(Actions),
    snackbarService: SnackbarService = inject(SnackbarService),
  ) => {
    return merge(
      actions$.pipe(
        ofType(MyUploadsApiActions.trackChanged),
        tap(({ message }: { message: TranslationKey }) => {
          snackbarService.success(message);
        }),
      ),
      actions$.pipe(
        ofType(MyUploadsApiActions.trackDeleted),
        tap(() => {
          snackbarService.success(MY_UPLOADS_MESSAGES.deleted);
        }),
      ),
      actions$.pipe(
        ofType(MyUploadsPageActions.trackEdited),
        tap(() => {
          snackbarService.success(MY_UPLOADS_MESSAGES.edited);
        }),
      ),
      actions$.pipe(
        ofType(MyUploadsPageActions.scheduleChangeRequested),
        tap(() => {
          snackbarService.success(MY_UPLOADS_MESSAGES.scheduleChangeRequested);
        }),
      ),
      actions$.pipe(
        ofType(MyUploadsApiActions.trackActionFailed),
        tap(({ message }: { message: TranslationKey }) => {
          snackbarService.error(message);
        }),
      ),
    );
  },
  { functional: true, dispatch: false },
);
