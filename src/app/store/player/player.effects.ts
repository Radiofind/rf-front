import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { concatLatestFrom } from '@ngrx/operators';
import {
  catchError,
  combineLatest,
  concatMap,
  distinctUntilChanged,
  EMPTY,
  filter,
  map,
  merge,
  mergeMap,
  of,
  tap,
} from 'rxjs';
import { AudioPlayerService } from '../../features/services/audio-player-service/audio-player.service';
import { TrackService } from '../../features/services/track-service/track.service';
import { SnackbarService } from '../../shared/services/snackbar-service/snackbar.service';
import { shuffledOrder } from '../../shared/helpers/player/player.helpers';
import { Constants } from '../../core/constants/constants';
import { AudioPlayerActions } from '../ui/audio-player.actions';
import { MyUploadsPageActions } from '../ui/my-uploads-page.actions';
import { MediaLibraryPageActions } from '../ui/media-library-page.actions';
import { settingsFeature } from '../settings/settings.feature';
import { PlayerActions, PlayerApiActions } from './player.actions';
import { playerFeature } from './player.feature';

import type { Action } from '@ngrx/store';
import type { IPlayback, IPlayerTrack } from '../../core/models/player.model';
import type { IGeneralSettings } from '../../core/models/settings.model';

const isSamePlayback = (previous: IPlayback, current: IPlayback): boolean =>
  previous.track === current.track &&
  previous.playbackId === current.playbackId &&
  previous.isPlaying === current.isPlaying;

export const shufflePlaybackOrder = createEffect(
  (actions$: Actions = inject(Actions), store: Store = inject(Store)) => {
    return actions$.pipe(
      ofType(
        PlayerActions.queueStarted,
        MyUploadsPageActions.trackPlayed,
        MediaLibraryPageActions.trackPlayed,
        AudioPlayerActions.shuffleToggled,
      ),
      concatLatestFrom(() => [
        store.select(playerFeature.selectIsShuffled),
        store.select(playerFeature.selectQueue),
        store.select(playerFeature.selectOrder),
        store.select(playerFeature.selectPosition),
      ]),
      filter(
        ([, isShuffled, queue]: [
          Action,
          boolean,
          readonly IPlayerTrack[],
          readonly number[],
          number,
        ]) => isShuffled && queue.length > Constants.ONE,
      ),
      map(
        ([, , queue, order, position]: [
          Action,
          boolean,
          readonly IPlayerTrack[],
          readonly number[],
          number,
        ]) =>
          PlayerActions.orderShuffled({
            order: shuffledOrder(queue.length, order[position] ?? Constants.ZERO),
          }),
      ),
    );
  },
  { functional: true },
);

export const syncAudio = createEffect(
  (
    store: Store = inject(Store),
    audioPlayerService: AudioPlayerService = inject(AudioPlayerService),
  ) => {
    return combineLatest([
      store.select(playerFeature.selectPlayback),
      store.select(settingsFeature.selectSettings),
    ]).pipe(
      map(
        ([playback, settings]: [IPlayback, IGeneralSettings]): IPlayback => ({
          ...playback,
          isPlaying: playback.isPlaying && !settings.radioMode,
        }),
      ),
      distinctUntilChanged(isSamePlayback),
      tap((playback: IPlayback) => audioPlayerService.sync(playback)),
    );
  },
  { functional: true, dispatch: false },
);

export const relayAudioEvents = createEffect(
  (
    audioPlayerService: AudioPlayerService = inject(AudioPlayerService),
    store: Store = inject(Store),
  ) => {
    return merge(
      audioPlayerService.ended$.pipe(map(() => PlayerActions.trackEnded())),
      audioPlayerService.failed$.pipe(map(() => PlayerActions.playbackFailed())),
      audioPlayerService.listenQualified$.pipe(
        concatLatestFrom(() => store.select(playerFeature.selectCurrentTrack)),
        filter(([, track]: [unknown, IPlayerTrack | null]) => track !== null),
        map(([, track]: [unknown, IPlayerTrack | null]) =>
          PlayerActions.listenQualified({ trackId: track?.id ?? Constants.ZERO }),
        ),
      ),
    );
  },
  { functional: true },
);

export const recordListen = createEffect(
  (actions$: Actions = inject(Actions), trackService: TrackService = inject(TrackService)) => {
    return actions$.pipe(
      ofType(PlayerActions.listenQualified),
      mergeMap(({ trackId }: { trackId: number }) =>
        trackService.recordPlay(trackId).pipe(catchError(() => EMPTY)),
      ),
    );
  },
  { functional: true, dispatch: false },
);

export const saveLike = createEffect(
  (
    actions$: Actions = inject(Actions),
    store: Store = inject(Store),
    trackService: TrackService = inject(TrackService),
  ) => {
    return actions$.pipe(
      ofType(AudioPlayerActions.likeToggled),
      concatLatestFrom(() => [
        store.select(playerFeature.selectCurrentTrack),
        store.select(playerFeature.selectIsCurrentTrackLiked),
      ]),
      filter(([, track]: [Action, IPlayerTrack | null, boolean]) => track?.canLike === true),
      concatMap(([, track, liked]: [Action, IPlayerTrack | null, boolean]) => {
        const trackId: number = track?.id ?? Constants.ZERO;

        return trackService.setLiked(trackId, liked).pipe(
          map(() => PlayerApiActions.likeSaved({ trackId: trackId, liked: liked })),
          catchError(() => of(PlayerApiActions.likeFailed({ trackId: trackId, liked: !liked }))),
        );
      }),
    );
  },
  { functional: true },
);

export const reportLikeFailure = createEffect(
  (
    actions$: Actions = inject(Actions),
    snackbarService: SnackbarService = inject(SnackbarService),
  ) => {
    return actions$.pipe(
      ofType(PlayerApiActions.likeFailed),
      tap(() => {
        snackbarService.error(Constants.LIKE_FAILED);
      }),
    );
  },
  { functional: true, dispatch: false },
);

export const reportPlaybackFailure = createEffect(
  (
    actions$: Actions = inject(Actions),
    snackbarService: SnackbarService = inject(SnackbarService),
  ) => {
    return actions$.pipe(
      ofType(PlayerActions.playbackFailed),
      tap(() => {
        snackbarService.error(Constants.PLAYBACK_FAILED);
      }),
    );
  },
  { functional: true, dispatch: false },
);
