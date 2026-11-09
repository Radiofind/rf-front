import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { concatLatestFrom } from '@ngrx/operators';
import { combineLatest, distinctUntilChanged, filter, map, merge, tap } from 'rxjs';
import { AudioPlayerService } from '../../features/services/audio-player-service/audio-player.service';
import { SnackbarService } from '../../shared/services/snackbar-service/snackbar.service';
import { shuffledOrder } from '../../shared/helpers/player/player.helpers';
import { Constants } from '../../core/constants/constants';
import { AudioPlayerActions } from '../ui/audio-player.actions';
import { settingsFeature } from '../settings/settings.feature';
import { PlayerActions } from './player.actions';
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
      ofType(PlayerActions.queueStarted, AudioPlayerActions.shuffleToggled),
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
  (audioPlayerService: AudioPlayerService = inject(AudioPlayerService)) => {
    return merge(
      audioPlayerService.ended$.pipe(map(() => PlayerActions.trackEnded())),
      audioPlayerService.failed$.pipe(map(() => PlayerActions.playbackFailed())),
    );
  },
  { functional: true },
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
