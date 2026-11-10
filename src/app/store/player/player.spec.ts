import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideState, provideStore, Store } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { of, Subject, throwError } from 'rxjs';
import { playerFeature } from './player.feature';
import * as playerEffects from './player.effects';
import { PlayerActions } from './player.actions';
import { TrackService } from '../../features/services/track-service/track.service';
import { settingsFeature } from '../settings/settings.feature';
import { SettingsApiActions } from '../settings/settings.actions';
import { AudioPlayerActions } from '../ui/audio-player.actions';
import { GeneralSettingsPageActions } from '../ui/general-settings-page.actions';
import { MainLayoutActions } from '../ui/main-layout.actions';
import { MyUploadsPageActions } from '../ui/my-uploads-page.actions';
import { AudioPlayerService } from '../../features/services/audio-player-service/audio-player.service';
import { SnackbarService } from '../../shared/services/snackbar-service/snackbar.service';
import { DEFAULT_GENERAL_SETTINGS } from '../../features/constants/settings.constant';
import { RepeatModeEnum } from '../../core/enums/repeat-mode.enum';
import { Constants } from '../../core/constants/constants';

import type { IPlayback, IPlayerTrack } from '../../core/models/player.model';

describe('player state', () => {
  const first: IPlayerTrack = {
    id: 1,
    title: 'Midnight Dreams',
    artistName: 'Neon Lights',
    coverUrl: null,
    audioUrl: '/audio/1',
    liked: false,
    canLike: true,
  };
  const second: IPlayerTrack = {
    id: 2,
    title: 'Low Tide',
    artistName: 'Harbor',
    coverUrl: null,
    audioUrl: '/audio/2',
    liked: false,
    canLike: true,
  };
  const third: IPlayerTrack = {
    id: 3,
    title: 'Glass City',
    artistName: 'Static Bloom',
    coverUrl: null,
    audioUrl: '/audio/3',
    liked: false,
    canLike: true,
  };

  let store: Store;
  let sync: ReturnType<typeof vi.fn>;
  let snackbarError: ReturnType<typeof vi.fn>;
  let ended$: Subject<void>;
  let failed$: Subject<void>;
  let listenQualified$: Subject<void>;
  let setLiked: ReturnType<typeof vi.fn>;
  let recordPlay: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    TestBed.resetTestingModule();
    sync = vi.fn();
    snackbarError = vi.fn();
    ended$ = new Subject<void>();
    failed$ = new Subject<void>();
    listenQualified$ = new Subject<void>();
    setLiked = vi.fn().mockReturnValue(of(undefined));
    recordPlay = vi.fn().mockReturnValue(of(undefined));

    TestBed.configureTestingModule({
      providers: [
        provideStore(),
        provideState(settingsFeature),
        provideState(playerFeature),
        provideEffects(playerEffects),
        {
          provide: AudioPlayerService,
          useValue: {
            sync: sync,
            ended$: ended$,
            failed$: failed$,
            listenQualified$: listenQualified$,
          },
        },
        { provide: TrackService, useValue: { setLiked: setLiked, recordPlay: recordPlay } },
        { provide: SnackbarService, useValue: { error: snackbarError } },
      ],
    });
    store = TestBed.inject(Store);
    store.dispatch(
      SettingsApiActions.settingsLoaded({
        settings: { ...DEFAULT_GENERAL_SETTINGS, radioMode: false },
      }),
    );
  });

  it('plays the chosen track when a queue starts', () => {
    store.dispatch(PlayerActions.queueStarted({ queue: [first, second], startIndex: 1 }));

    expect(store.selectSignal(playerFeature.selectCurrentTrack)()).toBe(second);
    expect(store.selectSignal(playerFeature.selectIsPlaying)()).toBe(true);
  });

  it('hands the started track to the audio element', () => {
    store.dispatch(PlayerActions.queueStarted({ queue: [first], startIndex: 0 }));

    expect(sync).toHaveBeenLastCalledWith({ track: first, playbackId: 1, isPlaying: true });
  });

  it('keeps the audio silent while radio mode is enabled', () => {
    store.dispatch(
      SettingsApiActions.settingsLoaded({
        settings: { ...DEFAULT_GENERAL_SETTINGS, radioMode: true },
      }),
    );
    store.dispatch(PlayerActions.queueStarted({ queue: [first], startIndex: 0 }));

    expect(sync.mock.lastCall?.[0]).toMatchObject({ isPlaying: false });
  });

  it('pauses playback when radio mode gets enabled', () => {
    store.dispatch(PlayerActions.queueStarted({ queue: [first], startIndex: 0 }));

    store.dispatch(GeneralSettingsPageActions.settingChanged({ changes: { radioMode: true } }));

    expect(store.selectSignal(playerFeature.selectIsPlaying)()).toBe(false);
  });

  it('pauses and resumes when play is toggled', () => {
    store.dispatch(PlayerActions.queueStarted({ queue: [first], startIndex: 0 }));

    store.dispatch(AudioPlayerActions.playToggled());

    expect(sync.mock.lastCall?.[0]).toMatchObject({ isPlaying: false });
  });

  it('moves to the following track when next is clicked', () => {
    store.dispatch(PlayerActions.queueStarted({ queue: [first, second], startIndex: 0 }));

    store.dispatch(AudioPlayerActions.nextClicked());

    expect(store.selectSignal(playerFeature.selectCurrentTrack)()).toBe(second);
  });

  it('offers no next track at the end of the queue without repeat', () => {
    store.dispatch(PlayerActions.queueStarted({ queue: [first, second], startIndex: 1 }));

    expect(store.selectSignal(playerFeature.selectHasNext)()).toBe(false);
  });

  it('wraps to the first track when next is clicked at the end with repeat all', () => {
    store.dispatch(PlayerActions.queueStarted({ queue: [first, second], startIndex: 1 }));
    store.dispatch(AudioPlayerActions.repeatToggled());

    store.dispatch(AudioPlayerActions.nextClicked());

    expect(store.selectSignal(playerFeature.selectCurrentTrack)()).toBe(first);
  });

  it('moves to the preceding track when previous is clicked', () => {
    store.dispatch(PlayerActions.queueStarted({ queue: [first, second], startIndex: 1 }));

    store.dispatch(AudioPlayerActions.previousClicked());

    expect(store.selectSignal(playerFeature.selectCurrentTrack)()).toBe(first);
  });

  it('continues with the following track when a track ends', () => {
    store.dispatch(PlayerActions.queueStarted({ queue: [first, second], startIndex: 0 }));

    ended$.next();

    expect(store.selectSignal(playerFeature.selectCurrentTrack)()).toBe(second);
  });

  it('stops after the last track ends without repeat', () => {
    store.dispatch(PlayerActions.queueStarted({ queue: [first, second], startIndex: 1 }));

    ended$.next();

    expect(store.selectSignal(playerFeature.selectIsPlaying)()).toBe(false);
  });

  it('restarts the same track when it ends with repeat one', () => {
    store.dispatch(PlayerActions.queueStarted({ queue: [first, second], startIndex: 0 }));
    store.dispatch(AudioPlayerActions.repeatToggled());
    store.dispatch(AudioPlayerActions.repeatToggled());

    ended$.next();

    expect(sync).toHaveBeenLastCalledWith({ track: first, playbackId: 2, isPlaying: true });
  });

  it('cycles repeat from off through all and one back to off', () => {
    const modes: RepeatModeEnum[] = [];
    const repeatMode = store.selectSignal(playerFeature.selectRepeatMode);

    store.dispatch(AudioPlayerActions.repeatToggled());
    modes.push(repeatMode());
    store.dispatch(AudioPlayerActions.repeatToggled());
    modes.push(repeatMode());
    store.dispatch(AudioPlayerActions.repeatToggled());
    modes.push(repeatMode());

    expect(modes).toEqual([RepeatModeEnum.ALL, RepeatModeEnum.ONE, RepeatModeEnum.OFF]);
  });

  it('keeps the current track and every queued track when shuffle is enabled', () => {
    store.dispatch(PlayerActions.queueStarted({ queue: [first, second, third], startIndex: 1 }));

    store.dispatch(AudioPlayerActions.shuffleToggled());

    expect(store.selectSignal(playerFeature.selectCurrentTrack)()).toBe(second);
    expect([...store.selectSignal(playerFeature.selectOrder)()].sort()).toEqual([0, 1, 2]);
  });

  it('restores the original order without changing the track when shuffle is disabled', () => {
    store.dispatch(PlayerActions.queueStarted({ queue: [first, second, third], startIndex: 2 }));
    store.dispatch(AudioPlayerActions.shuffleToggled());

    store.dispatch(AudioPlayerActions.shuffleToggled());

    expect(store.selectSignal(playerFeature.selectOrder)()).toEqual([0, 1, 2]);
    expect(store.selectSignal(playerFeature.selectCurrentTrack)()).toBe(third);
  });

  it('likes and unlikes the current track', () => {
    store.dispatch(PlayerActions.queueStarted({ queue: [first], startIndex: 0 }));
    const isLiked = store.selectSignal(playerFeature.selectIsCurrentTrackLiked);

    store.dispatch(AudioPlayerActions.likeToggled());
    const likedAfterFirstToggle: boolean = isLiked();
    store.dispatch(AudioPlayerActions.likeToggled());

    expect(likedAfterFirstToggle).toBe(true);
    expect(isLiked()).toBe(false);
  });

  it('pauses and reports the failure when the audio cannot be played', () => {
    store.dispatch(PlayerActions.queueStarted({ queue: [first], startIndex: 0 }));

    failed$.next();

    expect(store.selectSignal(playerFeature.selectIsPlaying)()).toBe(false);
    expect(snackbarError).toHaveBeenCalledExactlyOnceWith(Constants.PLAYBACK_FAILED);
  });

  it('stops the audio when the layout closes', () => {
    store.dispatch(PlayerActions.queueStarted({ queue: [first], startIndex: 0 }));

    store.dispatch(MainLayoutActions.closed());

    expect((sync.mock.lastCall?.[0] as IPlayback).track).toBeNull();
  });
  it('plays an upload picked on the my uploads page and continues with the following one', () => {
    store.dispatch(MyUploadsPageActions.trackPlayed({ queue: [first, second], startIndex: 0 }));

    ended$.next();

    expect(store.selectSignal(playerFeature.selectCurrentTrack)()).toBe(second);
    expect(store.selectSignal(playerFeature.selectIsPlaying)()).toBe(true);
  });

  it('pauses the current upload when its cover is clicked again', () => {
    store.dispatch(MyUploadsPageActions.trackPlayed({ queue: [first], startIndex: 0 }));

    store.dispatch(MyUploadsPageActions.playbackToggled());

    expect(store.selectSignal(playerFeature.selectIsPlaying)()).toBe(false);
  });

  it('keeps the picked upload first when shuffle is on', () => {
    store.dispatch(AudioPlayerActions.shuffleToggled());

    store.dispatch(
      MyUploadsPageActions.trackPlayed({ queue: [first, second, third], startIndex: 2 }),
    );

    expect(store.selectSignal(playerFeature.selectCurrentTrack)()).toBe(third);
    expect(store.selectSignal(playerFeature.selectOrder)()[0]).toBe(2);
  });
  it('saves a like of the current track on the server', () => {
    store.dispatch(PlayerActions.queueStarted({ queue: [first], startIndex: 0 }));

    store.dispatch(AudioPlayerActions.likeToggled());

    expect(setLiked).toHaveBeenCalledExactlyOnceWith(1, true);
  });

  it('takes the like back and tells the user when it cannot be saved', () => {
    setLiked.mockReturnValue(throwError(() => new Error('offline')));
    store.dispatch(PlayerActions.queueStarted({ queue: [first], startIndex: 0 }));

    store.dispatch(AudioPlayerActions.likeToggled());

    expect(store.selectSignal(playerFeature.selectIsCurrentTrackLiked)()).toBe(false);
    expect(snackbarError).toHaveBeenCalledExactlyOnceWith(Constants.LIKE_FAILED);
  });

  it('knows which queued tracks the user already likes', () => {
    store.dispatch(
      PlayerActions.queueStarted({ queue: [{ ...first, liked: true }, second], startIndex: 0 }),
    );

    expect(store.selectSignal(playerFeature.selectIsCurrentTrackLiked)()).toBe(true);
  });

  it('reports a qualified listen of the current track', () => {
    store.dispatch(PlayerActions.queueStarted({ queue: [first, second], startIndex: 1 }));

    listenQualified$.next();

    expect(recordPlay).toHaveBeenCalledExactlyOnceWith(2);
  });

  it('keeps playing when a listen cannot be reported', () => {
    recordPlay.mockReturnValue(throwError(() => new Error('offline')));
    store.dispatch(PlayerActions.queueStarted({ queue: [first], startIndex: 0 }));

    listenQualified$.next();

    expect(store.selectSignal(playerFeature.selectIsPlaying)()).toBe(true);
    expect(snackbarError).not.toHaveBeenCalled();
  });
  it('ignores a like of a track that is still in review', () => {
    store.dispatch(
      PlayerActions.queueStarted({ queue: [{ ...first, canLike: false }], startIndex: 0 }),
    );

    store.dispatch(AudioPlayerActions.likeToggled());

    expect(store.selectSignal(playerFeature.selectIsCurrentTrackLiked)()).toBe(false);
    expect(setLiked).not.toHaveBeenCalled();
  });
});
