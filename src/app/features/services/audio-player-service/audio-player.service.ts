import { inject, PLATFORM_ID, Service, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';
import { Constants } from '../../../core/constants/constants';

import type { Signal, WritableSignal } from '@angular/core';
import type { Observable } from 'rxjs';
import type { IPlayback } from '../../../core/models/player.model';

@Service()
export class AudioPlayerService {
  private readonly isBrowser: boolean = isPlatformBrowser(inject(PLATFORM_ID));

  private audio: HTMLAudioElement | null = null;

  private loadedPlaybackId: number | null = null;

  private listenedSeconds: number = Constants.ZERO;

  private lastPosition: number = Constants.ZERO;

  private isListenQualified: boolean = false;

  private readonly currentTimeState: WritableSignal<number> = signal<number>(Constants.ZERO);

  private readonly durationState: WritableSignal<number> = signal<number>(Constants.ZERO);

  private readonly endedSubject: Subject<void> = new Subject<void>();

  private readonly failedSubject: Subject<void> = new Subject<void>();

  private readonly listenQualifiedSubject: Subject<void> = new Subject<void>();

  public readonly currentTime: Signal<number> = this.currentTimeState.asReadonly();

  public readonly duration: Signal<number> = this.durationState.asReadonly();

  public readonly ended$: Observable<void> = this.endedSubject.asObservable();

  public readonly failed$: Observable<void> = this.failedSubject.asObservable();

  public readonly listenQualified$: Observable<void> = this.listenQualifiedSubject.asObservable();

  public sync({ track, playbackId, isPlaying }: IPlayback): void {
    const audio: HTMLAudioElement | null = this.element();

    if (!audio) {
      return;
    }

    if (!track) {
      this.unload(audio);
      return;
    }

    if (playbackId !== this.loadedPlaybackId) {
      this.loadedPlaybackId = playbackId;
      this.resetListening();
      this.currentTimeState.set(Constants.ZERO);
      this.durationState.set(Constants.ZERO);
      audio.src = track.audioUrl;
    }

    if (isPlaying) {
      audio.play().catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === Constants.ABORT_ERROR_NAME)) {
          this.failedSubject.next();
        }
      });
    } else {
      audio.pause();
    }
  }

  public seek(seconds: number): void {
    if (!this.audio || this.loadedPlaybackId === null) {
      return;
    }

    this.audio.currentTime = seconds;
    this.lastPosition = seconds;
    this.currentTimeState.set(seconds);
  }

  private element(): HTMLAudioElement | null {
    if (!this.isBrowser) {
      return null;
    }

    this.audio ??= this.createElement();

    return this.audio;
  }

  private createElement(): HTMLAudioElement {
    const audio: HTMLAudioElement = new Audio();
    audio.preload = 'metadata';

    audio.addEventListener('timeupdate', () => {
      this.trackListening(audio);
      this.currentTimeState.set(audio.currentTime);
    });
    audio.addEventListener('durationchange', () =>
      this.durationState.set(Number.isFinite(audio.duration) ? audio.duration : Constants.ZERO),
    );
    audio.addEventListener('ended', () => this.endedSubject.next());
    audio.addEventListener('error', () => {
      if (this.loadedPlaybackId !== null) {
        this.failedSubject.next();
      }
    });

    return audio;
  }

  private trackListening(audio: HTMLAudioElement): void {
    const step: number = audio.currentTime - this.lastPosition;
    this.lastPosition = audio.currentTime;

    if (step > Constants.ZERO && step <= Constants.LISTEN_MAX_STEP_SECONDS) {
      this.listenedSeconds += step;
    }

    const threshold: number = Math.min(
      Constants.LISTEN_QUALIFYING_SECONDS,
      audio.duration * Constants.LISTEN_SHORT_TRACK_SHARE,
    );

    if (
      !this.isListenQualified &&
      threshold > Constants.ZERO &&
      this.listenedSeconds >= threshold
    ) {
      this.isListenQualified = true;
      this.listenQualifiedSubject.next();
    }
  }

  private resetListening(): void {
    this.listenedSeconds = Constants.ZERO;
    this.lastPosition = Constants.ZERO;
    this.isListenQualified = false;
  }

  private unload(audio: HTMLAudioElement): void {
    if (this.loadedPlaybackId === null) {
      return;
    }

    this.loadedPlaybackId = null;
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    this.currentTimeState.set(Constants.ZERO);
    this.durationState.set(Constants.ZERO);
  }
}
