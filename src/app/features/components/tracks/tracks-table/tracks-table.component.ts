import { Component, input, output, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Constants } from '../../../../core/constants/constants';
import { SortDirectionEnum } from '../../../../core/enums/sort-direction.enum';
import {
  GENRE_LABELS,
  SORT_ICON_CLASSES,
  TRACK_STATUS_LABELS,
  UNSORTED_ICON_CLASS,
} from '../../../constants/my-uploads.constant';
import { formatPlaybackTime } from '../../../../shared/helpers/player/player.helpers';
import { CompactNumberPipe } from '../../../../shared/pipes/compact-number/compact-number.pipe';
import { TranslatePipe } from '../../../../shared/pipes/translate/translate.pipe';
import { DateTimePipe } from '../../../../shared/pipes/date-time/date-time.pipe';
import { TrackActionsMenuComponent } from '../track-actions-menu/track-actions-menu.component';

import type { InputSignal, OutputEmitterRef, WritableSignal } from '@angular/core';
import type { ITrack } from '../../../../core/models/track.model';
import type { ITrackActionRequest } from '../../../models/track-action-option.model';
import type { ITracksTableConfig } from '../../../models/tracks-table.model';
import type { TrackStatus } from '../../../../core/types/track-status.type';
import type { TranslationKey } from '../../../../core/types/translation.type';

@Component({
  selector: 'app-tracks-table',
  templateUrl: './tracks-table.component.html',
  styleUrl: './tracks-table.component.scss',
  imports: [
    NgTemplateOutlet,
    TranslatePipe,
    DateTimePipe,
    CompactNumberPipe,
    TrackActionsMenuComponent,
  ],
})
export class TracksTableComponent<TSort extends string> {
  public readonly tracks: InputSignal<readonly ITrack[]> = input.required<readonly ITrack[]>();

  public readonly config: InputSignal<ITracksTableConfig<TSort>> =
    input.required<ITracksTableConfig<TSort>>();

  public readonly activeSort: InputSignal<TSort> = input.required<TSort>();

  public readonly direction: InputSignal<SortDirectionEnum> = input<SortDirectionEnum>(
    SortDirectionEnum.DESC,
  );

  public readonly currentTrackId: InputSignal<number | null> = input<number | null>(null);

  public readonly isPlaying: InputSignal<boolean> = input<boolean>(false);

  public readonly canPlay: InputSignal<boolean> = input<boolean>(false);

  public readonly isLoading: InputSignal<boolean> = input<boolean>(false);

  public readonly playToggled: OutputEmitterRef<ITrack> = output<ITrack>();

  public readonly sortSelected: OutputEmitterRef<TSort> = output<TSort>();

  public readonly actionSelected: OutputEmitterRef<ITrackActionRequest> =
    output<ITrackActionRequest>();

  protected readonly brokenCovers: WritableSignal<ReadonlySet<string>> = signal<
    ReadonlySet<string>
  >(new Set<string>());

  protected readonly emptyValue: string = Constants.EMPTY_VALUE_DASH;

  protected readonly playIconClass: string = Constants.PLAYER_PLAY_ICON_CLASS;

  protected readonly pauseIconClass: string = Constants.PLAYER_PAUSE_ICON_CLASS;

  protected readonly likeIconClass: string = Constants.PLAYER_LIKE_ICON_CLASS;

  protected readonly likedIconClass: string = Constants.PLAYER_LIKED_ICON_CLASS;

  protected sortIconClass(sort: TSort): string {
    return sort === this.activeSort() ? SORT_ICON_CLASSES[this.direction()] : UNSORTED_ICON_CLASS;
  }

  protected ariaSort(sort: TSort): string {
    if (sort !== this.activeSort()) {
      return Constants.ARIA_SORT_NONE;
    }

    return this.direction() === SortDirectionEnum.ASC
      ? Constants.ARIA_SORT_ASCENDING
      : Constants.ARIA_SORT_DESCENDING;
  }

  protected durationLabel(seconds: number | null): string {
    return seconds === null ? Constants.EMPTY_VALUE_DASH : formatPlaybackTime(seconds);
  }

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
