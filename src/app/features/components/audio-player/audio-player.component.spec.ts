import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { AudioPlayerComponent } from './audio-player.component';
import { AudioPlayerService } from '../../services/audio-player-service/audio-player.service';
import { playerFeature } from '../../../store/player/player.feature';
import { settingsFeature } from '../../../store/settings/settings.feature';
import { AudioPlayerActions } from '../../../store/ui/audio-player.actions';
import { DEFAULT_GENERAL_SETTINGS } from '../../constants/settings.constant';
import { RepeatModeEnum } from '../../../core/enums/repeat-mode.enum';

import type { ComponentFixture } from '@angular/core/testing';
import type { WritableSignal } from '@angular/core';
import type { IPlayerTrack } from '../../../core/models/player.model';

describe('AudioPlayerComponent', () => {
  const track: IPlayerTrack = {
    id: 1,
    title: 'Midnight Dreams',
    artistName: 'Neon Lights',
    coverUrl: 'blob:cover',
    audioUrl: '/audio/1',
    liked: false,
    canLike: true,
  };

  let fixture: ComponentFixture<AudioPlayerComponent>;
  let store: MockStore;
  let dispatch: ReturnType<typeof vi.spyOn>;
  let seek: ReturnType<typeof vi.fn>;
  let currentTime: WritableSignal<number>;

  const element = (): HTMLElement => fixture.nativeElement as HTMLElement;

  const button = (label: string): HTMLButtonElement =>
    element().querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!;

  afterEach(() => {
    store.resetSelectors();
  });

  beforeEach(async () => {
    TestBed.resetTestingModule();
    seek = vi.fn();
    currentTime = signal<number>(0);

    await TestBed.configureTestingModule({
      imports: [AudioPlayerComponent],
      providers: [
        provideMockStore({
          selectors: [
            {
              selector: settingsFeature.selectSettings,
              value: { ...DEFAULT_GENERAL_SETTINGS, radioMode: false },
            },
            { selector: playerFeature.selectCurrentTrack, value: track },
            { selector: playerFeature.selectIsPlaying, value: false },
            { selector: playerFeature.selectIsShuffled, value: false },
            { selector: playerFeature.selectRepeatMode, value: RepeatModeEnum.OFF },
            { selector: playerFeature.selectHasNext, value: true },
            { selector: playerFeature.selectHasPrevious, value: true },
            { selector: playerFeature.selectIsCurrentTrackLiked, value: false },
            { selector: playerFeature.selectCanLikeCurrentTrack, value: true },
          ],
        }),
        {
          provide: AudioPlayerService,
          useValue: { currentTime: currentTime, duration: signal<number>(272), seek: seek },
        },
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    dispatch = vi.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(AudioPlayerComponent);
    await fixture.whenStable();
  });

  it('shows the current track with its controls when radio mode is off', () => {
    expect(element().querySelector('.player__title')!.textContent.trim()).toBe('Midnight Dreams');
    expect(element().querySelector('.player__artist')!.textContent.trim()).toBe('Neon Lights');
    expect(element().querySelector('.player__controls')).not.toBeNull();
    expect(element().querySelector('.player__radio')).toBeNull();
  });

  it('replaces the controls with the radio notice when radio mode is on', async () => {
    store.overrideSelector(settingsFeature.selectSettings, DEFAULT_GENERAL_SETTINGS);
    store.refreshState();
    await fixture.whenStable();

    expect(element().querySelector('.player__radio')!.textContent.trim()).toBe(
      'Radio mode is active',
    );
    expect(element().querySelector('.player__controls')).toBeNull();
  });

  it('disables playback while nothing is playing', async () => {
    store.overrideSelector(playerFeature.selectCurrentTrack, null);
    store.refreshState();
    await fixture.whenStable();

    expect(element().querySelector('.player__title')!.textContent.trim()).toBe('Nothing playing');
    expect(button('Play').disabled).toBe(true);
  });

  it('offers pause while a track is playing', async () => {
    store.overrideSelector(playerFeature.selectIsPlaying, true);
    store.refreshState();
    await fixture.whenStable();

    expect(button('Pause')).not.toBeNull();
  });

  it('shows the elapsed time and the duration', () => {
    currentTime.set(84);
    fixture.detectChanges();

    const times: string[] = Array.from(element().querySelectorAll('.player__time')).map(
      (time: Element) => time.textContent.trim(),
    );

    expect(times).toEqual(['1:24', '4:32']);
  });

  it.each([
    ['Play', AudioPlayerActions.playToggled()],
    ['Next track', AudioPlayerActions.nextClicked()],
    ['Shuffle', AudioPlayerActions.shuffleToggled()],
    ['Repeat: off', AudioPlayerActions.repeatToggled()],
    ['Like', AudioPlayerActions.likeToggled()],
  ])('reports a click on %s', (label: string, action: object) => {
    button(label).click();

    expect(dispatch).toHaveBeenCalledExactlyOnceWith(action);
  });

  it('goes to the previous track at the start of the current one', () => {
    currentTime.set(2);

    button('Previous track').click();

    expect(dispatch).toHaveBeenCalledExactlyOnceWith(AudioPlayerActions.previousClicked());
  });

  it('restarts the current track once it has played for a while', () => {
    currentTime.set(30);

    button('Previous track').click();

    expect(seek).toHaveBeenCalledExactlyOnceWith(0);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('seeks to the position chosen on the progress bar', () => {
    const slider: HTMLInputElement = element().querySelector('.player__seek')!;
    slider.value = '120';

    slider.dispatchEvent(new Event('input'));

    expect(seek).toHaveBeenCalledExactlyOnceWith(120);
  });

  it('falls back to the placeholder when the cover cannot be loaded', async () => {
    element().querySelector('img')!.dispatchEvent(new Event('error'));
    await fixture.whenStable();

    expect(element().querySelector('img')).toBeNull();
    expect(element().querySelector('.player__cover--placeholder')).not.toBeNull();
  });
  it('likes the current track that passed the review', () => {
    button('Like').click();

    expect(button('Like').hasAttribute('aria-describedby')).toBe(false);
    expect(dispatch).toHaveBeenCalledExactlyOnceWith(AudioPlayerActions.likeToggled());
  });

  it('explains why a track in review cannot be liked yet', async () => {
    store.overrideSelector(playerFeature.selectCanLikeCurrentTrack, false);
    store.refreshState();
    await fixture.whenStable();
    const like: HTMLButtonElement = button('Like');

    like.click();

    const description: HTMLElement | null = document.getElementById(
      like.getAttribute('aria-describedby') ?? '',
    );
    expect(like.getAttribute('aria-disabled')).toBe('true');
    expect(description?.textContent).toBe('Likes open once the track passes the quality review');
    expect(dispatch).not.toHaveBeenCalled();
  });
});
