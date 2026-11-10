import { Component, input, output, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Constants } from '../../../../core/constants/constants';
import { GENRE_LABELS, TRACK_STATUS_LABELS } from '../../../constants/my-uploads.constant';
import { TranslatePipe } from '../../../../shared/pipes/translate/translate.pipe';
import { DateTimePipe } from '../../../../shared/pipes/date-time/date-time.pipe';

import type { InputSignal, OutputEmitterRef, WritableSignal } from '@angular/core';
import type { ITrack } from '../../../../core/models/track.model';
import type { TrackStatus } from '../../../../core/types/track-status.type';
import type { TranslationKey } from '../../../../core/types/translation.type';

@Component({
  selector: 'app-uploads-table',
  templateUrl: './uploads-table.component.html',
  styleUrl: './uploads-table.component.scss',
  imports: [NgTemplateOutlet, TranslatePipe, DateTimePipe],
})
export class UploadsTableComponent {
  public readonly tracks: InputSignal<readonly ITrack[]> = input.required<readonly ITrack[]>();

  public readonly currentTrackId: InputSignal<number | null> = input<number | null>(null);

  public readonly isPlaying: InputSignal<boolean> = input<boolean>(false);

  public readonly canPlay: InputSignal<boolean> = input<boolean>(false);

  public readonly isLoading: InputSignal<boolean> = input<boolean>(false);

  public readonly playToggled: OutputEmitterRef<ITrack> = output<ITrack>();

  protected readonly brokenCovers: WritableSignal<ReadonlySet<string>> = signal<
    ReadonlySet<string>
  >(new Set<string>());

  protected readonly playIconClass: string = Constants.PLAYER_PLAY_ICON_CLASS;

  protected readonly pauseIconClass: string = Constants.PLAYER_PAUSE_ICON_CLASS;

  protected statusLabel(status: TrackStatus): TranslationKey {
    return TRACK_STATUS_LABELS[status];
  }

  protected genreLabel(genre: string): TranslationKey | null {
    return GENRE_LABELS.get(genre) ?? null;
  }

  public onCoverError(coverUrl: string): void {
    this.brokenCovers.update((covers: ReadonlySet<string>) => new Set([...covers, coverUrl]));
  }
}
