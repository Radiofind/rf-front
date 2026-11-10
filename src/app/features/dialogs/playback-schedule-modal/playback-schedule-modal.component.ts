import { Component, inject } from '@angular/core';
import { DIALOG_DATA } from '@angular/cdk/dialog';
import { rxResource } from '@angular/core/rxjs-interop';
import { Constants } from '../../../core/constants/constants';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { TranslatePipe } from '../../../shared/pipes/translate/translate.pipe';
import { DateTimePipe } from '../../../shared/pipes/date-time/date-time.pipe';
import { formatPlaybackTime } from '../../../shared/helpers/player/player.helpers';
import { TrackService } from '../../services/track-service/track.service';

import type { ResourceRef } from '@angular/core';
import type { IPlaybackSchedule } from '../../../core/models/track.model';
import type { ITrackDialogData } from '../../models/track-dialog.model';

@Component({
  selector: 'app-playback-schedule-modal',
  imports: [ButtonComponent, SpinnerComponent, TranslatePipe, DateTimePipe],
  templateUrl: './playback-schedule-modal.component.html',
  styleUrl: './playback-schedule-modal.component.scss',
})
export class PlaybackScheduleModalComponent {
  private readonly trackService: TrackService = inject(TrackService);

  protected readonly data: ITrackDialogData = inject<ITrackDialogData>(DIALOG_DATA);

  protected readonly schedule: ResourceRef<IPlaybackSchedule | undefined> = rxResource({
    params: () => this.data.trackId,
    stream: ({ params }: { params: number }) => this.trackService.getSchedule(params),
  });

  protected duration(seconds: number | null): string {
    return seconds === null ? Constants.EMPTY_VALUE_DASH : formatPlaybackTime(seconds);
  }
}
