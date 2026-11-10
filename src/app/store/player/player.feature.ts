import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { Constants } from '../../core/constants/constants';
import { RepeatModeEnum } from '../../core/enums/repeat-mode.enum';
import { NEXT_REPEAT_MODE } from '../../features/constants/player.constant';
import { sequentialOrder } from '../../shared/helpers/player/player.helpers';
import { AudioPlayerActions } from '../ui/audio-player.actions';
import { GeneralSettingsPageActions } from '../ui/general-settings-page.actions';
import { MainLayoutActions } from '../ui/main-layout.actions';
import { MyUploadsPageActions } from '../ui/my-uploads-page.actions';
import { MyUploadsApiActions } from '../my-uploads/my-uploads.actions';
import { SettingsApiActions } from '../settings/settings.actions';
import { PlayerActions, PlayerApiActions } from './player.actions';

import type { IPlayback, IPlayerTrack } from '../../core/models/player.model';
import type { IGeneralSettings } from '../../core/models/settings.model';

export interface IPlayerState {
  queue: readonly IPlayerTrack[];
  order: readonly number[];
  position: number;
  playbackId: number;
  isPlaying: boolean;
  isShuffled: boolean;
  repeatMode: RepeatModeEnum;
  likedTrackIds: readonly number[];
}

export const initialPlayerState: IPlayerState = {
  queue: [],
  order: [],
  position: Constants.ZERO,
  playbackId: Constants.ZERO,
  isPlaying: false,
  isShuffled: false,
  repeatMode: RepeatModeEnum.OFF,
  likedTrackIds: [],
};

function currentQueueIndex(state: IPlayerState): number {
  return state.order[state.position] ?? Constants.ZERO;
}

function nextPosition(state: IPlayerState): number | null {
  if (state.position + Constants.ONE < state.order.length) {
    return state.position + Constants.ONE;
  }

  return state.repeatMode === RepeatModeEnum.ALL ? Constants.ZERO : null;
}

function previousPosition(state: IPlayerState): number | null {
  if (state.position > Constants.ZERO) {
    return state.position - Constants.ONE;
  }

  return state.repeatMode === RepeatModeEnum.ALL ? state.order.length - Constants.ONE : null;
}

function playAt(state: IPlayerState, position: number | null): IPlayerState {
  if (position === null) {
    return state;
  }

  return {
    ...state,
    position: position,
    playbackId: state.playbackId + Constants.ONE,
    isPlaying: true,
  };
}

function withLikedState(
  likedTrackIds: readonly number[],
  trackId: number,
  liked: boolean,
): readonly number[] {
  const others: number[] = likedTrackIds.filter((id: number) => id !== trackId);

  return liked ? [...others, trackId] : others;
}

function likedFromQueue(
  likedTrackIds: readonly number[],
  queue: readonly IPlayerTrack[],
): readonly number[] {
  const queuedIds: ReadonlySet<number> = new Set(queue.map((track: IPlayerTrack) => track.id));

  return [
    ...likedTrackIds.filter((id: number) => !queuedIds.has(id)),
    ...queue.filter((track: IPlayerTrack) => track.liked).map((track: IPlayerTrack) => track.id),
  ];
}

function pauseWhenRadioModeEnabled(
  state: IPlayerState,
  radioMode: boolean | undefined,
): IPlayerState {
  return radioMode ? { ...state, isPlaying: false } : state;
}

