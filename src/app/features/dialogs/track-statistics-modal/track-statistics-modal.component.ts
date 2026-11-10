import { Component, inject } from '@angular/core';
import { DIALOG_DATA } from '@angular/cdk/dialog';
import { rxResource } from '@angular/core/rxjs-interop';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { TranslatePipe } from '../../../shared/pipes/translate/translate.pipe';
import { CompactNumberPipe } from '../../../shared/pipes/compact-number/compact-number.pipe';
import { RelativeTimePipe } from '../../../shared/pipes/relative-time/relative-time.pipe';
import { TrackService } from '../../services/track-service/track.service';

import type { ResourceRef } from '@angular/core';
import type { ITrackStatistics } from '../../../core/models/track.model';
import type { ITrackDialogData } from '../../models/track-dialog.model';

@Component({
  selector: 'app-track-statistics-modal',
  imports: [ButtonComponent, SpinnerComponent, TranslatePipe, CompactNumberPipe, RelativeTimePipe],
  templateUrl: './track-statistics-modal.component.html',
  styleUrl: './track-statistics-modal.component.scss',
})
export class TrackStatisticsModalComponent {
  private readonly trackService: TrackService = inject(TrackService);

  protected readonly data: ITrackDialogData = inject<ITrackDialogData>(DIALOG_DATA);

  protected readonly statistics: ResourceRef<ITrackStatistics | undefined> = rxResource({
    params: () => this.data.trackId,
    stream: ({ params }: { params: number }) => this.trackService.getStatistics(params),
  });
}
