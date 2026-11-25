import { Component, input, output, signal } from '@angular/core';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { Constants } from '../../../../core/constants/constants';
import { formatPlaybackTime } from '../../../../shared/helpers/player/player.helpers';
import { CompactNumberPipe } from '../../../../shared/pipes/compact-number/compact-number.pipe';
import { TranslatePipe } from '../../../../shared/pipes/translate/translate.pipe';

import type { InputSignal, OutputEmitterRef, WritableSignal } from '@angular/core';
import type { ITrack } from '../../../../core/models/track.model';

@Component({
  selector: 'app-profile-tracks',
  templateUrl: './profile-tracks.component.html',
  styleUrl: './profile-tracks.component.scss',
  imports: [EmptyStateComponent, CompactNumberPipe, TranslatePipe],
})
export class ProfileTracksComponent {
  public readonly tracks: InputSignal<readonly ITrack[] | null> = input<readonly ITrack[] | null>(
    null,
  );

  public readonly hasMore: InputSignal<boolean> = input<boolean>(false);

  public readonly isLoading: InputSignal<boolean> = input<boolean>(false);

  public readonly canPlay: InputSignal<boolean> = input<boolean>(false);

  public readonly currentTrackId: InputSignal<number | null> = input<number | null>(null);

  public readonly isPlaying: InputSignal<boolean> = input<boolean>(false);

  public readonly playToggled: OutputEmitterRef<ITrack> = output<ITrack>();

  public readonly moreClicked: OutputEmitterRef<void> = output();

  protected readonly brokenCovers: WritableSignal<ReadonlySet<string>> = signal<
    ReadonlySet<string>
  >(new Set<string>());

  protected readonly playIconClass: string = Constants.PLAYER_PLAY_ICON_CLASS;

  protected readonly pauseIconClass: string = Constants.PLAYER_PAUSE_ICON_CLASS;

  protected readonly likeIconClass: string = Constants.PLAYER_LIKE_ICON_CLASS;

  protected readonly likedIconClass: string = Constants.PLAYER_LIKED_ICON_CLASS;

  protected durationLabel(seconds: number | null): string {
    return seconds === null ? Constants.EMPTY_VALUE_DASH : formatPlaybackTime(seconds);
  }

  public onCoverError(coverUrl: string): void {
    this.brokenCovers.update((covers: ReadonlySet<string>) => new Set([...covers, coverUrl]));
  }
}
