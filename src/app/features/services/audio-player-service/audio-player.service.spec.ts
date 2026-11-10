import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { AudioPlayerService } from './audio-player.service';

import type { IPlayerTrack } from '../../../core/models/player.model';

describe('AudioPlayerService', () => {
  const track: IPlayerTrack = {
    id: 1,
    title: 'Midnight Dreams',
    artistName: 'Neon Lights',
    coverUrl: null,
    audioUrl: 'http://localhost/audio/1',
    liked: false,
    canLike: true,
  };

  let play: ReturnType<typeof vi.spyOn>;
  let pause: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    TestBed.resetTestingModule();
    play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    pause = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts the track when it should play', () => {
    const service: AudioPlayerService = TestBed.inject(AudioPlayerService);

    service.sync({ track: track, playbackId: 1, isPlaying: true });

    expect(play).toHaveBeenCalledOnce();
  });

  it('pauses the track when it should not play', () => {
    const service: AudioPlayerService = TestBed.inject(AudioPlayerService);

    service.sync({ track: track, playbackId: 1, isPlaying: false });

    expect(pause).toHaveBeenCalledOnce();
    expect(play).not.toHaveBeenCalled();
  });

  it('reports a failure when the browser refuses to play', async () => {
    play.mockRejectedValue(new DOMException('blocked', 'NotAllowedError'));
    const service: AudioPlayerService = TestBed.inject(AudioPlayerService);
    const failed = vi.fn<() => void>();
    service.failed$.subscribe(failed);

    service.sync({ track: track, playbackId: 1, isPlaying: true });
    await Promise.resolve();

    expect(failed).toHaveBeenCalledOnce();
  });

  it('ignores a play request interrupted by the next track', async () => {
    play.mockRejectedValue(new DOMException('interrupted', 'AbortError'));
    const service: AudioPlayerService = TestBed.inject(AudioPlayerService);
    const failed = vi.fn<() => void>();
    service.failed$.subscribe(failed);

    service.sync({ track: track, playbackId: 1, isPlaying: true });
    await Promise.resolve();

    expect(failed).not.toHaveBeenCalled();
  });

  it('announces the end of the track', () => {
    const service: AudioPlayerService = TestBed.inject(AudioPlayerService);
    const ended = vi.fn<() => void>();
    service.ended$.subscribe(ended);
    service.sync({ track: track, playbackId: 1, isPlaying: true });
    const audio: HTMLMediaElement = play.mock.contexts[0] as HTMLMediaElement;

    audio.dispatchEvent(new Event('ended'));

    expect(ended).toHaveBeenCalledOnce();
  });

  it('moves the position when seeking a loaded track', () => {
    const service: AudioPlayerService = TestBed.inject(AudioPlayerService);
    service.sync({ track: track, playbackId: 1, isPlaying: true });

    service.seek(42);

    expect(service.currentTime()).toBe(42);
  });

  it('ignores seeking while nothing is loaded', () => {
    const service: AudioPlayerService = TestBed.inject(AudioPlayerService);

    service.seek(42);

    expect(service.currentTime()).toBe(0);
  });

  it('counts a short track as listened once it has been played through', () => {
    const service: AudioPlayerService = TestBed.inject(AudioPlayerService);
    const qualified = vi.fn<() => void>();
    service.listenQualified$.subscribe(qualified);
    service.sync({ track: track, playbackId: 1, isPlaying: true });
    const audio: HTMLMediaElement = play.mock.contexts[0] as HTMLMediaElement;
    Object.defineProperty(audio, 'duration', { value: 2, configurable: true });
    Object.defineProperty(audio, 'currentTime', { value: 1, configurable: true, writable: true });
    audio.dispatchEvent(new Event('timeupdate'));
    audio.currentTime = 2;

    audio.dispatchEvent(new Event('timeupdate'));
    audio.dispatchEvent(new Event('timeupdate'));

    expect(qualified).toHaveBeenCalledOnce();
  });

  it('does not count skipping ahead as listening', () => {
    const service: AudioPlayerService = TestBed.inject(AudioPlayerService);
    const qualified = vi.fn<() => void>();
    service.listenQualified$.subscribe(qualified);
    service.sync({ track: track, playbackId: 1, isPlaying: true });
    const audio: HTMLMediaElement = play.mock.contexts[0] as HTMLMediaElement;
    Object.defineProperty(audio, 'duration', { value: 200, configurable: true });
    Object.defineProperty(audio, 'currentTime', { value: 190, configurable: true, writable: true });

    audio.dispatchEvent(new Event('timeupdate'));

    expect(qualified).not.toHaveBeenCalled();
  });

  it('plays nothing during server-side rendering', () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    const service: AudioPlayerService = TestBed.inject(AudioPlayerService);

    service.sync({ track: track, playbackId: 1, isPlaying: true });

    expect(play).not.toHaveBeenCalled();
  });
});