export const playerFeature = createFeature({
  name: 'player',
  reducer: createReducer(
    initialPlayerState,
    on(
      PlayerActions.queueStarted,
      MyUploadsPageActions.trackPlayed,
      (
        state: IPlayerState,
        { queue, startIndex }: { queue: readonly IPlayerTrack[]; startIndex: number },
      ): IPlayerState => ({
        ...state,
        queue: queue,
        order: sequentialOrder(queue.length),
        position: startIndex,
        playbackId: state.playbackId + Constants.ONE,
        isPlaying: queue.length > Constants.ZERO,
        likedTrackIds: likedFromQueue(state.likedTrackIds, queue),
      }),
    ),
    on(
      PlayerActions.orderShuffled,
      (state: IPlayerState, { order }: { order: readonly number[] }): IPlayerState => ({
        ...state,
        order: order,
        position: Math.max(order.indexOf(currentQueueIndex(state)), Constants.ZERO),
      }),
    ),
    on(
      AudioPlayerActions.playToggled,
      MyUploadsPageActions.playbackToggled,
      (state: IPlayerState): IPlayerState =>
        state.queue.length > Constants.ZERO ? { ...state, isPlaying: !state.isPlaying } : state,
    ),
    on(
      AudioPlayerActions.nextClicked,
      (state: IPlayerState): IPlayerState => playAt(state, nextPosition(state)),
    ),
    on(
      AudioPlayerActions.previousClicked,
      (state: IPlayerState): IPlayerState => playAt(state, previousPosition(state)),
    ),
    on(PlayerActions.trackEnded, (state: IPlayerState): IPlayerState => {
      if (state.repeatMode === RepeatModeEnum.ONE) {
        return playAt(state, state.position);
      }

      const position: number | null = nextPosition(state);

      return position === null ? { ...state, isPlaying: false } : playAt(state, position);
    }),
    on(
      AudioPlayerActions.shuffleToggled,
      (state: IPlayerState): IPlayerState =>
        state.isShuffled
          ? {
              ...state,
              isShuffled: false,
              order: sequentialOrder(state.queue.length),
              position: currentQueueIndex(state),
            }
          : { ...state, isShuffled: true },
    ),
    on(
      AudioPlayerActions.repeatToggled,
      (state: IPlayerState): IPlayerState => ({
        ...state,
        repeatMode: NEXT_REPEAT_MODE[state.repeatMode],
      }),
    ),
    on(AudioPlayerActions.likeToggled, (state: IPlayerState): IPlayerState => {
      const track: IPlayerTrack | undefined = state.queue[currentQueueIndex(state)];

      if (!track?.canLike) {
        return state;
      }

      const trackId: number = track.id;

      return {
        ...state,
        likedTrackIds: withLikedState(
          state.likedTrackIds,
          trackId,
          !state.likedTrackIds.includes(trackId),
        ),
      };
    }),
    on(
      PlayerApiActions.likeFailed,
      (
        state: IPlayerState,
        { trackId, liked }: { trackId: number; liked: boolean },
      ): IPlayerState => ({
        ...state,
        likedTrackIds: withLikedState(state.likedTrackIds, trackId, liked),
      }),
    ),
    on(
      PlayerActions.playbackFailed,
      (state: IPlayerState): IPlayerState => ({ ...state, isPlaying: false }),
    ),
    on(
      GeneralSettingsPageActions.settingChanged,
      (state: IPlayerState, { changes }: { changes: Partial<IGeneralSettings> }): IPlayerState =>
        pauseWhenRadioModeEnabled(state, changes.radioMode),
    ),
    on(
      SettingsApiActions.settingsLoaded,
      (state: IPlayerState, { settings }: { settings: IGeneralSettings }): IPlayerState =>
        pauseWhenRadioModeEnabled(state, settings.radioMode),
    ),
    on(
      MyUploadsApiActions.trackDeleted,
      (state: IPlayerState, { trackId }: { trackId: number }): IPlayerState =>
        state.queue.some((track: IPlayerTrack) => track.id === trackId)
          ? {
              ...state,
              queue: [],
              order: [],
              position: Constants.ZERO,
              playbackId: state.playbackId + Constants.ONE,
              isPlaying: false,
            }
          : state,
    ),
    on(MainLayoutActions.closed, (): IPlayerState => initialPlayerState),
  ),
  extraSelectors: ({
    selectQueue,
    selectOrder,
    selectPosition,
    selectPlaybackId,
    selectIsPlaying,
    selectRepeatMode,
    selectLikedTrackIds,
  }) => {
    const selectCurrentTrack = createSelector(
      selectQueue,
      selectOrder,
      selectPosition,
      (
        queue: readonly IPlayerTrack[],
        order: readonly number[],
        position: number,
      ): IPlayerTrack | null => queue[order[position] ?? Constants.NOT_FOUND_INDEX] ?? null,
    );

    return {
      selectCurrentTrack: selectCurrentTrack,
      selectHasNext: createSelector(
        selectOrder,
        selectPosition,
        selectRepeatMode,
        (order: readonly number[], position: number, repeatMode: RepeatModeEnum): boolean =>
          position + Constants.ONE < order.length ||
          (repeatMode === RepeatModeEnum.ALL && order.length > Constants.ONE),
      ),
      selectHasPrevious: createSelector(
        selectOrder,
        selectPosition,
        selectRepeatMode,
        (order: readonly number[], position: number, repeatMode: RepeatModeEnum): boolean =>
          position > Constants.ZERO ||
          (repeatMode === RepeatModeEnum.ALL && order.length > Constants.ONE),
      ),
      selectCanLikeCurrentTrack: createSelector(
        selectCurrentTrack,
        (track: IPlayerTrack | null): boolean => track?.canLike ?? false,
      ),
      selectIsCurrentTrackLiked: createSelector(
        selectCurrentTrack,
        selectLikedTrackIds,
        (track: IPlayerTrack | null, likedTrackIds: readonly number[]): boolean =>
          track !== null && likedTrackIds.includes(track.id),
      ),
      selectPlayback: createSelector(
        selectCurrentTrack,
        selectPlaybackId,
        selectIsPlaying,
        (track: IPlayerTrack | null, playbackId: number, isPlaying: boolean): IPlayback => ({
          track: track,
          playbackId: playbackId,
          isPlaying: isPlaying,
        }),
      ),
    };
  },
});
