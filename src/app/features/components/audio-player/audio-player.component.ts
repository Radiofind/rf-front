import { Component, computed, inject, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { Constants } from '../../../core/constants/constants';
import { RepeatModeEnum } from '../../../core/enums/repeat-mode.enum';
import { REPEAT_MODE_LABELS } from '../../constants/player.constant';
import { AudioPlayerService } from '../../services/audio-player-service/audio-player.service';
import { formatPlaybackTime } from '../../../shared/helpers/player/player.helpers';
import { TranslatePipe } from '../../../shared/pipes/translate/translate.pipe';
import { AudioPlayerActions } from '../../../store/ui/audio-player.actions';
import { playerFeature } from '../../../store/player/player.feature';
import { settingsFeature } from '../../../store/settings/settings.feature';

import type { Signal, WritableSignal } from '@angular/core';
import type { IPlayerTrack } from '../../../core/models/player.model';
import type { IGeneralSettings } from '../../../core/models/settings.model';
import type { TranslationKey } from '../../../core/types/translation.type';

@Component({
  selector: 'app-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrl: './audio-player.component.scss',
  imports: [TranslatePipe],
})
export class AudioPlayerComponent {
  private readonly store: Store = inject(Store);

  private readonly audioPlayerService: AudioPlayerService = inject(AudioPlayerService);

  private readonly settings: Signal<IGeneralSettings> = this.store.selectSignal(
    settingsFeature.selectSettings,
  );

  private readonly currentTrack: Signal<IPlayerTrack | null> = this.store.selectSignal(
    playerFeature.selectCurrentTrack,
  );

  private readonly hasPrevious: Signal<boolean> = this.store.selectSignal(
    playerFeature.selectHasPrevious,
  );

  private readonly brokenCovers: WritableSignal<ReadonlySet<string>> = signal<ReadonlySet<string>>(
    new Set<string>(),
  );

  protected readonly isRadioMode: Signal<boolean> = computed<boolean>(
    () => this.settings().radioMode,
  );

  protected readonly track: Signal<IPlayerTrack | null> = computed<IPlayerTrack | null>(() =>
    this.isRadioMode() ? null : this.currentTrack(),
  );

  protected readonly coverUrl: Signal<string | null> = computed<string | null>(() => {
    const coverUrl: string | null = this.track()?.coverUrl ?? null;

    return coverUrl && !this.brokenCovers().has(coverUrl) ? coverUrl : null;
  });

  protected readonly isPlaying: Signal<boolean> = this.store.selectSignal(
    playerFeature.selectIsPlaying,
  );

  protected readonly isShuffled: Signal<boolean> = this.store.selectSignal(
    playerFeature.selectIsShuffled,
  );

  protected readonly repeatMode: Signal<RepeatModeEnum> = this.store.selectSignal(
    playerFeature.selectRepeatMode,
  );

  protected readonly hasNext: Signal<boolean> = this.store.selectSignal(
    playerFeature.selectHasNext,
  );

  protected readonly isLiked: Signal<boolean> = this.store.selectSignal(
    playerFeature.selectIsCurrentTrackLiked,
  );

  protected readonly currentTime: Signal<number> = this.audioPlayerService.currentTime;

  protected readonly duration: Signal<number> = this.audioPlayerService.duration;

  protected readonly currentTimeLabel: Signal<string> = computed<string>(() =>
    formatPlaybackTime(this.currentTime()),
  );

  protected readonly durationLabel: Signal<string> = computed<string>(() =>
    formatPlaybackTime(this.duration()),
  );

  protected readonly progressPercent: Signal<number> = computed<number>(() =>
    this.duration() > Constants.ZERO
      ? Math.min((this.currentTime() / this.duration()) * Constants.PERCENT, Constants.PERCENT)
      : Constants.ZERO,
  );

  protected readonly playIconClass: Signal<string> = computed<string>(() =>
    this.isPlaying() ? Constants.PLAYER_PAUSE_ICON_CLASS : Constants.PLAYER_PLAY_ICON_CLASS,
  );

  protected readonly playLabel: Signal<TranslationKey> = computed<TranslationKey>(() =>
    this.isPlaying() ? Constants.PLAYER_PAUSE_LABEL : Constants.PLAYER_PLAY_LABEL,
  );

  protected readonly isRepeatActive: Signal<boolean> = computed<boolean>(
    () => this.repeatMode() !== RepeatModeEnum.OFF,
  );

  protected readonly isRepeatOne: Signal<boolean> = computed<boolean>(
    () => this.repeatMode() === RepeatModeEnum.ONE,
  );

  protected readonly repeatLabel: Signal<TranslationKey> = computed<TranslationKey>(
    () => REPEAT_MODE_LABELS[this.repeatMode()],
  );

  protected readonly likeIconClass: Signal<string> = computed<string>(() =>
    this.isLiked() ? Constants.PLAYER_LIKED_ICON_CLASS : Constants.PLAYER_LIKE_ICON_CLASS,
  );

  public onPlayToggle(): void {
    this.store.dispatch(AudioPlayerActions.playToggled());
  }

  public onPrevious(): void {
    if (this.currentTime() > Constants.PLAYER_RESTART_THRESHOLD_SECONDS || !this.hasPrevious()) {
      this.audioPlayerService.seek(Constants.ZERO);
      return;
    }

    this.store.dispatch(AudioPlayerActions.previousClicked());
  }

  public onNext(): void {
    this.store.dispatch(AudioPlayerActions.nextClicked());
  }

  public onShuffleToggle(): void {
    this.store.dispatch(AudioPlayerActions.shuffleToggled());
  }

  public onRepeatToggle(): void {
    this.store.dispatch(AudioPlayerActions.repeatToggled());
  }

  public onLikeToggle(): void {
    this.store.dispatch(AudioPlayerActions.likeToggled());
  }

  public onSeek(event: Event): void {
    this.audioPlayerService.seek(Number((event.target as HTMLInputElement).value));
  }

  public onCoverError(coverUrl: string): void {
    this.brokenCovers.update((covers: ReadonlySet<string>) => new Set([...covers, coverUrl]));
  }
}
